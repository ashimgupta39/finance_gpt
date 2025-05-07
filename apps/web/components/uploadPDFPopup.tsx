"use client";
import React, { useState } from "react";

interface UploadPopupProps {
  onClose: () => void;
  onUpload: (file: File, date: string) => void;
}

const UploadPopup: React.FC<UploadPopupProps> = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile && selectedDate) {
      onUpload(selectedFile, selectedDate);
      onClose();
    } else {
      alert("Please select both a file and a date.");
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-40 border-gray-300 shadow-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 w-96">
        <h2 className="text-xl font-semibold">Upload PDF</h2>

        <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-black">
            <label htmlFor="file-upload" className="cursor-pointer">
                {selectedFile ? selectedFile.name : "Click to choose a PDF file"}
            </label>
            <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
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
          <button onClick={handleUploadClick} className={`px-4 py-2 rounded text-white ${!selectedFile || !selectedDate ? "bg-gray-500 cursor-not-allowed" : "bg-black"}`} disabled={!selectedFile || !selectedDate}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPopup;
