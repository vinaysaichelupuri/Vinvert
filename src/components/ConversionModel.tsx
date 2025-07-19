/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Zap, Loader2, Monitor, Smartphone, Camera } from 'lucide-react';
import heic2any from 'heic2any';
import type { ConversionSettings, ConversionResult, DimensionPreset } from '../types/conversion';

interface ConversionModalProps {
  image: File;
  onClose: () => void;
  onConversionComplete: (result: ConversionResult) => void;
  onStartConversion: () => void;
  isProcessing: boolean;
}

const dimensionPresets: DimensionPreset[] = [
  { name: '4K', width: 3840, height: 2160, description: 'Ultra HD' },
  { name: '1080p', width: 1920, height: 1080, description: 'Full HD' },
  { name: '720p', width: 1280, height: 720, description: 'HD Ready' },
  { name: 'Instagram', width: 1080, height: 1080, description: 'Square' },
  { name: 'Web', width: 800, height: 600, description: 'Standard' },
];

const ConversionModal: React.FC<ConversionModalProps> = ({
  image,
  onClose,
  onConversionComplete,
  onStartConversion,
  isProcessing,
}) => {
  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'jpeg',
    quality: 80,
    width: 1920,
    height: 1080,
    maintainAspectRatio: true,
  });
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
      setSettings(prev => ({
        ...prev,
        width: naturalWidth,
        height: naturalHeight,
      }));
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleDimensionChange = (width: number, height: number) => {
    if (settings.maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      if (width !== settings.width) {
        height = Math.round(width / aspectRatio);
      } else {
        width = Math.round(height * aspectRatio);
      }
    }
    setSettings((prev: any) => ({ ...prev, width, height }));
  };

  const applyPreset = (preset: DimensionPreset) => {
    setSettings((prev: any) => ({ ...prev, width: preset.width, height: preset.height }));
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(`Failed to convert HEIC file: ${file.name}`);
    }
  };

  const convertToFormat = async (file: File, format: string, quality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = settings.width;
        canvas.height = settings.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, settings.width, settings.height);
          
          const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                          format === 'png' ? 'image/png' : 
                          format === 'webp' ? 'image/webp' : 
                          'image/jpeg';
          
          canvas.toBlob((blob) => {
            if (blob) {
              const extension = format === 'jpeg' ? 'jpg' : format;
              const fileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);
              resolve(new File([blob], fileName, { type: mimeType }));
            } else {
              reject(new Error('Failed to convert image'));
            }
          }, mimeType, quality / 100);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleConvert = async () => {
    if (!originalDimensions) return;

    onStartConversion();

    try {
      let processedFile = image;

      // Convert HEIC/HEVC if needed
      if (image.type === 'image/heic' || image.type === 'image/hevc' || 
          image.name.match(/\.(heic|hevc)$/i)) {
        processedFile = await convertHeicToJpeg(image);
      }

      // Convert to target format and resize
      const convertedFile = await convertToFormat(processedFile, settings.format, settings.quality);

      const result: ConversionResult = {
        original: {
          file: image,
          url: previewUrl,
          size: image.size,
          width: originalDimensions.width,
          height: originalDimensions.height,
          format: image.type.split('/')[1].toUpperCase(),
        },
        converted: {
          file: convertedFile,
          url: URL.createObjectURL(convertedFile),
          size: convertedFile.size,
          width: settings.width,
          height: settings.height,
          format: settings.format.toUpperCase(),
        },
        settings,
        compressionRatio: ((image.size - convertedFile.size) / image.size) * 100,
        spaceSaved: image.size - convertedFile.size,
      };

      onConversionComplete(result);
    } catch (error) {
      console.error('Conversion failed:', error);
      // Handle error appropriately
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Configure Conversion</h2>
                <p className="text-gray-400">Customize your image output settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Preview</h3>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl border border-gray-700"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
                <p className="text-sm text-white">
                  {originalDimensions ? `${originalDimensions.width} × ${originalDimensions.height}` : 'Loading...'}
                </p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-2">Original File</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Name: {image.name}</p>
                <p>Size: {(image.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Type: {image.type}</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Output Format</label>
              <div className="grid grid-cols-2 gap-3">
                {(['jpeg', 'png', 'webp', 'avif'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setSettings(prev => ({ ...prev, format }))}
                    className={`p-3 rounded-lg border transition-all ${
                      settings.format === format
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Quality</label>
                <span className="text-sm text-blue-400 font-medium">{settings.quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={settings.quality}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, quality: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Dimension Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {dimensionPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-all text-left"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {preset.name === '4K' && <Monitor className="w-4 h-4 text-purple-400" />}
                      {preset.name === 'Instagram' && <Camera className="w-4 h-4 text-pink-400" />}
                      {preset.name === 'Web' && <Smartphone className="w-4 h-4 text-green-400" />}
                      <span className="font-medium text-white text-sm">{preset.name}</span>
                    </div>
                    <p className="text-xs text-gray-400">{preset.width} × {preset.height}</p>
                    <p className="text-xs text-gray-500">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Custom Dimensions</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={settings.width}
                    onChange={(e) => handleDimensionChange(parseInt(e.target.value) || 0, settings.height)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={settings.height}
                    onChange={(e) => handleDimensionChange(settings.width, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <input
                  type="checkbox"
                  id="aspectRatio"
                  checked={settings.maintainAspectRatio}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="aspectRatio" className="text-sm text-gray-300">
                  Maintain aspect ratio
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Output: {settings.width} × {settings.height} • {settings.format.toUpperCase()} • {settings.quality}% quality
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConvert}
              disabled={isProcessing}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Convert Image</span>
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #06b6d4);
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #06b6d4);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </motion.div>
  );
};

export default ConversionModal;