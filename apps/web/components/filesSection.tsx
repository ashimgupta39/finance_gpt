"use client"
import React from "react";
import {FiX,FiMoreVertical} from "react-icons/fi";

type Props = {
    isOpen: boolean;
    onClose: () => void;
}
const dummyFiles = [
  { name: "Financials_Q1.pdf" },
  { name: "Annual_Report_2023.xlsx" },
  { name: "Sales_Data.csv" },
];
const FilesSection: React.FC<Props> = ({ isOpen, onClose }) => {

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
    
          <div className="p-4 bg-gray-100 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
            {dummyFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
              >
                <span className="truncate">{file.name}</span>
                <FiMoreVertical className="cursor-pointer" />
              </div>
            ))}
          </div>
    
          <div className="bottom-3 bg-gray-100 left-0 w-full px-4">
            <button className="w-full bg-black text-white py-2 my-3 rounded hover:bg-gray-900">
              Compute Report
            </button>
          </div>
        </div>
      );
}

export default FilesSection;