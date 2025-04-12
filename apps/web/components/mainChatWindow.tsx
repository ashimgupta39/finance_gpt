"use client"

import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@repo/store/hooks";

const MainChatWindow = () => {
const selectedChat = useAppSelector((state) => state.chat.selectedChat);
return(
    <div className="flex-1 flex items-center justify-center">
    {selectedChat ?
        
    (
        <p className="text-lg text-gray-600">
            Selected chat is {selectedChat.company} with ID {selectedChat.id}
        </p>
    )
    :
    (
        <p className="text-lg text-gray-600">
            Select a chat from the sidebar to continue.
        </p>
    
    )}
    </div>
)
}

export default MainChatWindow;