"use client";

import React,{useState,useEffect} from "react";
import  ChatHeadings  from "./chatHeadings";
const Sidebar = () => {
    const [chats, setChats] = useState([]);
    useEffect( () => {
            const fetchChats = async () => {
                try{
                    const response = await fetch("http://localhost:8000/chat/allChatHeadings?username="+localStorage.getItem("email"), {
                        method: "GET",
                        credentials: "include"
                    });
                    if(!response.ok){
                        throw new Error("Network response was not ok");
                    }
                    const data = await response.json();
                    console.log("Chat headings:", data);
                    setChats(data["data"]);
                }
                catch(error){
                    console.error("Error fetching chat headings:", error);
                }
        }
        fetchChats();
    },[])
    return(
        <aside className="w-64 bg-gray-100 border-r border-gray-300 pt-4">
        <h2 className="relative text-xl font-bold text-center mb-4 top-4">Chats</h2>
        <div className="px-4">
            <ChatHeadings chats={chats} />
        </div>
        </aside>

    )
}
export default Sidebar;