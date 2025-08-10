# Personal Blog Application

## Overview

A modern full-stack personal blog application built for Alex Chen, featuring a React frontend with shadcn/ui components and an Express.js backend. The application includes a public blog interface, admin content management system, and file upload capabilities with Google Cloud Storage integration. The blog supports posts, comments, and displays currently reading/listening status.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable interface elements
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation resolvers

### Backend Architecture  
- **Runtime**: Node.js with Express.js web framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL with connection pooling
- **File Storage**: Google Cloud Storage for media uploads with custom ACL (Access Control List) system
- **Development**: Hot module replacement via Vite integration in development mode

### Content Management
- **Blog Posts**: Full CRUD operations with draft/published status, slug-based routing, and featured images
- **Comments**: Moderated comment system with approval workflow
- **Media Uploads**: Integrated file upload system using Uppy with Google Cloud Storage backend
- **Content Status**: Currently reading/listening widgets with progress tracking

### Database Schema
- **Users**: Authentication and author management
- **Posts**: Blog content with metadata, categories, and publishing workflow
- **Comments**: User feedback with moderation capabilities  
- **Currently Reading/Listening**: Personal status updates with progress tracking

### API Design
- RESTful API structure with `/api` prefix
- Separate admin endpoints for content management (`/api/admin/*`)
- Public endpoints for blog content consumption (`/api/posts/*`, `/api/comments/*`)
- Object storage endpoints for file uploads (`/api/objects/*`)

## External Dependencies

### Database Services
- **Neon**: Serverless PostgreSQL database hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tooling

### Cloud Storage
- **Google Cloud Storage**: Object storage for media files and assets
- **Replit Object Storage**: Development environment storage integration

### Frontend Libraries
- **Radix UI**: Comprehensive primitive component library for accessibility
- **TanStack Query**: Server state management and data synchronization
- **Uppy**: File upload handling with dashboard interface and AWS S3 compatibility
- **Wouter**: Minimal client-side routing solution
- **Tailwind CSS**: Utility-first CSS framework with design system integration

### Development Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production builds
- **Replit Integration**: Development environment tooling and deployment