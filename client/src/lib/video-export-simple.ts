import { VideoExportSettings, VideoExportProgress } from '@/types/video';
import { StrokeData } from '@/types/tools';

export class SimpleVideoExporter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
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
      // Create export canvas with proper dimensions
      const exportCanvas = document.createElement('canvas');
      const resolution = this.getResolution(settings.resolution);
      exportCanvas.width = resolution.width;
      exportCanvas.height = resolution.height;
      const exportCtx = exportCanvas.getContext('2d')!;

      // Sort strokes by time
      const sortedStrokes = [...strokes].sort((a, b) => a.startTime - b.startTime);
      
      // Calculate frame timing
      const frameRate = settings.frameRate || 30;
      const frameDuration = 1000 / frameRate; // milliseconds per frame
      const strokeDelay = settings.strokeDelay * 1000; // convert to milliseconds
      
      // Generate frames
      const frames: { time: number; strokesToRender: StrokeData[] }[] = [];
      let currentTime = 0;
      let renderedStrokes: StrokeData[] = [];

      // Add initial frame with background
      frames.push({ time: currentTime, strokesToRender: [] });

      // Process each stroke
      for (const stroke of sortedStrokes) {
        currentTime += strokeDelay;
        renderedStrokes.push(stroke);
        frames.push({ time: currentTime, strokesToRender: [...renderedStrokes] });
      }

      onProgress({
        stage: 'rendering',
        progress: 0,
        currentFrame: 0,
        totalFrames: frames.length,
        timeRemaining: 0,
        message: 'Rendering animation frames...'
      });

      // Setup MediaRecorder for video recording
      const stream = exportCanvas.captureStream(frameRate);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: this.getBitrate(settings.quality)
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start();

      // Render frames
      const startTime = performance.now();
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        
        // Clear canvas
        exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        // Set background
        exportCtx.fillStyle = this.getBackgroundColor(settings.backgroundType);
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        // Render strokes
        for (const stroke of frame.strokesToRender) {
          this.renderStroke(exportCtx, stroke);
        }
        
        const elapsed = performance.now() - startTime;
        const remaining = (elapsed / (i + 1)) * (frames.length - i - 1);
        
        onProgress({
          stage: 'rendering',
          progress: (i / frames.length) * 80, // 80% for rendering
          currentFrame: i + 1,
          totalFrames: frames.length,
          timeRemaining: remaining,
          message: `Rendering frame ${i + 1} of ${frames.length}...`
        });

        // Wait for frame duration
        await new Promise(resolve => setTimeout(resolve, frameDuration));
      }

      // Finalize recording
      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          onProgress({
            stage: 'complete',
            progress: 100,
            currentFrame: frames.length,
            totalFrames: frames.length,
            timeRemaining: 0,
            message: 'Video export complete!'
          });
          resolve(blob);
        };

        mediaRecorder.onerror = (error) => {
          onProgress({
            stage: 'error',
            progress: 0,
            currentFrame: 0,
            totalFrames: 0,
            timeRemaining: 0,
            message: 'Error during video export'
          });
          reject(error);
        };

        setTimeout(() => {
          mediaRecorder.stop();
        }, 1000); // Give some time for final frame
      });

    } catch (error) {
      console.error('Video export failed:', error);
      throw error;
    }
  }

  private renderStroke(ctx: CanvasRenderingContext2D, stroke: StrokeData) {
    if (stroke.points.length < 2) return;

    ctx.save();
    ctx.globalAlpha = stroke.opacity / 100;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    ctx.stroke();
    ctx.restore();
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

  private getBitrate(quality: string): number {
    switch (quality) {
      case 'low':
        return 1000000; // 1 Mbps
      case 'medium':
        return 2500000; // 2.5 Mbps
      case 'high':
        return 5000000; // 5 Mbps
      default:
        return 2500000; // 2.5 Mbps
    }
  }

  private getBackgroundColor(backgroundType: string): string {
    switch (backgroundType) {
      case 'black':
        return '#000000';
      case 'transparent':
        return 'transparent';
      default:
        return '#ffffff';
    }
  }
}