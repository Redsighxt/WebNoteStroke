# NoteStroke - High-Performance Web Note-Taking App

## Overview

NoteStroke is a sophisticated web-based note-taking application that combines advanced canvas drawing capabilities with video export functionality. The app enables users to create handwritten notes with precise stroke recording and can export the drawing process as animated videos, making it ideal for educational content, tutorials, and presentation materials.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: React Query for server state, custom hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage**: In-memory storage with database fallback architecture
- **API Design**: RESTful API with JSON responses and proper error handling

### Canvas System
- **Rendering**: HTML5 Canvas with WebGL acceleration support
- **Stroke Engine**: Custom high-performance stroke recording at 120Hz
- **Performance**: OffscreenCanvas and Web Workers for video processing
- **Drawing Tools**: Multiple tool types (pen, pencil, brush, marker, etc.)

## Key Components

### Core Drawing System
- **Canvas Component**: Main drawing surface with multi-page support
- **Stroke Recording**: Real-time capture of drawing strokes with timestamp data
- **Tool System**: Configurable drawing tools with pressure sensitivity
- **Performance Monitoring**: Built-in performance tracking for 60fps drawing

### Video Export Engine
- **Animation Generation**: Converts stroke data into smooth video animations
- **Export Formats**: MP4, WebM, AVI, MOV with configurable quality settings
- **Progress Tracking**: Real-time export progress with stage indicators
- **Performance**: Web Workers for non-blocking video processing

### UI Components
- **Tool Sidebar**: Drawing tool selection with visual feedback
- **Properties Panel**: Tool settings, colors, and canvas configuration
- **Page Manager**: Multi-page navigation and management
- **Modal System**: Canvas creation, video export, and progress dialogs

### Storage Layer
- **Canvas Management**: CRUD operations for canvas documents
- **Stroke Persistence**: Efficient storage of drawing stroke data
- **Video Export Tracking**: Progress and status management for exports

## Data Flow

### Drawing Flow
1. User selects tool from sidebar
2. Canvas captures pointer events at high frequency (120Hz)
3. Stroke engine processes points and renders to canvas
4. Stroke data is stored in memory and periodically synced to database
5. Undo/redo system maintains operation history

### Export Flow
1. User configures export settings in modal
2. Video engine processes stroke data into animation frames
3. Web Worker handles video encoding to prevent UI blocking
4. Progress updates are sent to main thread
5. Completed video is made available for download

### Storage Flow
1. Canvas metadata stored in PostgreSQL database
2. Stroke data stored with canvas association and page indexing
3. Video export jobs tracked with status and progress
4. In-memory caching for active canvas operations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives

### Drawing Dependencies
- **Canvas API**: Native browser drawing capabilities
- **OffscreenCanvas**: Background rendering for video export
- **Web Workers**: Multi-threaded video processing
- **MediaRecorder API**: Video capture and encoding

### Development Dependencies
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast JavaScript bundling

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite provides instant updates during development
- **TypeScript Checking**: Continuous type checking across all layers
- **Database Migrations**: Drizzle Kit for schema management
- **Replit Integration**: Optimized for Replit development environment

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code for Node.js
- **Database**: PostgreSQL with connection pooling
- **Assets**: Static files served efficiently

### Performance Considerations
- **Canvas Optimization**: High DPI support with pixel ratio scaling
- **Memory Management**: Efficient stroke data structures
- **Video Processing**: Web Workers prevent UI blocking
- **Database Queries**: Optimized queries with proper indexing

The application is designed to achieve native-like performance with smooth 60fps drawing, efficient video export with progress indicators, and seamless user experience across all supported devices and browsers.