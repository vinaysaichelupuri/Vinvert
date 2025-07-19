import React from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Sliders, Maximize2 } from 'lucide-react';
import type { CompressionSettings } from '../types/image';

interface SettingsPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (settings: CompressionSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  const handleQualityChange = (quality: number) => {
    onSettingsChange({ ...settings, quality: quality / 100 });
  };

  const handleMaxWidthChange = (maxWidth: number) => {
    onSettingsChange({ ...settings, maxWidth });
  };

  const handleMaxHeightChange = (maxHeight: number) => {
    onSettingsChange({ ...settings, maxHeight });
  };

  const handleResizeToggle = (enableResize: boolean) => {
    onSettingsChange({ ...settings, enableResize });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Compression Settings</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Quality Setting */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                <Sliders className="w-4 h-4" />
                <span>JPEG Quality</span>
              </label>
              <span className="text-sm text-blue-400 font-medium">
                {Math.round(settings.quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={settings.quality * 100}
              onChange={(e) => handleQualityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>40%</span>
              <span>70%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Resize Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
              <Maximize2 className="w-4 h-4" />
              <span>Enable Resize</span>
            </label>
            <button
              onClick={() => handleResizeToggle(!settings.enableResize)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableResize ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableResize ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Resize Dimensions */}
          {settings.enableResize && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  value={settings.maxWidth}
                  onChange={(e) => handleMaxWidthChange(parseInt(e.target.value) || 1200)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  value={settings.maxHeight}
                  onChange={(e) => handleMaxHeightChange(parseInt(e.target.value) || 1200)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </motion.div>
          )}

          {/* Preset Buttons */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Quick Presets</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSettingsChange({ ...settings, quality: 0.9, enableResize: false })}
                className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm transition-colors"
              >
                High Quality
              </button>
              <button
                onClick={() => onSettingsChange({ ...settings, quality: 0.7, enableResize: true, maxWidth: 1200, maxHeight: 1200 })}
                className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors"
              >
                Balanced
              </button>
              <button
                onClick={() => onSettingsChange({ ...settings, quality: 0.5, enableResize: true, maxWidth: 800, maxHeight: 800 })}
                className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors"
              >
                Small Size
              </button>
              <button
                onClick={() => onSettingsChange({ ...settings, quality: 0.3, enableResize: true, maxWidth: 600, maxHeight: 600 })}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Web Optimized
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </motion.div>
  );
};

export default SettingsPanel;