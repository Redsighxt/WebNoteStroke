import { VideoExportSettings, VideoExportProgress, AnimationFrame } from '@/types/video';
import { StrokeData } from '@/types/tools';
import { StrokeEngine } from './stroke-engine';

export class VideoExportEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: OffscreenCanvas | null = null;
  private offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private worker: Worker | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupOffscreenCanvas();
  }

  private setupOffscreenCanvas() {
    if ('OffscreenCanvas' in window) {
      this.offscreenCanvas = new OffscreenCanvas(1920, 1080);
      this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    }
  }

  async exportVideo(
    strokes: StrokeData[],
    settings: VideoExportSettings,
    onProgress: (progress: VideoExportProgress) => void
  ): Promise<Blob> {
    onProgress({
      stage: 'preparing',
      progress: 0,
      currentFrame: 0,
      totalFrames: 0,
      timeRemaining: 0,
      message: 'Preparing video export...'
    });

    try {
      // Simplified approach - create a sequence of images first
      const frames = await this.generateAnimationFrames(strokes, settings, onProgress);
      
      onProgress({
        stage: 'rendering',
        progress: 0,
        currentFrame: 0,
        totalFrames: frames.length,
        timeRemaining: 0,
        message: 'Rendering animation frames...'
      });

      // Setup export canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = this.getResolutionWidth(settings.resolution);
      exportCanvas.height = this.getResolutionHeight(settings.resolution);
      const exportCtx = exportCanvas.getContext('2d')!;

      // Create images array for frames
      const frameImages: ImageData[] = [];
      const startTime = performance.now();
      
      for (let i = 0; i < frames.length; i++) {
        // Clear canvas
        exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        // Set background
        exportCtx.fillStyle = this.getBackgroundColor(settings.backgroundType);
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        // Render frame
        await this.renderFrame(exportCtx, frames[i], settings);
        
        // Capture frame data
        const imageData = exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
        frameImages.push(imageData);
        
        const elapsed = performance.now() - startTime;
        const remaining = (elapsed / (i + 1)) * (frames.length - i - 1);
        
        onProgress({
          stage: 'rendering',
          progress: (i / frames.length) * 100,
          currentFrame: i + 1,
          totalFrames: frames.length,
          timeRemaining: remaining,
          message: `Rendering frame ${i + 1} of ${frames.length}...`
        });

        // Small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      // Now create video from frames using MediaRecorder
      return this.createVideoFromFrames(exportCanvas, frameImages, settings, onProgress);

    } catch (error) {
      onProgress({
        stage: 'error',
        progress: 0,
        currentFrame: 0,
        totalFrames: 0,
        timeRemaining: 0,
        message: 'Failed to export video'
      });
      throw error;
    }
  }

  private setupExportCanvas(settings: VideoExportSettings): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const resolution = this.getResolution(settings.resolution);
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    return canvas;
  }

  private async generateAnimationFrames(
    strokes: StrokeData[],
    settings: VideoExportSettings,
    onProgress: (progress: VideoExportProgress) => void
  ): Promise<AnimationFrame[]> {
    const frames: AnimationFrame[] = [];
    const frameDuration = 1000 / settings.frameRate;
    
    // Sort strokes by timestamp
    const sortedStrokes = [...strokes].sort((a, b) => a.startTime - b.startTime);
    
    // Calculate total animation duration
    const totalDuration = this.calculateAnimationDuration(sortedStrokes, settings);
    const totalFrames = Math.ceil(totalDuration / frameDuration);
    
    // Generate frames
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const currentTime = frameIndex * frameDuration;
      const activeStrokes = this.getActiveStrokesAtTime(sortedStrokes, currentTime, settings);
      
      frames.push({
        timestamp: currentTime,
        strokes: activeStrokes
      });
      
      if (frameIndex % 10 === 0) {
        onProgress({
          stage: 'preparing',
          progress: (frameIndex / totalFrames) * 100,
          currentFrame: frameIndex,
          totalFrames,
          timeRemaining: 0,
          message: `Generating frame ${frameIndex + 1} of ${totalFrames}...`
        });
      }
    }
    
    return frames;
  }

  private calculateAnimationDuration(strokes: StrokeData[], settings: VideoExportSettings): number {
    if (strokes.length === 0) return 0;
    
    const lastStroke = strokes[strokes.length - 1];
    const baseDuration = lastStroke.endTime - strokes[0].startTime;
    
    // Apply speed multiplier
    const adjustedDuration = baseDuration / settings.playbackSpeed;
    
    // Add stroke delays
    const delayDuration = (strokes.length - 1) * settings.strokeDelay * 1000;
    
    return adjustedDuration + delayDuration;
  }

  private getActiveStrokesAtTime(
    strokes: StrokeData[],
    currentTime: number,
    settings: VideoExportSettings
  ): any[] {
    const activeStrokes: any[] = [];
    
    for (const stroke of strokes) {
      const adjustedStartTime = (stroke.startTime * settings.playbackSpeed) + 
        (strokes.indexOf(stroke) * settings.strokeDelay * 1000);
      const adjustedEndTime = (stroke.endTime * settings.playbackSpeed) + 
        (strokes.indexOf(stroke) * settings.strokeDelay * 1000);
      
      if (currentTime >= adjustedStartTime && currentTime <= adjustedEndTime) {
        const progress = (currentTime - adjustedStartTime) / (adjustedEndTime - adjustedStartTime);
        
        activeStrokes.push({
          id: stroke.id,
          path: this.createStrokePath(stroke, progress),
          style: {
            strokeStyle: stroke.color,
            lineWidth: stroke.size,
            globalAlpha: stroke.opacity / 100,
            lineCap: 'round' as CanvasLineCap,
            lineJoin: 'round' as CanvasLineJoin
          },
          progress: Math.max(0, Math.min(1, progress))
        });
      }
    }
    
    return activeStrokes;
  }

  private createStrokePath(stroke: StrokeData, progress: number): Path2D {
    const path = new Path2D();
    
    if (stroke.points.length === 0) return path;
    
    const pointsToRender = Math.ceil(stroke.points.length * progress);
    const points = stroke.points.slice(0, pointsToRender);
    
    if (points.length > 0) {
      path.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        if (i === points.length - 1 && progress < 1) {
          // Interpolate the last point for smooth animation
          const prev = points[i - 1];
          const curr = points[i];
          const t = (progress * stroke.points.length) % 1;
          
          const x = prev.x + (curr.x - prev.x) * t;
          const y = prev.y + (curr.y - prev.y) * t;
          
          path.lineTo(x, y);
        } else {
          path.lineTo(points[i].x, points[i].y);
        }
      }
    }
    
    return path;
  }

  private async renderFrame(
    ctx: CanvasRenderingContext2D,
    frame: AnimationFrame,
    settings: VideoExportSettings
  ): Promise<void> {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw background
    this.drawBackground(ctx, settings);
    
    // Draw strokes
    for (const stroke of frame.strokes) {
      ctx.save();
      ctx.strokeStyle = stroke.style.strokeStyle;
      ctx.lineWidth = stroke.style.lineWidth;
      ctx.globalAlpha = stroke.style.globalAlpha;
      ctx.lineCap = stroke.style.lineCap;
      ctx.lineJoin = stroke.style.lineJoin;
      
      ctx.stroke(stroke.path);
      ctx.restore();
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D, settings: VideoExportSettings) {
    switch (settings.backgroundType) {
      case 'white':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        break;
      case 'black':
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        break;
      case 'grid':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.drawGridBackground(ctx);
        break;
      case 'transparent':
        // No background
        break;
      default:
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  private drawGridBackground(ctx: CanvasRenderingContext2D) {
    const gridSize = 20;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'avi':
        return 'video/x-msvideo';
      case 'mov':
        return 'video/quicktime';
      default:
        return 'video/mp4';
    }
  }

  private getBitrate(quality: string): number {
    switch (quality) {
      case 'low':
        return 1000000; // 1 Mbps
      case 'medium':
        return 5000000; // 5 Mbps
      case 'high':
        return 10000000; // 10 Mbps
      default:
        return 5000000; // Auto - medium quality
    }
  }

  private getResolution(resolution: string): { width: number; height: number } {
    switch (resolution) {
      case '720p':
        return { width: 1280, height: 720 };
      case '1080p':
        return { width: 1920, height: 1080 };
      case '1440p':
        return { width: 2560, height: 1440 };
      case '4K':
        return { width: 3840, height: 2160 };
      default:
        return { width: 1920, height: 1080 };
    }
  }
}
