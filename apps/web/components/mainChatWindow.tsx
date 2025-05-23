"use client"
import React, { useState, useEffect } from "react";
import { useAppSelector } from "@repo/store/hooks";
import InputMsgbox from "./inputMsgBox";
import ChatHistory from "./chatHistory";
import FilesSection from "./filesSection";

const MainChatWindow = () => {
const selectedChat = useAppSelector((state) => state.chat.selectedChat);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [disableSend, setDisableSend] = useState(false);
  return (
    <div className="flex-1 flex flex-col relative">
      <div className="text-center pt-4">
        <ChatHistory disableSend = {disableSend}/>
        </div>

      {/* Sticky Input Area */}
      {selectedChat && (
        <InputMsgbox disableSend={disableSend} setDisableSend = {setDisableSend}/>
      )}

      {/* Files Tab Button (Sticky on right) */}
      <div className="fixed right-0 top-1/3 transform -translate-y-1/2 z-40">
        <button
          className="bg-black text-white py-2 px-4 rounded-l-xl shadow-md hover:bg-gray-800 transition-all" onClick={() => setIsSidebarOpen(true)}
        >
          Files
        </button>
        <FilesSection isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
};

export default MainChatWindow;