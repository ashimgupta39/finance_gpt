import pdfplumber
import tiktoken
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
import json
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Distance, VectorParams
from langchain.vectorstores import Qdrant
from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationSummaryMemory
from langchain.agents import initialize_agent
from langchain.tools import Tool
from langchain_community.utilities import SerpAPIWrapper


# Load API keys
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)
search = SerpAPIWrapper(serpapi_api_key=os.getenv("SERP_API_KEY"))

# Qdrant setup
qdrant = QdrantClient(host="localhost", port=6333)

# Create collection if not exists
COLLECTION_NAME = "finance_gpt"

try:
    qdrant.get_collection(COLLECTION_NAME)
except:
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=3072,  # Match the embedding size of `text-embedding-3-large`
            distance=Distance.COSINE,
        )
    )

# PDF Path
pdf_path = "/Users/ashimgupta/Documents/webd_projects/concall-automation/zomato.pdf"

# Tokenizer for counting tokens
def count_tokens(text):
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

document_text = extract_text_from_pdf(pdf_path)

# Split by speakers
def split_by_speakers(text):
    sections = re.split(r"\b\w*\s*\w*\b[:]", text)
    return [s.strip() for s in sections if s.strip()]

structured_chunks = split_by_speakers(document_text)

# Chunking text for embedding (~800 tokens per chunk)
MAX_TOKENS = 800
chunks = []
current_chunk = ""

for section in structured_chunks:
    if count_tokens(current_chunk + section) > MAX_TOKENS:
        chunks.append(current_chunk)
        current_chunk = section
    else:
        current_chunk += " " + section

if current_chunk:
    chunks.append(current_chunk)

# Generate and store embeddings in Qdrant
for i, chunk in enumerate(chunks):
    response = client.embeddings.create(
        input=chunk,
        model="text-embedding-3-large"
    )
    embedding = response.data[0].embedding

    # Save to Qdrant
    qdrant.upsert(
    collection_name=COLLECTION_NAME,
    points=[
        PointStruct(
            id=i,
            vector=embedding,
            payload={"page_content": chunks[i]}  # Change key from 'text' to 'page_content'
        )
    ]
)

print(f"✅ Successfully stored {len(chunks)} chunks in Qdrant!")


# Langchain part begins from here -
embeddings = OpenAIEmbeddings(model="text-embedding-3-large",openai_api_key=os.getenv("OPENAI_API_KEY"))

vector_store = Qdrant(
    client=qdrant,
    collection_name=COLLECTION_NAME,
    embeddings=embeddings
)
retriever = vector_store.as_retriever()

llm = ChatOpenAI(model="gpt-4o-mini", openai_api_key=os.getenv("OPENAI_API_KEY"))

# memory = ConversationSummaryMemory(llm=llm, memory_key="chat_history")


retriever_tool = Tool.from_function(
    func=lambda query: str(retriever.get_relevant_documents(query)),
    name="Qdrant Vector Search",
    description="Use this when the question relates to previous call transcripts or stored context."
)

search_tool = Tool.from_function(
    func=lambda query: json.dumps(search.run(query), indent=2) if isinstance(search.run(query), dict) else str(search.run(query)),
    name="Google Search",
    description="Use this for real-time information not found in stored data."
)

llm_tool = Tool.from_function(
    func=lambda query: json.dumps(llm.predict(query)) if isinstance(llm.predict(query), dict) else str(llm.predict(query)),
    name="OpenAI LLM",
    description="Use this for general conversational responses or when no context is needed."
)


agent = initialize_agent(
    tools=[retriever_tool, search_tool, llm_tool],
    llm=llm, 
    agent="conversational-react-description",
    memory=ConversationSummaryMemory(
        llm=llm, 
        memory_key="chat_history",  # Stores past conversations
        return_messages=True        # Returns messages for better response handling
    ),
    verbose=True,
    handle_parsing_errors=True
)
response = agent.run("""
answer the following questions regarding zomato based on the concall transcript provided and embeddings of which are present in qdrant db and the information present on the internet in the following-
Second Last Quarter(avg/good/bad)-

Latest Quarter(avg/good/bad)-

Long term profit uptrend(Yes/No)-

Short term profit uptrend(Yes/No)-

Special Situation(Yes/No with description)-

Futuristic Sector(Yes/No)-

Future Visibility(Yes/No)-

Guidence(%)-


Management Outlook-

Growth Mindset and Humbleness(Yes/No with explaination)-

Concalls Judgement about the management commentory in the concall(list of green and red flags)-

is the management walking the talk or are they trying to fool the investors?
Industry Analysis-

1. Industry tailwinds and headwinds(Tailwind or headwind with description)-
2. Exit triggers-

Opportunity-

1. Growth Drivers(List)-
2. Timeframe of the opportunity-
3. Potential Upside in earnings-

Why should we buy?-

Key Tracking Metrics?-

When to sell(according to the risks detected, what are the exit triggers)?-

What to do if the stock falls more than 10-15\% in coming week(given the current situation fundamentally of the stock should we hold or exit? give explaination)-
 """)


# with open("/Users/ashimgupta/Documents/webd_projects/concall-automation/output.txt","w", encoding="utf-8") as file:
#     file.write(json.dumps(response))
#     print("response saved")
print(response)