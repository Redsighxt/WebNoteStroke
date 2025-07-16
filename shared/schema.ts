import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const canvases = pgTable("canvases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  backgroundType: text("background_type").notNull().default("solid"),
  pages: jsonb("pages").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const strokes = pgTable("strokes", {
  id: serial("id").primaryKey(),
  canvasId: integer("canvas_id").notNull(),
  pageIndex: integer("page_index").notNull().default(0),
  strokeId: text("stroke_id").notNull(),
  tool: text("tool").notNull(),
  color: text("color").notNull(),
  size: integer("size").notNull(),
  opacity: integer("opacity").notNull().default(100),
  points: jsonb("points").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const videoExports = pgTable("video_exports", {
  id: serial("id").primaryKey(),
  canvasId: integer("canvas_id").notNull(),
  filename: text("filename").notNull(),
  format: text("format").notNull(),
  resolution: text("resolution").notNull(),
  frameRate: integer("frame_rate").notNull(),
  settings: jsonb("settings").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCanvasSchema = createInsertSchema(canvases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStrokeSchema = createInsertSchema(strokes).omit({
  id: true,
  createdAt: true,
});

export const insertVideoExportSchema = createInsertSchema(videoExports).omit({
  id: true,
  createdAt: true,
});

export type Canvas = typeof canvases.$inferSelect;
export type InsertCanvas = z.infer<typeof insertCanvasSchema>;
export type Stroke = typeof strokes.$inferSelect;
export type InsertStroke = z.infer<typeof insertStrokeSchema>;
export type VideoExport = typeof videoExports.$inferSelect;
export type InsertVideoExport = z.infer<typeof insertVideoExportSchema>;
