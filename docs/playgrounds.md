# Interactive Playgrounds

OntoSeed provides three interactive playgrounds for exploring different aspects of the system.

## SHACL Playground

**URL**: `/playground`

Interactive validation of RDF Turtle concepts against OntoSeed's universal rules.

### Features

- Real-time validation feedback
- Detailed error reporting
- Example concepts (valid/invalid)
- Interactive SHACL shape testing

### Example Usage

1. Visit the playground at `http://localhost:3000/playground`
2. Enter Turtle RDF content in the editor
3. Click "Validate Against OntoSeed Rules"
4. Review validation results and reports

### Sample Concepts

**Valid Concept:**
```turtle
@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .

ex:MyCell a ex:Cell ;
    rdfs:label "My Cell" ;
    onto:hasIdentity ex:MyCell_Identity .

ex:MyCell_Identity a onto:Identity ;
    onto:identityValue "my-cell-001" .
```

**Invalid Concept:**
```turtle
@prefix ex: <http://example.org/> .

ex:MyCell a ex:Cell ;
    rdfs:label "My Cell" .
# Missing required identity - will fail validation
```

## SemCom Playground

**URL**: `/semcom`

Experience bandwidth-efficient semantic communication encoding/decoding.

### Features

- Real-time compression ratio calculation
- Round-trip validation (encode → decode → original)
- Interactive UI with live examples
- Bandwidth optimization for 6G SemCom applications

### Workflow

1. **Encode**: Convert Turtle RDF into compressed packages
2. **Decode**: Restore original semantic content
3. **Analyze**: View compression statistics and bandwidth savings

### Use Cases

- Optimizing RDF transmission over limited bandwidth
- Testing semantic preservation in compressed formats
- Analyzing compression ratios for different ontology patterns

## Provenance Ledger

**URL**: `/provenance`

Zero-knowledge proof system for trust and verification.

### Features

- ZKP proof generation using Circom circuits
- Provenance record creation and verification
- Interactive proof validation
- Cryptographic integrity checking

### Operations

1. **Record**: Create new provenance entries
2. **Verify**: Check ZKP proofs cryptographically
3. **Chain**: Link multiple provenance records
4. **Audit**: Review provenance history

### Example Workflow

1. Create a provenance record with entity/activity/agent
2. System generates ZKP proof automatically
3. Verify proof cryptographically
4. Chain multiple records for audit trail

## Development Tips

### Testing Concepts

- Start with simple Identity-only concepts
- Gradually add Containment, Cause, and Reflection
- Use the validation playground to debug SHACL errors
- Test edge cases and boundary conditions

### Performance Considerations

- Large RDF documents may take longer to validate
- Complex ZKP circuits increase proof generation time
- Use SemCom encoding for bandwidth-constrained environments

### Integration

All playgrounds use the same API endpoints:
- `/api/validate` for SHACL validation
- `/api/semcom` for semantic communication
- `/api/prov` for provenance operations