# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
OntoSeed is a Next.js 15 application with TypeScript, Tailwind CSS, and ESLint configuration. The project uses Turbopack for faster development builds.

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint with Next.js configuration
- **Package Manager**: npm
- **Build Tool**: Turbopack (for development)

## Common Commands
- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure
- `src/app/` - App Router pages and layouts
- `src/components/` - Reusable React components (create as needed)
- `public/` - Static assets
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration

## Development Guidelines
- Uses App Router (not Pages Router)
- Import alias `@/*` points to `src/*`
- Follow TypeScript best practices
- Use Tailwind for styling
- ESLint configuration enforces Next.js best practices

## OntoSeed Specific Notes

### Mission
Build a scale-independent "seed ontology" with four universal rules: identity, containment, cause, reflection. Provide SHACL validation so every new concept is auto-checked.

### Four Universal Rules
1. **Identity**: Every entity must have a unique identifier and self-reference
2. **Containment**: Every entity can contain and be contained by other entities  
3. **Cause**: Every entity can cause and be caused by other entities (with provenance)
4. **Reflection**: Every entity can reflect and be reflected by other entities

### Core Components
- `src/ontology/core.ttl` - Core ontology with universal rules
- `src/ontology/shapes.ttl` - SHACL validation shapes
- `src/lib/ontology.ts` - TypeScript ontology manager
- `src/lib/validator.ts` - Validation engine for new concepts

### Development Workflow
1. New concepts must extend the core ontology
2. All concepts auto-validated against SHACL shapes
3. CI pipeline validates ontology on every commit
4. Concepts must follow at least the Identity rule

### Sprint Planning
- **Sprint 1**: Ontology seed + CI (current)
- **Sprint 2**: API wrapper + playground UI
- **Sprint 3**: Mini SemCom encoder/decoder PoC  
- **Sprint 4**: ZKP-backed provenance ledger

### Validation Commands
- `npm run lint` - TypeScript linting
- `npm run build` - Type checking and compilation
- CI validates ontology syntax and SHACL compliance