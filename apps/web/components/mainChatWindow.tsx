"use client"
import React, { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@repo/store/hooks";

const MainChatWindow = () => {
const selectedChat = useAppSelector((state) => state.chat.selectedChat);
const [message, setMessage] = useState("");
const [showOptions, setShowOptions] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);
const textareaRef = useRef<HTMLTextAreaElement>(null);
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

useEffect(()=>{
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowOptions(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    }
},[]);

useEffect(() => {
    if (textareaRef.current){
        textareaRef.current.style.height = "auto";
        const scrollHeight = textareaRef.current.scrollHeight;
        const maxHeight = window.innerHeight * 0.2;
        textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
},[message]);
const handleSend = () => {
    if (!message.trim()) return;
    console.log(`Sending message: ${message} to chat ID: ${selectedChat?.id}`);
    setMessage("");
  };
  return (
    <div className="flex-1 flex flex-col relative">
      <div className="text-center pt-4">
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
                            {entry.finance_gpt}
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
        </div>


      {/* Sticky Input Area */}
      {selectedChat && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[70%] bg-white border border-gray-300 rounded-3xl p-3 shadow-lg flex flex-col gap-2">

          <div className="flex items-start gap-3 relative">
            {/* + Button & Dropdown */}
            <div className="relative self-end" ref={dropdownRef}>
              <button
                onClick={() => setShowOptions((prev) => !prev)}
                className="rounded-full bg-black text-white border p-2 text-lg font-bold"
              >
                +
              </button>
              {showOptions && (
                <div className="absolute bottom-[110%] left-0 w-40 bg-white border rounded shadow p-2 z-20">
                  <p className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">Add Text Context</p>
                  <p className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">Add PDF File</p>
                </div>
              )}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              style={{ maxHeight: "20vh", minHeight: "10vh" }}
              className="flex-1 resize-none overflow-auto  rounded px-4 py-2 focus:outline-none"
              placeholder="Ask anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              className="bg-black text-white px-4 py-2 rounded self-end"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainChatWindow;