"use client"
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@repo/store/hooks";
import ReactMarkdown from "react-markdown";

const ChatHistory = () => {
    const selectedChat = useAppSelector((state) => state.chat.selectedChat);
    const [chatHistory, setChatHistory] = useState<Array<{ user: string; finance_gpt: string }> | null>(null);
        useEffect( () => {
                const fetchChatHistory = async () => {
                    try{
                        const response = await fetch("http://localhost:8000/chat/chatHistory?chat_id="+selectedChat?.id, {
                            method: "GET",
                            credentials: "include"
                        });
                        if(!response.ok){
                            throw new Error("Network response was not ok");
                        }
                        const data = await response.json();
                        console.log("Chat history:", data);
                        setChatHistory(data);
                    }
                    catch(error){
                        console.error("Error fetching chat headings:", error);
                    }
            }
            if (selectedChat){
                fetchChatHistory();
            }
            
        },[selectedChat])

    return (
        <>
            {selectedChat ? (
                        <>
                        <p className="text-lg text-gray-600 mb-2">({selectedChat.company})</p>
            
                        {Array.isArray(chatHistory) && chatHistory.length > 0 ? (
                            <div className="h-[65vh] overflow-y-auto pr-2"> 
                            <div className="space-y-4 text-left">
                            {chatHistory.map((entry: any, index: number) => (
                                <div key={index} className="flex flex-col gap-2">
                                    {/* User Message */}
                                    <div className="flex justify-end">
                                    <div className="ml-auto max-w-[50%] bg-gray-100 rounded-2xl p-3 mr-[15%] text-gray-800">
                                        {entry.user}
                                    </div>
                                    </div>
            
                                    {/* Finance GPT Message */}
                                    <div className="flex justify-center">
                                    <div className="w-full max-w-[70%] p-3 text-gray-800">
                                        <ReactMarkdown>{entry.finance_gpt}</ReactMarkdown>
                                    </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>
                        ) : (
                            <p className="text-gray-600">What's on your mind?</p>
                        )}
                        </>
                    ) : (
                        <p className="text-lg text-gray-600">
                        Select a chat from the sidebar to continue.
                        </p>
                    )}
        </>
    )
}
export default ChatHistory;