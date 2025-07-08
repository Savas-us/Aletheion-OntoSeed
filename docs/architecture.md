# System Architecture

![OntoSeed Architecture](architecture.png)

## Overview

OntoSeed is built as a layered architecture with four main components:

1. **User Interface Layer**: Interactive playgrounds for SHACL validation, SemCom encoding, and ZKP provenance
2. **API Layer**: RESTful endpoints for validation, semantic communication, and provenance operations
3. **Core Engine**: Ontology management, validation processing, and zero-knowledge proof generation
4. **Universal Rules Foundation**: Implementation of Identity, Containment, Cause, and Reflection principles

## Technology Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Node.js + API Routes
- **Ontology**: RDF/OWL + SHACL + Turtle
- **Validation**: pyshacl + N3.js
- **ZKP**: Circom + Groth16 + snarkjs
- **Database**: SQLite
- **Deployment**: Docker + Fly.io + GitHub Actions

## Components

### User Interface Layer

The UI layer provides three main interactive experiences:

- **SHACL Playground**: Real-time validation of ontology concepts
- **SemCom Playground**: Semantic communication encoding/decoding
- **Provenance Ledger**: ZKP proof generation and verification

### API Layer

RESTful endpoints that handle:

- `/api/validate`: SHACL validation of Turtle RDF
- `/api/semcom`: Semantic communication operations
- `/api/prov`: Provenance record management

### Core Engine

The core processing layer includes:

- **Ontology Manager**: Handles RDF/OWL concepts and SHACL shapes
- **Validation Engine**: pyshacl integration for constraint checking
- **ZKP Engine**: Circom circuit compilation and proof generation

### Universal Rules Foundation

Implementation of the four foundational principles:

- **Identity**: Unique identification and self-reference
- **Containment**: Hierarchical relationships and structure
- **Cause**: Causality chains and provenance tracking
- **Reflection**: Meta-modeling and self-awareness