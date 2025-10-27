// app/page.jsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion';

// Import the new components
import ImageUploader from './components/ImageUploader';
import LocationResult from './components/LocationResult';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // API endpoint URL from environment variables for better configuration
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/upload';

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setLocation(null);
    setError('');
  };

  const handleClear = () => {
    setSelectedFile(null);
    setLocation(null);
    setError('');
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    setError('');
    setLocation(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Upload failed.');
      }
      
      setLocation({ latitude: data.latitude, longitude: data.longitude });

    } catch (err) {
      console.error(err);
      setError(err.message || "An unknown error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 text-gray-100">
      <div className="text-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-200 to-slate-400"
        >
          GeoLocator
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 }}}
          className="mt-2 text-md text-slate-400 max-w-md"
        >
          Upload a JPEG image to instantly extract its hidden GPS coordinates.
        </motion.p>
      </div>

      <ImageUploader 
        onFileSelect={handleFileSelect}
        onClear={handleClear}
        selectedFile={selectedFile}
        loading={loading}
      />

      {selectedFile && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Processing...' : 'Find Location'}
          </motion.button>
      )}

      <LocationResult location={location} error={error} loading={loading} />
    </main>
  );
}