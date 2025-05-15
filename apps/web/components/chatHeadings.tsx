"use client";

import React,{useState} from "react";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import {setSelectedChat,addChat} from "@repo/store/slices/chatSlice";

type Chat = {
    id: number,
    company: string;
}
type ChatHeadingsProps = {
    chats: Chat[];
}

const ChatHeadings = ({chats}:ChatHeadingsProps) => {
    const dispatch = useAppDispatch();
    const [newChatModalOpen, setNewChatModalOpen] = useState(false);
    const [newChatName, setNewChatName] = useState("");
    const selectedChat = useAppSelector((state) => state.chat.selectedChat);
    // const [isSelected,setIsSelected] = useState<boolean|null>(false);
    const handleChatClick = (chat : Chat) =>{
        dispatch(setSelectedChat(chat));
    }
    const handleNewChatClick = async() => {
        if (newChatName.trim() === "") return;
        console.log(`Creating new chat with name: ${newChatName}`);
        const formData = new FormData();
        formData.append("company", newChatName);
        const response = await fetch("http://localhost:8000/chat/createChat", {
            method: "POST",
            credentials: "include",
            body: formData
        });
        if (response.ok){
            const data = await response.json();
            console.log("New chat created:", data["data"]);
            dispatch(addChat(data["data"]));
            dispatch(setSelectedChat(data["data"][0]));
        }
        else{
            console.error("Error creating new chat");
        }
        setNewChatModalOpen(false);
        setNewChatName("");
    }
    return (
        <>
        <ul className="relative space-y-2 top-6">
                <li className=" p-3 my-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer" onClick={() => setNewChatModalOpen(true)}>
                <b>+ New Chat</b>
            </li>
            {chats.map((chat, index)=>{
                const isSelected = selectedChat && selectedChat["id"] === chat["id"];
                return(
                    <li className={`relative p-3 my-2 ${isSelected?"bg-gray-200":"bg-gray-100"} rounded hover:bg-gray-200 cursor-pointer`} key={index} data-chat-id={chat["id"]} onClick = {() => handleChatClick(chat)}>
                        {chat["company"]}
                    </li>
                )
            })}
        </ul>
        {newChatModalOpen===true && (
            <div className="fixed inset-0 bg-opacity-40 border-gray-300 shadow-lg flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 w-96">
              <h2 className="text-xl font-semibold">Enter Company Name</h2>
              
              <input
                type="text"
                onChange={(e) => setNewChatName(e.target.value)}
                className="border p-2 rounded"
              />
      
              <div className="flex justify-end gap-2">
                <button onClick =  {() => setNewChatModalOpen(false)} className="px-4 py-2 rounded bg-gray-300">
                  Cancel
                </button>
                <button onClick={() => {handleNewChatClick()}} className={`px-4 py-2 rounded text-white ${!newChatName || !newChatName ? "bg-gray-500 cursor-not-allowed" : "bg-black"}`} disabled={!newChatName }>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
        </>
    )
}

export default ChatHeadings;