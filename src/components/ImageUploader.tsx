import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, AlertCircle, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded: (image: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/heic',
    'image/hevc',
    'image/bmp',
    'image/tiff',
    'image/avif',
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateAndProcessFile = (file: File) => {
    if (acceptedTypes.includes(file.type) || file.name.match(/\.(heic|hevc|avif)$/i)) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError(`File is too large (max 100MB): ${file.name}`);
        setTimeout(() => setError(null), 5000);
        return;
      }
      setError(null);
      onImageUploaded(file);
    } else {
      setError(`Unsupported file format: ${file.name}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  }, [onImageUploaded]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  }, [onImageUploaded]);

  return (
    <div className="space-y-6">
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-cyan-400 bg-cyan-500/10 scale-105 shadow-2xl shadow-cyan-500/20' 
            : 'border-gray-600 bg-gray-800/30 hover:border-blue-500 hover:bg-gray-800/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          accept="image/*,.heic,.hevc,.avif"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ 
            scale: isDragOver ? 1.1 : 1,
            rotate: isDragOver ? [0, -2, 2, 0] : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className={`relative p-6 rounded-full transition-all duration-300 ${
            isDragOver 
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg' 
              : 'bg-gradient-to-r from-gray-700/50 to-gray-600/50'
          }`}>
            <Upload className={`w-12 h-12 transition-colors ${
              isDragOver ? 'text-cyan-400' : 'text-blue-400'
            }`} />
            {isDragOver && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </motion.div>
            )}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">
              {isDragOver ? 'Drop your image here!' : 'Upload an Image'}
            </h3>
            <p className="text-gray-400 text-lg">
              {isDragOver ? 'Release to start converting' : 'Drag & drop or click to select'}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>JPEG</span>
              <span>•</span>
              <span>PNG</span>
              <span>•</span>
              <span>WebP</span>
              <span>•</span>
              <span>HEIC</span>
              <span>•</span>
              <span>AVIF</span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border-2 border-cyan-400"
            />
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
          <Image className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-300">Any Format</p>
          <p className="text-xs text-gray-500">JPEG, PNG, WebP, HEIC</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
          <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-300">Drag & Drop</p>
          <p className="text-xs text-gray-500">Or click to browse</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
          <div className="w-8 h-8 bg-purple-400 rounded-lg mx-auto mb-2 flex items-center justify-center text-sm font-bold">
            100
          </div>
          <p className="text-sm font-medium text-gray-300">Max 100MB</p>
          <p className="text-xs text-gray-500">Large file support</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
          <div className="w-8 h-8 bg-cyan-400 rounded-lg mx-auto mb-2 flex items-center justify-center text-sm font-bold">
            🔒
          </div>
          <p className="text-sm font-medium text-gray-300">Private</p>
          <p className="text-xs text-gray-500">Never uploaded</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;