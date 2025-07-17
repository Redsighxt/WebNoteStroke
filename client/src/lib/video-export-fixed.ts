import { StrokeData } from '@/types/tools';

export interface VideoExportSettings {
  format: 'mp4' | 'webm';
  quality: 'high' | 'medium' | 'low';
  fps: number;
  strokeSpeed: number; // multiplier for stroke animation speed
  backgroundColor: string;
  width: number;
  height: number;
}

export interface ExportProgress {
  stage: 'preparing' | 'rendering' | 'encoding' | 'complete';
  progress: number; // 0-100
  currentFrame: number;
  totalFrames: number;
  message: string;
}

export class VideoExportEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
  }

  async exportVideo(
    strokes: StrokeData[],
    settings: VideoExportSettings,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<Blob> {
    if (strokes.length === 0) {
      throw new Error('No strokes to export');
    }

    // Setup canvas
    this.canvas.width = settings.width;
    this.canvas.height = settings.height;
    
    // Calculate total animation time
    const totalAnimationTime = this.calculateTotalAnimationTime(strokes, settings);
    const totalFrames = Math.ceil(totalAnimationTime * settings.fps / 1000);

    onProgress?.({
      stage: 'preparing',
      progress: 0,
      currentFrame: 0,
      totalFrames,
      message: 'Setting up video recorder...'
    });

    // Setup MediaRecorder
    const stream = this.canvas.captureStream(settings.fps);
    const mimeType = settings.format === 'mp4' ? 'video/mp4' : 'video/webm';
    
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: this.getBitrate(settings.quality)
    });

    this.recordedChunks = [];
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    // Start recording
    this.mediaRecorder.start();

    onProgress?.({
      stage: 'rendering',
      progress: 10,
      currentFrame: 0,
      totalFrames,
      message: 'Starting animation...'
    });

    // Animate strokes
    await this.animateStrokes(strokes, settings, onProgress);

    // Stop recording
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        onProgress?.({
          stage: 'complete',
          progress: 100,
          currentFrame: totalFrames,
          totalFrames,
          message: 'Video export complete!'
        });

        const blob = new Blob(this.recordedChunks, { type: mimeType });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  private async animateStrokes(
    strokes: StrokeData[],
    settings: VideoExportSettings,
    onProgress?: (progress: ExportProgress) => void
  ) {
    const totalAnimationTime = this.calculateTotalAnimationTime(strokes, settings);
    const frameInterval = 1000 / settings.fps;
    let currentTime = 0;
    let frameCount = 0;
    const totalFrames = Math.ceil(totalAnimationTime / frameInterval);

    while (currentTime <= totalAnimationTime) {
      // Clear canvas and draw background
      this.ctx.fillStyle = settings.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw strokes up to current time
      this.drawStrokesAtTime(strokes, currentTime, settings);

      // Update progress
      const progress = Math.round((currentTime / totalAnimationTime) * 80) + 10; // 10-90%
      onProgress?.({
        stage: 'rendering',
        progress,
        currentFrame: frameCount,
        totalFrames,
        message: `Rendering frame ${frameCount + 1} of ${totalFrames}...`
      });

      // Wait for next frame
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps for smooth animation
      
      currentTime += frameInterval * settings.strokeSpeed;
      frameCount++;
    }

    // Final frame with all strokes complete
    this.ctx.fillStyle = settings.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawAllStrokes(strokes);
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Hold final frame
  }

  private calculateTotalAnimationTime(strokes: StrokeData[], settings: VideoExportSettings): number {
    if (strokes.length === 0) return 0;
    
    let totalTime = 0;
    for (const stroke of strokes) {
      const strokeDuration = stroke.endTime - stroke.startTime;
      totalTime += Math.max(strokeDuration, 100); // Minimum 100ms per stroke
    }
    
    return totalTime / settings.strokeSpeed;
  }

  private drawStrokesAtTime(strokes: StrokeData[], currentTime: number, settings: VideoExportSettings) {
    let elapsedTime = 0;
    
    for (const stroke of strokes) {
      const strokeDuration = Math.max(stroke.endTime - stroke.startTime, 100);
      const strokeStartTime = elapsedTime;
      const strokeEndTime = elapsedTime + strokeDuration / settings.strokeSpeed;
      
      if (currentTime >= strokeEndTime) {
        // Draw complete stroke
        this.drawCompleteStroke(stroke);
      } else if (currentTime > strokeStartTime) {
        // Draw partial stroke
        const progress = (currentTime - strokeStartTime) / (strokeEndTime - strokeStartTime);
        this.drawPartialStroke(stroke, progress);
      }
      
      elapsedTime = strokeEndTime;
    }
  }

  private drawCompleteStroke(stroke: StrokeData) {
    if (stroke.points.length < 2) return;

    this.ctx.save();
    this.ctx.globalAlpha = stroke.opacity / 100;
    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawPartialStroke(stroke: StrokeData, progress: number) {
    if (stroke.points.length < 2) return;

    const pointCount = Math.floor(stroke.points.length * progress);
    if (pointCount < 2) return;

    this.ctx.save();
    this.ctx.globalAlpha = stroke.opacity / 100;
    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < pointCount; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawAllStrokes(strokes: StrokeData[]) {
    for (const stroke of strokes) {
      this.drawCompleteStroke(stroke);
    }
  }

  private getBitrate(quality: string): number {
    switch (quality) {
      case 'high': return 8000000; // 8 Mbps
      case 'medium': return 4000000; // 4 Mbps
      case 'low': return 2000000; // 2 Mbps
      default: return 4000000;
    }
  }
}