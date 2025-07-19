import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';
import JSZip from 'jszip';
import type { ProcessedImage, CompressionSettings } from '../types/image';
import ImagePreview from './ImagePreview';

interface ImageProcessorProps {
  images: File[];
  settings: CompressionSettings;
  onImagesProcessed: (processedImages: ProcessedImage[]) => void;
  onStartProcessing: () => void;
  isProcessing: boolean;
  processedImages: ProcessedImage[];
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({
  images,
  settings,
  onImagesProcessed,
  onStartProcessing,
  isProcessing,
  processedImages,
}) => {
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      const result = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      });
      
      const convertedBlob = Array.isArray(result) ? result[0] : result;
      return new File([convertedBlob], file.name.replace(/\.(heic|hevc)$/i, '.jpg'), {
        type: 'image/jpeg',
      });
    } catch (error) {
      console.error('HEIC conversion error:', error);
      throw new Error(`Failed to convert HEIC file: ${file.name}`);
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const processImage = async (file: File): Promise<ProcessedImage> => {
    let processedFile = file;
    
    // Convert HEIC/HEVC to JPEG if needed
    if (file.type === 'image/heic' || file.type === 'image/hevc' || 
        file.name.match(/\.(heic|hevc)$/i)) {
      processedFile = await convertHeicToJpeg(file);
    }

    // Get original dimensions
    const originalDimensions = await getImageDimensions(processedFile);

    // Compression options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      maxSizeMB: 10,
      maxWidthOrHeight: settings.enableResize ? Math.max(settings.maxWidth, settings.maxHeight) : undefined,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: settings.quality,
    };

    if (settings.enableResize) {
      options.maxWidthOrHeight = Math.max(settings.maxWidth, settings.maxHeight);
    }

    const compressedFile = await imageCompression(processedFile, options);
    
    // Ensure the compressed file has a .jpg extension
    const finalFile = new File([compressedFile], 
      processedFile.name.replace(/\.[^/.]+$/, '.jpg'), 
      { type: 'image/jpeg' }
    );

    const originalSize = file.size;
    const compressedSize = finalFile.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      original: file,
      compressed: finalFile,
      originalSize,
      compressedSize,
      compressionRatio,
      originalUrl: URL.createObjectURL(file),
      compressedUrl: URL.createObjectURL(finalFile),
      format: 'JPEG',
      dimensions: originalDimensions,
    };
  };

  const handleProcessImages = async () => {
    if (images.length === 0) return;

    onStartProcessing();
    setProcessingProgress(0);
    setCurrentProcessing('');
    setErrors([]);

    const processed: ProcessedImage[] = [];
    const newErrors: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        setCurrentProcessing(image.name);
        const processedImage = await processImage(image);
        processed.push(processedImage);
        setProcessingProgress(((i + 1) / images.length) * 100);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Failed to process ${image.name}`;
        newErrors.push(errorMessage);
        console.error('Processing error:', error);
      }
    }

    setErrors(newErrors);
    setCurrentProcessing('');
    onImagesProcessed(processed);
  };

  const downloadAll = async () => {
    if (processedImages.length === 0) return;

    const zip = new JSZip();
    
    for (const image of processedImages) {
      const response = await fetch(image.compressedUrl);
      const blob = await response.blob();
      zip.file(image.compressed.name, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed-images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalOriginalSize = processedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = processedImages.reduce((sum, img) => sum + img.compressedSize, 0);
  const totalCompressionRatio = totalOriginalSize > 0 ? 
    ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Process Button */}
      {images.length > 0 && processedImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProcessImages}
            disabled={isProcessing}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Process Images</span>
              </span>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Processing Progress */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing Progress</span>
                <span className="text-sm text-gray-400">{Math.round(processingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ width: `${processingProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${processingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {currentProcessing && (
                <p className="text-sm text-gray-400">
                  Processing: {currentProcessing}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-red-400 font-semibold">Processing Errors</h3>
            </div>
            <ul className="text-sm text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {processedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Processing Complete</span>
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadAll}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All</span>
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {processedImages.length}
                  </p>
                  <p className="text-sm text-gray-400">Images Processed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {formatFileSize(totalOriginalSize - totalCompressedSize)}
                  </p>
                  <p className="text-sm text-gray-400">Space Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {totalCompressionRatio.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-400">Compression Ratio</p>
                </div>
              </div>
            </div>

            {/* Processed Images */}
            <div className="grid grid-cols-1 gap-6">
              {processedImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ImagePreview image={image} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageProcessor;