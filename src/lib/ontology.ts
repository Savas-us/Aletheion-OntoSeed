import { Parser, Store, DataFactory, Quad } from 'n3';
import { readFileSync } from 'fs';
import { join } from 'path';

const { namedNode, literal, quad } = DataFactory;

/**
 * OntoSeed Ontology Manager
 * Handles loading, validation, and querying of the core ontology
 */
export class OntoSeedOntology {
  private store: Store;
  private coreOntologyLoaded = false;
  private shapesLoaded = false;

  constructor() {
    this.store = new Store();
  }

  /**
   * Load the core OntoSeed ontology from TTL files
   */
  async loadCoreOntology(): Promise<void> {
    try {
      const coreOntologyPath = join(process.cwd(), 'src', 'ontology', 'core.ttl');
      const shapesPath = join(process.cwd(), 'src', 'ontology', 'shapes.ttl');

      // Load core ontology
      const coreContent = readFileSync(coreOntologyPath, 'utf-8');
      await this.parseAndStore(coreContent, 'text/turtle');
      this.coreOntologyLoaded = true;

      // Load SHACL shapes
      const shapesContent = readFileSync(shapesPath, 'utf-8');
      await this.parseAndStore(shapesContent, 'text/turtle');
      this.shapesLoaded = true;

      console.log('✓ OntoSeed core ontology and shapes loaded successfully');
    } catch (error) {
      console.error('Failed to load OntoSeed ontology:', error);
      throw error;
    }
  }

  /**
   * Parse and store RDF content
   */
  private async parseAndStore(content: string, contentType: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const parser = new Parser({ format: contentType });
      const quads: Quad[] = [];

      parser.parse(content, (error, quad) => {
        if (error) {
          reject(error);
          return;
        }

        if (quad) {
          quads.push(quad);
        } else {
          // Parsing complete
          this.store.addQuads(quads);
          resolve();
        }
      });
    });
  }

  /**
   * Check if an entity follows the Identity rule
   */
  hasIdentity(entityUri: string): boolean {
    const entity = namedNode(entityUri);
    const hasIdentityProp = namedNode('http://ontoseed.org/core#hasIdentity');
    
    const identityQuads = this.store.getQuads(entity, hasIdentityProp, null, null);
    return identityQuads.length > 0;
  }

  /**
   * Check if an entity can participate in containment relationships
   */
  canContain(entityUri: string): boolean {
    const entity = namedNode(entityUri);
    const containsProp = namedNode('http://ontoseed.org/core#contains');
    
    const containsQuads = this.store.getQuads(entity, containsProp, null, null);
    return containsQuads.length > 0;
  }

  /**
   * Check if an entity participates in causal relationships
   */
  hasCausalRelations(entityUri: string): boolean {
    const entity = namedNode(entityUri);
    const causesProp = namedNode('http://ontoseed.org/core#causes');
    const causedByProp = namedNode('http://ontoseed.org/core#causedBy');
    
    const causesQuads = this.store.getQuads(entity, causesProp, null, null);
    const causedByQuads = this.store.getQuads(entity, causedByProp, null, null);
    
    return causesQuads.length > 0 || causedByQuads.length > 0;
  }

  /**
   * Check if an entity participates in reflection relationships
   */
  hasReflections(entityUri: string): boolean {
    const entity = namedNode(entityUri);
    const reflectsProp = namedNode('http://ontoseed.org/core#reflects');
    const reflectedByProp = namedNode('http://ontoseed.org/core#reflectedBy');
    
    const reflectsQuads = this.store.getQuads(entity, reflectsProp, null, null);
    const reflectedByQuads = this.store.getQuads(entity, reflectedByProp, null, null);
    
    return reflectsQuads.length > 0 || reflectedByQuads.length > 0;
  }

  /**
   * Add a new entity with automatic universal rule compliance
   */
  addEntity(entityUri: string, label?: string, comment?: string): void {
    const entity = namedNode(entityUri);
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const entityClass = namedNode('http://ontoseed.org/core#Entity');
    const rdfsLabel = namedNode('http://www.w3.org/2000/01/rdf-schema#label');
    const rdfsComment = namedNode('http://www.w3.org/2000/01/rdf-schema#comment');
    
    // Add basic entity type
    this.store.addQuad(quad(entity, rdfType, entityClass));
    
    // Add label if provided
    if (label) {
      this.store.addQuad(quad(entity, rdfsLabel, literal(label)));
    }
    
    // Add comment if provided
    if (comment) {
      this.store.addQuad(quad(entity, rdfsComment, literal(comment)));
    }

    // Automatically ensure identity rule compliance
    this.ensureIdentity(entityUri);
  }

  /**
   * Ensure an entity has an identity (Rule 1)
   */
  private ensureIdentity(entityUri: string): void {
    if (!this.hasIdentity(entityUri)) {
      const entity = namedNode(entityUri);
      const hasIdentityProp = namedNode('http://ontoseed.org/core#hasIdentity');
      const identityUri = `${entityUri}/identity`;
      const identity = namedNode(identityUri);
      const identityClass = namedNode('http://ontoseed.org/core#Identity');
      const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
      const identityValueProp = namedNode('http://ontoseed.org/core#identityValue');
      
      // Create identity
      this.store.addQuad(quad(identity, rdfType, identityClass));
      this.store.addQuad(quad(identity, identityValueProp, literal(entityUri)));
      this.store.addQuad(quad(entity, hasIdentityProp, identity));
    }
  }

  /**
   * Get all entities that follow the four universal rules
   */
  getCompliantEntities(): string[] {
    const entityClass = namedNode('http://ontoseed.org/core#Entity');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    
    const entityQuads = this.store.getQuads(null, rdfType, entityClass, null);
    
    return entityQuads
      .map(quad => quad.subject.value)
      .filter(entityUri => {
        // Check if entity follows at least the identity rule
        return this.hasIdentity(entityUri);
      });
  }

  /**
   * Generate a compliance report for an entity
   */
  getComplianceReport(entityUri: string): {
    identity: boolean;
    containment: boolean;
    causality: boolean;
    reflection: boolean;
    overallCompliant: boolean;
  } {
    const identity = this.hasIdentity(entityUri);
    const containment = this.canContain(entityUri);
    const causality = this.hasCausalRelations(entityUri);
    const reflection = this.hasReflections(entityUri);
    
    return {
      identity,
      containment,
      causality,
      reflection,
      overallCompliant: identity // At minimum, must have identity
    };
  }

  /**
   * Get the total number of triples in the ontology
   */
  getTripleCount(): number {
    return this.store.size;
  }

  /**
   * Export the ontology as N-Triples
   */
  exportAsNTriples(): string {
    const quads = this.store.getQuads(null, null, null, null);
    return quads.map(quad => 
      `${quad.subject.value} ${quad.predicate.value} ${quad.object.value} .`
    ).join('\n');
  }

  /**
   * Check if the ontology is ready for use
   */
  isReady(): boolean {
    return this.coreOntologyLoaded && this.shapesLoaded;
  }
}

// Singleton instance
let ontoSeedInstance: OntoSeedOntology | null = null;

/**
 * Get the singleton OntoSeed ontology instance
 */
export function getOntoSeed(): OntoSeedOntology {
  if (!ontoSeedInstance) {
    ontoSeedInstance = new OntoSeedOntology();
  }
  return ontoSeedInstance;
}

/**
 * Initialize the OntoSeed ontology
 */
export async function initializeOntoSeed(): Promise<OntoSeedOntology> {
  const ontology = getOntoSeed();
  if (!ontology.isReady()) {
    await ontology.loadCoreOntology();
  }
  return ontology;
}