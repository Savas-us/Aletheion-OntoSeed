import { Parser } from 'n3';
import { createHash } from 'crypto';

export interface SemComPackage {
  concepts: Array<{ id: string; uri: string }>;
  intents: Array<{ id: string; hash: string }>;
}

export function encode(turtle: string): SemComPackage {
  const parser = new Parser();
  const quads = parser.parse(turtle);
  
  // Extract unique subjects (concepts)
  const subjectMap = new Map<string, string>();
  const labelMap = new Map<string, string>();
  
  quads.forEach(quad => {
    if (quad.subject.value) {
      subjectMap.set(quad.subject.value, quad.subject.value);
    }
    
    // Extract labels for intent calculation
    if (quad.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label' && 
        quad.object.value) {
      labelMap.set(quad.subject.value, quad.object.value);
    }
  });
  
  // Generate concepts with SHA-1 based IDs
  const concepts: Array<{ id: string; uri: string }> = [];
  const intents: Array<{ id: string; hash: string }> = [];
  
  Array.from(subjectMap.keys()).forEach(uri => {
    // Generate ID from URI hash
    const id = createHash('sha1').update(uri).digest('hex').substring(0, 8);
    
    concepts.push({ id, uri });
    
    // Generate intent hash from label (if exists)
    const label = labelMap.get(uri);
    if (label) {
      const intentHash = createHash('sha1').update(label).digest('hex').substring(0, 8);
      intents.push({ id, hash: intentHash });
    }
  });
  
  return {
    concepts,
    intents
  };
}