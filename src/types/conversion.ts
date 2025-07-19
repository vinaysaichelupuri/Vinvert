export interface ConversionSettings {
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  quality: number; // 0-100
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

export interface ConversionResult {
  original: {
    file: File;
    url: string;
    size: number;
    width: number;
    height: number;
    format: string;
  };
  converted: {
    file: File;
    url: string;
    size: number;
    width: number;
    height: number;
    format: string;
  };
  settings: ConversionSettings;
  compressionRatio: number;
  spaceSaved: number;
}

export interface DimensionPreset {
  name: string;
  width: number;
  height: number;
  description: string;
}