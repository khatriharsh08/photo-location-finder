// app/components/LocationResult.jsx
'use client'

import { MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationResult({ location, error, loading }) {
  return (
    <div className="w-full max-w-lg mt-8 h-96 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-4 text-slate-300"
          >
            <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
            <p className="text-lg font-semibold">Extracting Geolocation...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-red-900/30 border border-red-500/50"
          >
            <AlertTriangle className="w-12 h-12 text-red-400" />
            <p className="text-lg font-semibold text-red-300">An Error Occurred</p>
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {location && (
          <motion.div
            key="location"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full flex flex-col gap-4 p-4 bg-slate-900/50 border border-slate-700 rounded-xl shadow-2xl shadow-black/30"
          >
            <div className="flex items-center gap-3">
              <MapPin className="text-green-400" size={24}/>
              <h3 className="text-xl font-bold text-slate-100">Location Found!</h3>
            </div>
            <div className="text-sm font-mono bg-slate-800 p-2 rounded-md">
                <p className="text-green-300">Lat: {location.latitude.toFixed(6)}</p>
                <p className="text-cyan-300">Lon: {location.longitude.toFixed(6)}</p>
            </div>
            <div className="flex-grow w-full h-full rounded-lg overflow-hidden border-2 border-slate-700">
               <iframe
                 className="w-full h-full"
                 src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&hl=en&z=14&output=embed`}
                 allowFullScreen
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}