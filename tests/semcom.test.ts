import { encode } from '../src/lib/semcom/encode';
import { decode } from '../src/lib/semcom/decode';

describe('SemCom Encoder/Decoder', () => {
  const sampleTurtle = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ex: <http://example.org/> .

ex:Cell1 a owl:NamedIndividual ;
    rdfs:label "Cell Example" ;
    rdfs:comment "A sample cell entity" .

ex:Human1 a owl:NamedIndividual ;
    rdfs:label "Human Example" ;
    rdfs:comment "A sample human entity" .`;

  test('encode should convert Turtle to SemComPackage', () => {
    const result = encode(sampleTurtle);
    
    expect(result).toHaveProperty('concepts');
    expect(result).toHaveProperty('intents');
    expect(Array.isArray(result.concepts)).toBe(true);
    expect(Array.isArray(result.intents)).toBe(true);
    expect(result.concepts.length).toBeGreaterThan(0);
    expect(result.intents.length).toBeGreaterThan(0);
    
    // Check concept structure
    result.concepts.forEach(concept => {
      expect(concept).toHaveProperty('id');
      expect(concept).toHaveProperty('uri');
      expect(typeof concept.id).toBe('string');
      expect(typeof concept.uri).toBe('string');
    });
    
    // Check intent structure
    result.intents.forEach(intent => {
      expect(intent).toHaveProperty('id');
      expect(intent).toHaveProperty('hash');
      expect(typeof intent.id).toBe('string');
      expect(typeof intent.hash).toBe('string');
    });
  });

  test('decode should convert SemComPackage to Turtle', () => {
    const semComPackage = {
      concepts: [
        { id: 'c1', uri: 'http://example.org/Cell1' },
        { id: 'c2', uri: 'http://example.org/Human1' }
      ],
      intents: [
        { id: 'c1', hash: 'abc123' },
        { id: 'c2', hash: 'def456' }
      ]
    };
    
    const result = decode(semComPackage);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('@prefix');
    expect(result).toContain('http://example.org/Cell1');
    expect(result).toContain('http://example.org/Human1');
    expect(result).toContain('owl:NamedIndividual');
    expect(result).toContain('rdfs:label');
  });

  test('round-trip encode/decode should preserve structure', () => {
    // Encode the sample turtle
    const encoded = encode(sampleTurtle);
    
    // Decode it back
    const decoded = decode(encoded);
    
    // Re-encode to compare structure
    const reEncoded = encode(decoded);
    
    // Should have same number of concepts
    expect(reEncoded.concepts.length).toBe(encoded.concepts.length);
    expect(reEncoded.intents.length).toBe(encoded.intents.length);
    
    // URIs should be preserved
    const originalUris = encoded.concepts.map(c => c.uri).sort();
    const roundTripUris = reEncoded.concepts.map(c => c.uri).sort();
    expect(roundTripUris).toEqual(originalUris);
  });

  test('encode should handle empty input', () => {
    const result = encode('');
    
    expect(result.concepts).toEqual([]);
    expect(result.intents).toEqual([]);
  });

  test('encode should generate consistent IDs for same URIs', () => {
    const turtle1 = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ex: <http://example.org/> .
ex:Test1 a owl:NamedIndividual ;
    rdfs:label "Test" .`;
    
    const turtle2 = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ex: <http://example.org/> .
ex:Test1 a owl:NamedIndividual ;
    rdfs:label "Test" .`;
    
    const result1 = encode(turtle1);
    const result2 = encode(turtle2);
    
    expect(result1.concepts[0].id).toBe(result2.concepts[0].id);
    expect(result1.intents[0].hash).toBe(result2.intents[0].hash);
  });

  test('decode should handle empty package', () => {
    const emptyPackage = { concepts: [], intents: [] };
    const result = decode(emptyPackage);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('@prefix');
  });
});