import { canvases, strokes, videoExports, type Canvas, type InsertCanvas, type Stroke, type InsertStroke, type VideoExport, type InsertVideoExport } from "@shared/schema";

export interface IStorage {
  // Canvas operations
  getCanvas(id: number): Promise<Canvas | undefined>;
  getAllCanvases(): Promise<Canvas[]>;
  createCanvas(canvas: InsertCanvas): Promise<Canvas>;
  updateCanvas(id: number, canvas: Partial<InsertCanvas>): Promise<Canvas>;
  deleteCanvas(id: number): Promise<void>;
  
  // Stroke operations
  getStrokesByCanvas(canvasId: number, pageIndex?: number): Promise<Stroke[]>;
  createStroke(stroke: InsertStroke): Promise<Stroke>;
  deleteStroke(id: number): Promise<void>;
  deleteStrokesByCanvas(canvasId: number): Promise<void>;
  
  // Video export operations
  createVideoExport(videoExport: InsertVideoExport): Promise<VideoExport>;
  getVideoExport(id: number): Promise<VideoExport | undefined>;
  updateVideoExportStatus(id: number, status: string): Promise<VideoExport>;
}

export class MemStorage implements IStorage {
  private canvases: Map<number, Canvas>;
  private strokes: Map<number, Stroke>;
  private videoExports: Map<number, VideoExport>;
  private currentCanvasId: number;
  private currentStrokeId: number;
  private currentVideoExportId: number;

  constructor() {
    this.canvases = new Map();
    this.strokes = new Map();
    this.videoExports = new Map();
    this.currentCanvasId = 1;
    this.currentStrokeId = 1;
    this.currentVideoExportId = 1;
  }

  async getCanvas(id: number): Promise<Canvas | undefined> {
    return this.canvases.get(id);
  }

  async getAllCanvases(): Promise<Canvas[]> {
    return Array.from(this.canvases.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async createCanvas(insertCanvas: InsertCanvas): Promise<Canvas> {
    const id = this.currentCanvasId++;
    const now = new Date();
    const canvas: Canvas = {
      ...insertCanvas,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.canvases.set(id, canvas);
    return canvas;
  }

  async updateCanvas(id: number, updates: Partial<InsertCanvas>): Promise<Canvas> {
    const canvas = this.canvases.get(id);
    if (!canvas) {
      throw new Error(`Canvas with id ${id} not found`);
    }
    
    const updatedCanvas: Canvas = {
      ...canvas,
      ...updates,
      updatedAt: new Date(),
    };
    this.canvases.set(id, updatedCanvas);
    return updatedCanvas;
  }

  async deleteCanvas(id: number): Promise<void> {
    this.canvases.delete(id);
    // Delete associated strokes
    await this.deleteStrokesByCanvas(id);
  }

  async getStrokesByCanvas(canvasId: number, pageIndex?: number): Promise<Stroke[]> {
    const allStrokes = Array.from(this.strokes.values());
    return allStrokes
      .filter(stroke => stroke.canvasId === canvasId && 
        (pageIndex === undefined || stroke.pageIndex === pageIndex))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async createStroke(insertStroke: InsertStroke): Promise<Stroke> {
    const id = this.currentStrokeId++;
    const now = new Date();
    const stroke: Stroke = {
      ...insertStroke,
      id,
      createdAt: now,
    };
    this.strokes.set(id, stroke);
    return stroke;
  }

  async deleteStroke(id: number): Promise<void> {
    this.strokes.delete(id);
  }

  async deleteStrokesByCanvas(canvasId: number): Promise<void> {
    const strokesToDelete = Array.from(this.strokes.values())
      .filter(stroke => stroke.canvasId === canvasId);
    
    for (const stroke of strokesToDelete) {
      this.strokes.delete(stroke.id);
    }
  }

  async createVideoExport(insertVideoExport: InsertVideoExport): Promise<VideoExport> {
    const id = this.currentVideoExportId++;
    const now = new Date();
    const videoExport: VideoExport = {
      ...insertVideoExport,
      id,
      createdAt: now,
    };
    this.videoExports.set(id, videoExport);
    return videoExport;
  }

  async getVideoExport(id: number): Promise<VideoExport | undefined> {
    return this.videoExports.get(id);
  }

  async updateVideoExportStatus(id: number, status: string): Promise<VideoExport> {
    const videoExport = this.videoExports.get(id);
    if (!videoExport) {
      throw new Error(`Video export with id ${id} not found`);
    }
    
    const updatedVideoExport: VideoExport = {
      ...videoExport,
      status,
    };
    this.videoExports.set(id, updatedVideoExport);
    return updatedVideoExport;
  }
}

export const storage = new MemStorage();
