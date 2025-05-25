"use client"
import React,{useEffect, useRef, useState} from "react";
import { useAppSelector, useAppDispatch } from "@repo/store/hooks";
import UploadPopup from "./uploadPDFPopup";
import UploadTextPopup from "./uploadTextPopup";
import {setFileFetchRefreshTrigger} from "@repo/store/slices/filesFetchTriggers";
import { addChat,removeLastChat, setAnimateLastChat, setCurrentMessage } from "@repo/store/slices/chatHistorySlice";

type InputMsgboxProps = {
  disableSend: boolean;
  setDisableSend: React.Dispatch<React.SetStateAction<boolean>>;
};

const InputMsgbox = ({disableSend,setDisableSend}: InputMsgboxProps) =>{
    const [showOptions, setShowOptions] = useState(false);
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [uploadType, setUploadType] = useState("");
    const message = useAppSelector((state) => state.chatHistory.currentMessage);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const selectedChat = useAppSelector((state) => state.chat.selectedChat);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (textareaRef.current){
            textareaRef.current.style.height = "auto";
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = window.innerHeight * 0.2;
            textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    },[message]);

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

    const handleSend = () => {
        if (!message.trim()) return;
        setDisableSend(true);
        dispatch(addChat({
          "user": message,
          "finance_gpt": "Fetching Response..."
        }))
        dispatch(setAnimateLastChat(true));
        console.log(`Sending message: ${message}`);
        const formData = new FormData();
        formData.append("query", message);
        formData.append("chat_id", selectedChat?.id.toString() || "");
        fetch("http://localhost:8000/agent/query",{
            method: "POST",
            credentials: "include",
            body: formData,
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Response:", data);
            // For example, you can update the chat history in your state
            dispatch(removeLastChat());
            dispatch(addChat({
              "user": message,
              "finance_gpt":data
            }));
            setDisableSend(false);
        })
        .catch((error) => {
            console.error("Error sending message:", error);
            setDisableSend(false);
        });
        dispatch(setCurrentMessage(""));
        
      };
      const formatDateToMMDDYYYY = (isoDate: string) => {
        const [year, month, day] = isoDate.split("-");
        return `${month}-${day}-${year}`;
      };
      const handleUpload = (file: File, date: string) => {
        console.log("Uploaded file:", file);
        console.log("Associated date:", date);
        // Here you can now upload to your backend with file+date
        const formData = new FormData();
        formData.append("file", file);
        formData.append("date_associated", formatDateToMMDDYYYY(date));
        formData.append("chat_id", selectedChat?.id.toString() || "");
        fetch("http://localhost:8000/file/uploadPdfFile", {
          method: "POST",
          credentials: "include",
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("File uploaded successfully:", data);
            dispatch(setFileFetchRefreshTrigger(true));
          })
          .catch((error) => {
            console.error("Error uploading file:", error);
          });

      };
      const handleTextUpload = (text: string, fileName:string, date: string) => {
        console.log("Uploaded text:", text);
        console.log("Associated date:", date);
        const formData = new FormData();
        formData.append("text", text);
        formData.append("file_name", fileName);
        formData.append("date_associated", formatDateToMMDDYYYY(date));
        formData.append("chat_id", selectedChat?.id.toString() || "");
        fetch("http://localhost:8000/file/uploadTextFile", {
          method: "POST",
          credentials: "include",
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("File uploaded successfully:", data);
            dispatch(setFileFetchRefreshTrigger(true));
          })
          .catch((error) => {
            console.error("Error uploading file:", error);
          });
      };

    return(
        <>
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
                  <p className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"  onClick={()=> {setShowOptions(false);setShowUploadPopup(true);setUploadType("text")}}>Add Text Context</p>
                  <p className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" onClick={()=> {setShowOptions(false);setShowUploadPopup(true);setUploadType("file")}}>Add PDF File</p>
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
              onChange={(e) => dispatch(setCurrentMessage(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }
              }
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled = {disableSend}
              className={`${disableSend? "bg-gray-500 cursor-not-allowed" : "bg-black"} text-white px-4 py-2 rounded self-end`}
            >
              Send
            </button>
          </div>
        </div>

        {/* Upload Popup */}
        {showUploadPopup && (
            uploadType === "file" ? (
            <UploadPopup
            onClose={() => setShowUploadPopup(false)}
            onUpload={handleUpload}
            />
            ) : (
                uploadType=="text" && (<UploadTextPopup
                onClose={() => setShowUploadPopup(false)}
                onUpload={handleTextUpload}
                />)
            )
        )}
        </>
    )
}

export default InputMsgbox;