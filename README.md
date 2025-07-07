# OntoSeed

Build a scale-independent "seed ontology" with four universal rules: identity, containment, cause, reflection. Provide SHACL validation so every new concept is auto-checked.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript  
- **Styling**: Tailwind CSS
- **Ontology**: RDF/OWL with SHACL validation
- **Package Manager**: npm

## Quick Start

```bash
# Install dependencies
npm install

# Install pyshacl for validation (required)
pip install pyshacl

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

**Note**: Requires `pyshacl` in PATH (`pip install pyshacl` or use a virtual environment).

## Four Universal Rules

1. **Identity**: Every entity must have a unique identifier and self-reference
2. **Containment**: Every entity can contain and be contained by other entities
3. **Cause**: Every entity can cause and be caused by other entities (with provenance)  
4. **Reflection**: Every entity can reflect and be reflected by other entities

## Playground

### SHACL Validation Playground

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the SHACL playground:
   ```
   http://localhost:3000/playground
   ```

3. Try validating concepts against OntoSeed rules!

### SemCom Playground

Experience bandwidth-efficient semantic communication:

1. Visit the SemCom playground:
   ```
   http://localhost:3000/semcom
   ```

2. **Encode**: Convert Turtle RDF into compressed Semantic Communication packages
3. **Decode**: Restore original semantic content from compressed packages
4. **Analyze**: View compression statistics and bandwidth savings

**Features:**
- Real-time compression ratio calculation
- Round-trip validation (encode → decode → original)
- Interactive UI with live examples
- Bandwidth optimization for 6G SemCom applications

### Using the Playground

The playground provides an interactive interface to validate RDF Turtle concepts against OntoSeed's universal rules.

**Basic Usage:**
1. Enter or paste Turtle RDF content in the text area
2. Click "Validate Against OntoSeed Rules" 
3. View results with validation status and detailed reports

**Example Concepts:**

Valid concept (follows identity rule):
```turtle
@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .

ex:MyCell a ex:Cell ;
    rdfs:label "My Cell" ;
    onto:hasIdentity ex:MyCell_Identity .

ex:MyCell_Identity a onto:Identity ;
    onto:identityValue "my-cell-001" .
```

Invalid concept (missing required identity):
```turtle  
@prefix ex: <http://example.org/> .

ex:MyCell a ex:Cell ;
    rdfs:label "My Cell" .
```

**Quick Examples:**
- Click "Valid Example" for a properly structured concept
- Click "Invalid Example" to see validation failures
- Click "Containment Example" for relationship patterns

## Project Structure

```
src/
├── app/
│   ├── api/validate/           # Validation API endpoint
│   ├── playground/             # Interactive validation UI
│   └── page.tsx               # Home page
├── lib/
│   ├── ontology.ts            # Core ontology management
│   └── validator.ts           # Validation engine  
└── ontology/
    ├── core.ttl               # Core ontology with universal rules
    ├── shapes.ttl             # SHACL validation shapes
    └── seed_concepts.ttl      # Sample concept instances
```

## API Reference

### POST /api/validate

Validates Turtle RDF content against OntoSeed SHACL shapes.

**Request:**
- Method: `POST`
- Content-Type: `text/turtle`
- Body: Turtle RDF content as plain text

**Response:**
```json
{
  "conforms": boolean,
  "report": "string"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: text/turtle" \
  -d "@my-concept.ttl"
```

## Development Workflow

1. **New concepts** must extend the core ontology
2. **Auto-validation** against SHACL shapes  
3. **CI pipeline** validates ontology on every commit
4. **Concepts must follow** at least the Identity rule

### CI Pipeline

The workflow now caches npm dependencies and PTAU/circom artefacts.
First run ≈ 20 min → subsequent runs ≈ 7-8 min.

## Validation Commands

```bash
# TypeScript linting
npm run lint

# Type checking and compilation  
npm run build

# Run tests (when available)
npm test
```

## Deployment

### Local Development

```bash
# Install dependencies
npm install

# Install pyshacl for validation
pip install pyshacl

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Build and run with Docker
docker build -t ontoseed .
docker run -p 3000:3000 ontoseed

# Or use docker-compose
docker-compose up
```

### Cloud Deployment (Fly.io)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy to Fly.io
fly deploy
```

### Health Checks

```bash
# Run smoke tests
./scripts/smoke.sh

# Test specific endpoint
./scripts/smoke.sh https://your-app.fly.dev
```

### CI/CD Pipeline

The project includes automated deployment via GitHub Actions:

1. **Build**: Creates Docker image and pushes to GitHub Container Registry
2. **Test**: Runs smoke tests against the built image
3. **Deploy**: Deploys to Fly.io on main branch pushes
4. **Summary**: Reports deployment URL and endpoints

Required secrets:
- `FLY_API_TOKEN`: Fly.io deployment token

## Sprint Planning

- **Sprint 1**: ✅ Ontology seed + CI
- **Sprint 2**: ✅ API wrapper + playground UI  
- **Sprint 3**: ✅ Mini SemCom encoder/decoder PoC
- **Sprint 4**: ✅ ZKP-backed provenance ledger
- **Sprint 5**: ✅ CI Speed-up with caching
- **Sprint 6**: ✅ Deployment & Demo Readiness

## Mission

Deliver verifiable, bandwidth-efficient, emotion-aware communication through:
- Scale-independent ontology foundation
- SHACL validation for concept verification
- Future integration with Semantic Communication (6G SemCom)
- Trust Ledger with Zero-Knowledge Proofs
- Empathy Vectors via Codec Avatars
- Distributed agent mesh architecture

---

🤖 Built with OntoSeed - Scale-independent knowledge representation