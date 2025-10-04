import React, { useState, useRef } from "react";
import toastHelper from "../../utils/toastHelper";
import { ProductService } from "../../services/products/products.services";

interface UploadExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadExcelModal: React.FC<UploadExcelModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadSample = () => {
    const sampleUrl = "https://example.com/sample-product-template.xlsx";
    const link = document.createElement("a");
    link.href = sampleUrl;
    link.download = "sample-product-template.xlsx";
    link.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      setFile(droppedFile);
    } else {
      toastHelper.showTost("Please upload a valid Excel (.xlsx) file", "error");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      setFile(selectedFile);
    } else {
      toastHelper.showTost("Please upload a valid Excel (.xlsx) file", "error");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadBoxClick = () => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toastHelper.showTost("Please select a file to upload", "error");
      return;
    }
    try {
      await ProductService.importExcel(file);
      toastHelper.showTost("File uploaded successfully!", "success");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to upload file:", error);
      toastHelper.showTost("Failed to upload file", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[88vh] overflow-y-auto transform transition-all duration-300 scale-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-transform duration-200 hover:scale-110"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Upload Excel File
          </h2>
          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title="Download Sample Excel"
          >
            <i className="fas fa-download text-sm"></i>
            <span>Sample Excel</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`w-full p-6 bg-gray-50 dark:bg-gray-800 border-2 border-dashed rounded-lg text-center ${
              isDragging ? "border-green-500 bg-blue-50 dark:bg-blue-900/50" : "border-gray-300 dark:border-gray-600"
            } transition-colors duration-200 cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadBoxClick}
          >
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileInputChange}
              className="hidden"
              ref={fileInputRef}
            />
            {file ? (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-800 dark:text-gray-200 truncate max-w-[70%]">{file.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>
            ) : (
              <div>
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 dark:text-gray-500 mb-2"></i>
                <p className="text-gray-600 dark:text-gray-400">
                  Click or drag and drop your Excel file here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-600 mt-1">
                  Only .xlsx files are supported
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#16a34a] text-white rounded-lg hover:bg-green-600 transition duration-200 transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              disabled={!file}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadExcelModal;