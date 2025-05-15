"use client";
import React, { useState } from "react";

interface UploadTextPopupProps {
  onClose: () => void;
  onUpload: (text: string,fileName:string, date: string) => void;
}

const UploadTextPopup: React.FC<UploadTextPopupProps> = ({ onClose, onUpload }) => {
  const [textInput, setTextInput] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const handleUploadClick = () => {
    if (textInput.trim() && selectedDate) {
      onUpload(textInput.trim(),fileName, selectedDate);
      onClose();
    } else {
      alert("Please enter text and select a date.");
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-40 border-gray-300 shadow-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 w-96">
        <h2 className="text-xl font-semibold">Upload Text</h2>
        
        <textarea
          rows={6}
          placeholder="Enter your text here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="border border-gray-400 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-black"
        />
        Please enter the File Name
        <input
          type="text"
          onChange={(e) => setFileName(e.target.value)}
          className="border p-2 rounded"
        />
        Please select the date associated
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleUploadClick}
            className={`px-4 py-2 rounded text-white transition-colors duration-200 ${
              !textInput.trim() || !selectedDate
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black"
            }`}
            disabled={!textInput.trim() || !selectedDate}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadTextPopup;
