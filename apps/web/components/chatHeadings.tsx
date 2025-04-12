"use client";

import React from "react";
import { useAppDispatch } from "@repo/store/hooks";
import {setSelectedChat} from "@repo/store/slices/chatSlice";

type Chat = {
    id: number,
    company: string;
}
type ChatHeadingsProps = {
    chats: Chat[];
}

const ChatHeadings = ({chats}:ChatHeadingsProps) => {
    const dispatch = useAppDispatch();
    const handleChatClick = (chat : Chat) =>{
        dispatch(setSelectedChat(chat));
    }
    return (
        <ul className="relative space-y-2 top-6">
                <li className=" p-3 my-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">
                <b>+ New Chat</b>
            </li>
            {chats.map((chat, index)=>{
                return(
                    <li className="relative p-3 my-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer" key={index} data-chat-id={chat["id"]} onClick = {() => handleChatClick(chat)}>
                        {chat["company"]}
                    </li>
                )
            })}
        </ul>
    )
}

export default ChatHeadings;