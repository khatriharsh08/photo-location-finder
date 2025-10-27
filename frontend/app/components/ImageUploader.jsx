// app/components/ImageUploader.jsx
'use client'

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileImage, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImageUploader({ onFileSelect, onClear, selectedFile, loading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      // Cleanup the object URL on component unmount or file change
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };
  
  const clearSelection = () => {
      onClear();
      if(inputRef.current) {
          inputRef.current.value = "";
      }
  }

  return (
    <div className="w-full max-w-lg">
      {!selectedFile ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center w-full h-64 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
            ${isDragging ? 'border-blue-400 bg-slate-800/80 scale-105' : 'border-slate-600 bg-slate-900/50 hover:border-slate-400 hover:bg-slate-800/60'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-center">
            <UploadCloud className="mx-auto h-14 w-14 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-slate-200">Drag & drop your image here</p>
            <p className="mt-1 text-sm text-slate-500">or click to browse (JPEG only)</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
        >
          <div className="flex items-start gap-4">
            <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />
            <div className="flex-1">
                <p className="text-lg font-bold text-slate-100">Image Selected</p>
                <p className="text-sm text-slate-400 truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={clearSelection} disabled={loading} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50">
              <X size={20}/>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}