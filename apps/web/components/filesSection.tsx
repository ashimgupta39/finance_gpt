"use client"
import React,{useState,useEffect} from "react";
import {FiX} from "react-icons/fi";
import { useAppSelector,useAppDispatch } from "@repo/store/hooks";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { setFileFetchRefreshTrigger } from "@repo/store/slices/filesFetchTriggers";
import { setCurrentMessage } from "@repo/store/slices/chatHistorySlice";

type Props = {
    isOpen: boolean;
    onClose: () => void;
}
const FilesSection: React.FC<Props> = ({ isOpen, onClose }) => {
    const [fileList, setFileList] = useState([]);
    const dispatch = useAppDispatch();
    const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
    const selectedChat = useAppSelector((state) => state.chat.selectedChat);
    const fileFetchRefreshTrigger = useAppSelector((state) => state.fileFetchRefreshTrigger.triggerValue);

    useEffect(() => {
        // fetch the file list from the server
        const fetchFiles = async () => {
            try{
                const response = await fetch("http://localhost:8000/file/getFiles?chatID="+selectedChat?.id, {
                    method: "GET",
                    credentials: "include"
                });
                if(!response.ok){
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                console.log("File list:", data);
                setFileList(data);
                dispatch(setFileFetchRefreshTrigger(false));
            }
            catch(error){
                console.error("Error fetching file list:", error);
            }
        }
        if (fileFetchRefreshTrigger=== true || (selectedChat?.id)!==undefined){
            fetchFiles();
        }
    },[fileFetchRefreshTrigger,selectedChat?.id])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          const target = event.target as HTMLElement;
          
          // If click is not inside any dropdown button or menu
          if (
            !target.closest(".dropdown-toggle") &&
            !target.closest(".dropdown-menu")
          ) {
            setDropdownOpenId(null);
          }
        }
      
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

    const handleDelete = async (fileId: string) => {
        try {
            const response = await fetch(`http://localhost:8000/file/deleteFile?fileID=${fileId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error("Failed to delete file");
            }
            // setFileList(prev => prev.filter(file => file.id !== fileId));
            dispatch(setFileFetchRefreshTrigger(true));
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };
    const handleCompute = () => {
      dispatch(setCurrentMessage(`Give the report of this company in the following format:
          Second Last Quarter(avg/good/bad)-

          Latest Quarter(avg/good/bad)-

          Long term profit uptrend(Yes/No)-

          Short term profit uptrend(Yes/No)-

          Special Situation(Yes/No with description)-

          Futuristic Sector(Yes/No)-

          Future Visibility(Yes/No)-

          Guidence(%)-

          Current PE Ratio-

          Current PEG ratio-

          Management Outlook-

          Fraud or Scam(Yes/No)-

          Growth Mindset and Humbleness(Yes/No with explaination)-

          Salary Reasonable(Yes/No)-

          Glassdoor Rating(Rating)-

          Glassdoor Recommended to friend(%)-

          Concalls Judgement(description)-

          Industry Analysis-

          1. Industry tailwinds and headwinds(Tailwind or headwind with description)-
          2. Crisil Rating and Risks(Rating and description)-
          3. Exit triggers-

          Opportunity-

          1. Growth Drivers(List)-
          2. Timeframe of the opportunity-
          3. Potential Upside in earnings-

          Why are we buying?-

          Key Tracking Metrics?-

          Potential reasons/triggers to sell?-
        `));
      onClose();
    }
    return (
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-gray-50 shadow-lg border-l transition-transform duration-300 z-50 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b bg-gray-100">
            <h2 className="text-lg font-semibold bg-gray-100">Uploaded Files</h2>
            <button onClick={onClose}>
              <FiX className="text-xl bg-gray-100" />
            </button>
          </div>
    
          <div className="p-4 bg-gray-100 flex flex-col gap-3 overflow-y-auto max-h-[40vh]">
          {fileList.length > 0 ? (
          fileList.map((file: any, idx) => (
            <div
              key={file.id}
              className="flex flex-col bg-white shadow-md p-3 rounded hover:shadow-lg transition-shadow"
            >
              {/* File Name (Clickable) */}
              <a
                href={file.gcs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline truncate"
              >
                {file.file_name}
              </a>
              {/* Date Associated */}
              <span className="text-sm text-gray-500">
                {new Date(file.date_associated).toLocaleDateString()}
              </span>
              <div className="relative">
              <button
                onClick={() => {
                    setDropdownOpenId(dropdownOpenId === file.id ? null : file.id);
                }}
                className="dropdown-toggle text-gray-600 hover:text-gray-900"
                >
                <HiOutlineDotsVertical />
                </button>

                {dropdownOpenId === file.id && (
                <div className="dropdown-menu absolute mt-1 w-28 bg-white shadow-lg border rounded z-10">
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(file.id);
                    }}
                    className="w-full text-left px-1 py-1 hover:bg-red-50 text-red-600"
                    >
                    Delete
                    </button>
                </div>
                )}
            </div>
            </div>
            
          ))
        ) : (
          <p className="text-gray-500 text-center">No files uploaded yet.</p>
        )}
          </div>
    
          <div className="bottom-3 bg-gray-100 left-0 w-full px-4">
            <button className="w-full bg-black text-white py-2 my-3 rounded hover:bg-gray-900" onClick={() =>handleCompute()}>
              Compute Report
            </button>
          </div>
        </div>
      );
}

export default FilesSection;