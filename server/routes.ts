import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCanvasSchema, insertStrokeSchema, insertVideoExportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Canvas routes
  app.get("/api/canvases", async (req, res) => {
    try {
      const canvases = await storage.getAllCanvases();
      res.json(canvases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch canvases" });
    }
  });

  app.get("/api/canvases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const canvas = await storage.getCanvas(id);
      if (!canvas) {
        return res.status(404).json({ error: "Canvas not found" });
      }
      res.json(canvas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch canvas" });
    }
  });

  app.post("/api/canvases", async (req, res) => {
    try {
      const validatedData = insertCanvasSchema.parse(req.body);
      const canvas = await storage.createCanvas(validatedData);
      res.status(201).json(canvas);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid canvas data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create canvas" });
    }
  });

  app.put("/api/canvases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCanvasSchema.partial().parse(req.body);
      const canvas = await storage.updateCanvas(id, validatedData);
      res.json(canvas);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid canvas data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update canvas" });
    }
  });

  app.delete("/api/canvases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCanvas(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete canvas" });
    }
  });

  // Stroke routes
  app.get("/api/canvases/:canvasId/strokes", async (req, res) => {
    try {
      const canvasId = parseInt(req.params.canvasId);
      const pageIndex = req.query.page ? parseInt(req.query.page as string) : undefined;
      const strokes = await storage.getStrokesByCanvas(canvasId, pageIndex);
      res.json(strokes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch strokes" });
    }
  });

  app.post("/api/strokes", async (req, res) => {
    try {
      const validatedData = insertStrokeSchema.parse(req.body);
      const stroke = await storage.createStroke(validatedData);
      res.status(201).json(stroke);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid stroke data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create stroke" });
    }
  });

  app.delete("/api/strokes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStroke(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete stroke" });
    }
  });

  // Video export routes
  app.post("/api/video-exports", async (req, res) => {
    try {
      const validatedData = insertVideoExportSchema.parse(req.body);
      const videoExport = await storage.createVideoExport(validatedData);
      res.status(201).json(videoExport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid video export data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create video export" });
    }
  });

  app.get("/api/video-exports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const videoExport = await storage.getVideoExport(id);
      if (!videoExport) {
        return res.status(404).json({ error: "Video export not found" });
      }
      res.json(videoExport);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video export" });
    }
  });

  app.put("/api/video-exports/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const videoExport = await storage.updateVideoExportStatus(id, status);
      res.json(videoExport);
    } catch (error) {
      res.status(500).json({ error: "Failed to update video export status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
