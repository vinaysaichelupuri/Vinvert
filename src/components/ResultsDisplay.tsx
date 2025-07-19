import React from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Image as ImageIcon, Zap, TrendingDown, Maximize2 } from 'lucide-react';
import type { ConversionResult } from '../types/conversion';

interface ResultsDisplayProps {
  result: ConversionResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = result.converted.url;
    a.download = result.converted.file.name;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-green-500/20 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          Conversion Complete!
        </h2>
        <p className="text-xl text-gray-400">
          Your image has been successfully converted and optimized
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <TrendingDown className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-green-400">
            {result.compressionRatio.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">Size Reduction</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-blue-400">
            {formatFileSize(result.spaceSaved)}
          </p>
          <p className="text-sm text-gray-400">Space Saved</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <Maximize2 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-purple-400">
            {result.converted.width} × {result.converted.height}
          </p>
          <p className="text-sm text-gray-400">New Dimensions</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <ImageIcon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-cyan-400">
            {result.converted.format}
          </p>
          <p className="text-sm text-gray-400">Output Format</p>
        </div>
      </motion.div>

      {/* Before/After Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700"
      >
        <h3 className="text-2xl font-bold mb-6 text-center">Before & After</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-300">Original</h4>
              <div className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                {formatFileSize(result.original.size)}
              </div>
            </div>
            <div className="relative group">
              <img
                src={result.original.url}
                alt="Original"
                className="w-full h-64 object-cover rounded-xl border border-gray-600"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="font-semibold">Original Image</p>
                  <p className="text-sm">{result.original.width} × {result.original.height}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Format: {result.original.format}</p>
              <p>Dimensions: {result.original.width} × {result.original.height}</p>
              <p>File Size: {formatFileSize(result.original.size)}</p>
            </div>
          </div>

          {/* Converted */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-300">Converted</h4>
              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                {formatFileSize(result.converted.size)}
              </div>
            </div>
            <div className="relative group">
              <img
                src={result.converted.url}
                alt="Converted"
                className="w-full h-64 object-cover rounded-xl border border-gray-600"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="font-semibold">Converted Image</p>
                  <p className="text-sm">{result.converted.width} × {result.converted.height}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Format: {result.converted.format}</p>
              <p>Dimensions: {result.converted.width} × {result.converted.height}</p>
              <p>File Size: {formatFileSize(result.converted.size)}</p>
              <p>Quality: {result.settings.quality}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Download Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadImage}
          className="px-12 py-4 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center space-x-3">
            <Download className="w-6 h-6" />
            <span>Download Converted Image</span>
          </span>
        </motion.button>
        <p className="text-gray-400 mt-4">
          {result.converted.file.name} • {formatFileSize(result.converted.size)}
        </p>
      </motion.div>
    </div>
  );
};

export default ResultsDisplay;