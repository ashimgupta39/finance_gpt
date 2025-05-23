"use client"
import React, { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@repo/store/hooks";
import ReactMarkdown from "react-markdown";
import AnimatedMarkdown from "./AnimatedMarkdown";
import {setAllChats, setAnimateLastChat} from "@repo/store/slices/chatHistorySlice";

type InputMsgboxProps = {
  disableSend: boolean;
};

const ChatHistory = ({disableSend}: InputMsgboxProps) => {
    const selectedChat = useAppSelector((state) => state.chat.selectedChat);
    const chatHistoryAllChats = useAppSelector((state) => state.chatHistory.allChats)
    const isAnimateLastChat = useAppSelector((state) => state.chatHistory.isAnimateLastChat);
    const dispatch = useAppDispatch();
    const [chatHistory, setChatHistory] = useState<Array<{ user: string; finance_gpt: string }> | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
        useEffect(() => {
            if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, [chatHistoryAllChats]);
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
                        dispatch(setAllChats(data));
                    }
                    catch(error){
                        console.error("Error fetching chat headings:", error);
                    }
            }
            if (selectedChat && selectedChat.id !== undefined){
                dispatch(setAnimateLastChat(false));
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
                            {chatHistoryAllChats.map((entry: any, index: number) => {
                                const isLast = index === chatHistoryAllChats.length - 1;
                                const isAnimating = isLast && isAnimateLastChat === true;

                                return (
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
                                        {entry.finance_gpt === "Fetching Response..." ? (
                                            <div className="animate-pulse space-y-2">
                                            Fetching Response...
                                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                                            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                            </div>
                                        ) : isAnimating ? (
                                            <AnimatedMarkdown text={entry.finance_gpt} />
                                        ) : (
                                            <ReactMarkdown>{entry.finance_gpt}</ReactMarkdown>
                                        )}
                                        </div>
                                    </div>
                                    </div>
                                );
                                })}
                                <div ref={messagesEndRef} />
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