import React from 'react';
import { motion } from 'framer-motion';
import { Download, Image as ImageIcon, Maximize2, Minimize2 } from 'lucide-react';
import type { ProcessedImage } from '../types/image';

interface ImagePreviewProps {
  image: ProcessedImage;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = image.compressedUrl;
    a.download = image.compressed.name;
    a.click();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <ImageIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white truncate max-w-xs">
              {image.original.name}
            </h3>
            <p className="text-sm text-gray-400">
              {image.dimensions.width} × {image.dimensions.height}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadImage}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-300">Original</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Maximize2 className="w-4 h-4" />
              <span>{formatFileSize(image.originalSize)}</span>
            </div>
          </div>
          <div className="relative group">
            <img
              src={image.originalUrl}
              alt="Original"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <p className="text-white text-sm font-medium">Original</p>
            </div>
          </div>
        </div>

        {/* Compressed Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-300">Compressed</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Minimize2 className="w-4 h-4" />
              <span>{formatFileSize(image.compressedSize)}</span>
            </div>
          </div>
          <div className="relative group">
            <img
              src={image.compressedUrl}
              alt="Compressed"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <p className="text-white text-sm font-medium">Compressed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compression Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">
                {image.compressionRatio.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">Reduced</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">
                {formatFileSize(image.originalSize - image.compressedSize)}
              </p>
              <p className="text-xs text-gray-400">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-400">
                {image.format}
              </p>
              <p className="text-xs text-gray-400">Format</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-400">Optimized</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImagePreview;