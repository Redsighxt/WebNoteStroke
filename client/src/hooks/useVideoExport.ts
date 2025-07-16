import { useState, useCallback } from 'react';
import { VideoExportSettings, VideoExportProgress } from '@/types/video';
import { StrokeData } from '@/types/tools';
import { VideoExportEngine } from '@/lib/video-export';

export function useVideoExport(canvas: HTMLCanvasElement | null) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<VideoExportProgress | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);

  const exportVideo = useCallback(async (
    strokes: StrokeData[],
    settings: VideoExportSettings
  ): Promise<Blob | null> => {
    if (!canvas || isExporting) return null;

    setIsExporting(true);
    setProgress(null);
    setExportedBlob(null);

    try {
      const videoEngine = new VideoExportEngine(canvas);
      
      const blob = await videoEngine.exportVideo(strokes, settings, (progressUpdate) => {
        setProgress(progressUpdate);
      });

      setExportedBlob(blob);
      return blob;
    } catch (error) {
      console.error('Video export failed:', error);
      setProgress({
        stage: 'error',
        progress: 0,
        currentFrame: 0,
        totalFrames: 0,
        timeRemaining: 0,
        message: 'Video export failed'
      });
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [canvas, isExporting]);

  const downloadVideo = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const cancelExport = useCallback(() => {
    if (!isExporting) return;
    
    setIsExporting(false);
    setProgress({
      stage: 'error',
      progress: 0,
      currentFrame: 0,
      totalFrames: 0,
      timeRemaining: 0,
      message: 'Export cancelled'
    });
  }, [isExporting]);

  const estimateFileSize = useCallback((
    strokes: StrokeData[],
    settings: VideoExportSettings
  ): number => {
    // Rough estimation based on settings
    const resolution = settings.resolution;
    const duration = strokes.length > 0 ? 
      (strokes[strokes.length - 1].endTime - strokes[0].startTime) / 1000 : 60;
    
    let baseSize = 0;
    switch (resolution) {
      case '720p':
        baseSize = 1000000; // 1MB per second
        break;
      case '1080p':
        baseSize = 2000000; // 2MB per second
        break;
      case '1440p':
        baseSize = 4000000; // 4MB per second
        break;
      case '4K':
        baseSize = 8000000; // 8MB per second
        break;
    }

    // Adjust for quality
    const qualityMultiplier = settings.quality === 'high' ? 1.5 : 
      settings.quality === 'low' ? 0.5 : 1;

    return baseSize * duration * qualityMultiplier;
  }, []);

  const getOptimalSettings = useCallback((
    strokes: StrokeData[],
    targetFileSize?: number
  ): VideoExportSettings => {
    // Return optimal settings based on stroke count and target file size
    const strokeCount = strokes.length;
    
    return {
      format: 'mp4',
      resolution: strokeCount > 1000 ? '720p' : '1080p',
      frameRate: 60,
      quality: 'auto',
      playbackSpeed: 1.0,
      strokeDelay: 0.2,
      animationStyle: 'smooth',
      backgroundType: 'white',
      effects: {
        fadeIn: false,
        strokeEmphasis: false,
        dynamicZoom: false,
        pageTransitions: true
      }
    };
  }, []);

  return {
    isExporting,
    progress,
    exportedBlob,
    exportVideo,
    downloadVideo,
    cancelExport,
    estimateFileSize,
    getOptimalSettings
  };
}
