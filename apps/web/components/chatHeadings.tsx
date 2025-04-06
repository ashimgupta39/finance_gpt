"use client";

import React from "react";

type Chat = {
    id: number,
    company: string;
}
type ChatHeadingsProps = {
    chats: Chat[];
}

const ChatHeadings = ({chats}:ChatHeadingsProps) => {
    
    return (
        <ul className="relative space-y-2 top-6">
            <li className=" p-3 my-2 bg-gray-100 rounded shadow hover:bg-gray-200 cursor-pointer">
                + New Chat
            </li>
            {chats.map((chat, index)=>{
                return(
                    <li className=" p-3 my-2 bg-gray-100 rounded shadow hover:bg-gray-200 cursor-pointer" key={index}>
                        {chat["company"]}
                    </li>
                )
            })}
        </ul>
    )
}

export default ChatHeadings;