from sqlalchemy import Column, Integer, String, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from database import Base  # Assuming you have a Base class from your database setup

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    profile_pic_url = Column(String,nullable=True)

    chats = relationship("Chat", back_populates="user")

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company = Column(String,nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chat_history = Column(JSONB, default=[])

    user = relationship("User", back_populates="chats")
    files = relationship("File", back_populates="chat")

class File(Base):
    __tablename__ = "files"

    id = Column(String, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    file_name = Column(String,nullable=False)
    file_type = Column(String, nullable=False)
    date_associated = Column(Date, nullable=False)  # Date associated with the file
    gcs_url = Column(Text, nullable=False)  # Google Cloud Storage public URL

    chat = relationship("Chat", back_populates="files")