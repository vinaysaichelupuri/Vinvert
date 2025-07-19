import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Download, Image as ImageIcon } from "lucide-react";
import logo from './assets/VS.jpg'
import ImageUploader from "./components/ImageUploader";
import ConversionModal from "./components/ConversionModel";
import ResultsDisplay from "./components/ResultsDisplay";
import type { ConversionResult } from "./types/conversion";

function App() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUploaded = (image: File) => {
    setUploadedImage(image);
    setConversionResult(null);
    setShowModal(true);
  };

  const handleConversionComplete = (result: ConversionResult) => {
    setConversionResult(result);
    setShowModal(false);
    setIsProcessing(false);
  };

  const handleStartConversion = () => {
    setIsProcessing(true);
  };

  const handleNewImage = () => {
    setUploadedImage(null);
    setConversionResult(null);
    setShowModal(false);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Vinvert
                </h1>
                <p className="text-gray-400 text-sm">
                  Premium image converter & optimizer
                </p>
              </div>
            </div>
            {conversionResult && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewImage}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Convert Another
              </motion.button>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!uploadedImage && !conversionResult && (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Convert & Optimize Images
                </h2>
                <p className="text-xl text-gray-400">
                  Upload any image and configure your perfect conversion
                  settings
                </p>
              </div>
              <ImageUploader onImageUploaded={handleImageUploaded} />
            </motion.div>
          )}

          {conversionResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ResultsDisplay result={conversionResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Conversion Modal */}
      <AnimatePresence>
        {showModal && uploadedImage && (
          <ConversionModal
            image={uploadedImage}
            onClose={() => setShowModal(false)}
            onConversionComplete={handleConversionComplete}
            onStartConversion={handleStartConversion}
            isProcessing={isProcessing}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-xl mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Settings className="w-4 h-4" />
                <span className="text-sm">100% Client-Side Processing</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm">Multiple Format Support</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Download className="w-4 h-4" />
                <span className="text-sm">Instant Downloads</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              All processing happens in your browser. Your images never leave
              your device.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
