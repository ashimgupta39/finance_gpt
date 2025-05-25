from fastapi import UploadFile, HTTPException
from google.cloud import storage
import os
import pdfplumber
import tiktoken
from openai import OpenAI
from dotenv import load_dotenv
import re
import json
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Distance, VectorParams
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from langchain.vectorstores import Qdrant
from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationSummaryMemory
from langchain.agents import initialize_agent
from langchain.tools import Tool
from langchain_community.utilities import SerpAPIWrapper

load_dotenv()


class embeddings_processor:
    def __init__(self):
        self.COLLECTION_NAME = os.getenv("COLLECTION_NAME")
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.SERP_API_KEY = os.getenv("SERP_API_KEY")
        self.openai_client = OpenAI(api_key=self.OPENAI_API_KEY)
        self.search = SerpAPIWrapper(serpapi_api_key=self.SERP_API_KEY)
        self.qdrant = QdrantClient(host="localhost", port=6333)

        try:
            self.qdrant.get_collection(self.COLLECTION_NAME)
        except:
            self.qdrant.recreate_collection(
                collection_name=self.COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=3072,  # Match the embedding size of `text-embedding-3-large`
                    distance=Distance.COSINE,
                ),
            )

    def extract_text_from_pdf(self, file: UploadFile) -> str:
        text = ""
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text

    def count_tokens(self, text):
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))

    def split_by_speakers(self, text):
        sections = re.split(r"\b\w*\s*\w*\b[:]", text)
        return [s.strip() for s in sections if s.strip()]

    def split_equally(self, text: str, chunk_size: int = 100) -> list:
        # Split the text into chunks of approximately equal size of 200 words-
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i : i + chunk_size])
            chunks.append(chunk)
        return chunks

    def split_text_into_chunks(
        self, text: str, date_associated: str, chunk_size: int = 800
    ) -> list:
        structured_chunks = self.split_by_speakers(text)
        split_failed = False
        for chunk in structured_chunks:
            if len(chunk) > 800:
                split_failed = True
                break
        if split_failed == True:
            structured_chunks = self.split_equally(text, 200)
        MAX_TOKENS = chunk_size
        chunks = []
        current_chunk = ""

        for section in structured_chunks:
            if self.count_tokens(current_chunk + section) > MAX_TOKENS:
                chunks.append(
                    f"(date associated- {date_associated} )"
                    + current_chunk.strip()
                )
                current_chunk = section
            else:
                current_chunk += " " + section

        if current_chunk:
            chunks.append(
                f"(date associated - {date_associated}) "
                + current_chunk.strip()
            )

        return chunks

    def insert_embedding(
        self,
        file: UploadFile | str,
        date_associated: str,
        chat_id: str,
        file_id: str,
    ):
        if isinstance(file, UploadFile):
            # Extract text from PDF
            document_text = self.extract_text_from_pdf(file)
        else:
            document_text = file
        # Split text into chunks
        chunks = self.split_text_into_chunks(
            document_text, date_associated, 800
        )
        # Generate and store embeddings in Qdrant
        for i, chunk in enumerate(chunks):
            response = self.openai_client.embeddings.create(
                input=chunk, model="text-embedding-3-large"
            )
            embedding = response.data[0].embedding

            # Save to Qdrant
            self.qdrant.upsert(
                collection_name=self.COLLECTION_NAME,
                points=[
                    PointStruct(
                        id=i,
                        vector=embedding,
                        payload={
                            "page_content": chunks[i],
                            "file_id": file_id,
                            "chat_id": chat_id,
                            "date_associated": date_associated,
                        },  # Change key from 'text' to 'page_content'
                    )
                ],
            )

    def delete_embedding(self, fileID: str):
        # Delete embeddings from Qdrant
        try:
            self.qdrant.delete(
                collection_name=self.COLLECTION_NAME,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="file_id", match=MatchValue(value=fileID)
                        )
                    ]
                ),
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Qdrant Delete Error: {str(e)}"
            )
