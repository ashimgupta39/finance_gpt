import os
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


class agent_processor:
    def __init__(self):
        self.embeddings_client = OpenAIEmbeddings(
            model="text-embedding-3-large",
            openai_api_key=os.getenv("OPENAI_API_KEY"),
        )
        self.qdrant = QdrantClient(host="localhost", port=6333)
        self.vector_store = Qdrant(
            client=self.qdrant,
            collection_name=os.getenv("COLLECTION_NAME"),
            embeddings=self.embeddings_client,
        )
        self.retriever = self.vector_store.as_retriever()
        self.search = SerpAPIWrapper(serpapi_api_key=os.getenv("SERP_API_KEY"))

        self.llm = ChatOpenAI(
            model="gpt-4o-mini", openai_api_key=os.getenv("OPENAI_API_KEY")
        )

        self.retriever_tool = Tool.from_function(
            func=lambda query: str(
                self.retriever.get_relevant_documents(query)
            ),
            name="Qdrant Vector Search",
            description="Use this when the question relates to previous call transcripts or stored context.",
        )

        self.search_tool = Tool.from_function(
            func=lambda query: (
                json.dumps(self.search.run(query), indent=2)
                if isinstance(self.search.run(query), dict)
                else str(self.search.run(query))
            ),
            name="Google Search",
            description="Use this for real-time information not found in stored data.",
        )

        self.llm_tool = Tool.from_function(
            func=lambda query: (
                json.dumps(self.llm.predict(query))
                if isinstance(self.llm.predict(query), dict)
                else str(self.llm.predict(query))
            ),
            name="OpenAI LLM",
            description="Use this for general conversational responses or when no context is needed.",
        )

        self.agent = initialize_agent(
            tools=[
                self.retriever_tool,
                self.search_tool,
                self.llm_tool,
            ],
            llm=self.llm,
            agent="conversational-react-description",
            memory=ConversationSummaryMemory(
                llm=self.llm,
                memory_key="chat_history",
                return_messages=True,
            ),
        )

    def run_agent(self, query: str, chat_history: list) -> str:

        response = self.agent.run(query)
        return response
