import { SemComPackage } from './encode';

export function decode(pkg: SemComPackage): string {
  // Create a minimal Turtle representation from the SemComPackage
  const prefixes = [
    '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .',
    '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .',
    '@prefix owl: <http://www.w3.org/2002/07/owl#> .',
    ''
  ];
  
  // Build concept-to-intent mapping
  const intentMap = new Map<string, string>();
  pkg.intents.forEach(intent => {
    intentMap.set(intent.id, intent.hash);
  });
  
  // Generate Turtle triples
  const triples: string[] = [];
  
  pkg.concepts.forEach(concept => {
    const uri = concept.uri;
    
    // Basic type assertion
    triples.push(`<${uri}> a owl:NamedIndividual .`);
    
    // Add reconstructed label if intent exists
    const intentHash = intentMap.get(concept.id);
    if (intentHash) {
      // Generate a label from the intent hash (for minimal reconstruction)
      const label = `Entity_${intentHash}`;
      triples.push(`<${uri}> rdfs:label "${label}" .`);
    }
  });
  
  // Combine prefixes and triples
  const turtle = [
    ...prefixes,
    ...triples,
    ''
  ].join('\n');
  
  return turtle;
}