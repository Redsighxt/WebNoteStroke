export interface VideoExportSettings {
  format: 'mp4' | 'webm' | 'avi' | 'mov';
  resolution: '720p' | '1080p' | '1440p' | '4K';
  frameRate: 30 | 60 | 120;
  quality: 'auto' | 'high' | 'medium' | 'low';
  playbackSpeed: number;
  strokeDelay: number;
  animationStyle: 'original' | 'smooth' | 'quick' | 'dramatic';
  backgroundType: 'white' | 'black' | 'grid' | 'transparent' | 'original';
  effects: VideoEffects;
}

export interface VideoEffects {
  fadeIn: boolean;
  strokeEmphasis: boolean;
  dynamicZoom: boolean;
  pageTransitions: boolean;
}

export interface VideoExportProgress {
  stage: 'preparing' | 'rendering' | 'encoding' | 'finalizing' | 'complete' | 'error';
  progress: number;
  currentFrame: number;
  totalFrames: number;
  timeRemaining: number;
  message: string;
}

export interface AnimationFrame {
  timestamp: number;
  strokes: RenderedStroke[];
}

export interface RenderedStroke {
  id: string;
  path: Path2D;
  style: {
    strokeStyle: string;
    lineWidth: number;
    globalAlpha: number;
    lineCap: CanvasLineCap;
    lineJoin: CanvasLineJoin;
  };
  progress: number; // 0-1
}

export const VIDEO_PRESETS = {
  formats: [
    { value: 'mp4', label: 'MP4 (H.264)', description: 'Best compatibility, good compression' },
    { value: 'webm', label: 'WebM (VP9)', description: 'Excellent compression, web-optimized' },
    { value: 'avi', label: 'AVI', description: 'Uncompressed, largest file size' },
    { value: 'mov', label: 'MOV (Apple)', description: 'Apple-optimized format' }
  ],
  resolutions: [
    { value: '720p', label: '720p (1280×720)', width: 1280, height: 720 },
    { value: '1080p', label: '1080p (1920×1080)', width: 1920, height: 1080 },
    { value: '1440p', label: '1440p (2560×1440)', width: 2560, height: 1440 },
    { value: '4K', label: '4K (3840×2160)', width: 3840, height: 2160 }
  ],
  frameRates: [
    { value: 30, label: '30 FPS' },
    { value: 60, label: '60 FPS' },
    { value: 120, label: '120 FPS' }
  ],
  animationStyles: [
    { value: 'original', label: 'Original Timing', description: 'Use exact recorded timing' },
    { value: 'smooth', label: 'Smooth & Steady', description: 'Consistent stroke timing' },
    { value: 'quick', label: 'Quick Sketch', description: 'Fast drawing animation' },
    { value: 'dramatic', label: 'Dramatic Reveal', description: 'Slow, emphasized strokes' }
  ]
};
