export interface ProcessedImage {
  original: File;
  compressed: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  originalUrl: string;
  compressedUrl: string;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface CompressionSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  enableResize: boolean;
}