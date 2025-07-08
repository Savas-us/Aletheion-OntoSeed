# API Reference

## Validation API

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

## Semantic Communication API

### POST /api/semcom

Encode/decode semantic communication packages.

**Request:**
- Method: `POST`
- Content-Type: `text/turtle`
- Body: Turtle RDF content for encoding

**Response:**
```json
{
  "encoded": "compressed_package",
  "originalSize": number,
  "compressedSize": number,
  "compressionRatio": number
}
```

## Provenance API

### POST /api/prov

Create a new provenance record with ZKP.

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: `{"entity": "string", "activity": "string", "agent": "string"}`

**Response:**
```json
{
  "id": "string",
  "proof": "zkp_proof_data",
  "hash": "string"
}
```

### GET /api/prov/{id}

Retrieve a provenance record.

**Response:**
```json
{
  "id": "string",
  "entity": "string",
  "activity": "string",
  "agent": "string",
  "timestamp": "ISO_date",
  "proof": "zkp_proof_data",
  "verified": boolean
}
```

### POST /api/prov/verify

Verify a ZKP proof.

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: `{"proof": "zkp_proof_data", "publicSignals": [...]}`

**Response:**
```json
{
  "verified": boolean,
  "details": "string"
}
```