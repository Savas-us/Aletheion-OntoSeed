# Four Universal Rules

OntoSeed is built on four foundational principles that provide universal structure for any ontological concept.

## 1. Identity

Every entity must have a unique identifier and self-reference.

**Implementation:**
- `onto:hasIdentity` property links entities to their identity
- `onto:Identity` class with `onto:identityValue` property
- Self-referential validation through SHACL shapes

**Example:**
```turtle
@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .

ex:MyEntity a onto:Entity ;
    rdfs:label "My Entity" ;
    onto:hasIdentity ex:MyEntity_Identity .

ex:MyEntity_Identity a onto:Identity ;
    onto:identityValue "unique-entity-001" .
```

## 2. Containment

Every entity can contain and be contained by other entities.

**Implementation:**
- `onto:contains` and `onto:containedBy` properties
- Hierarchical relationship validation
- Transitive containment support

**Example:**
```turtle
ex:ParentEntity a onto:Entity ;
    onto:contains ex:ChildEntity .

ex:ChildEntity a onto:Entity ;
    onto:containedBy ex:ParentEntity .
```

## 3. Cause

Every entity can cause and be caused by other entities with provenance.

**Implementation:**
- `onto:causes` and `onto:causedBy` properties
- Provenance tracking with timestamps
- ZKP-backed causality chains

**Example:**
```turtle
ex:CauseEntity a onto:Entity ;
    onto:causes ex:EffectEntity ;
    onto:hasProvenance ex:ProvenanceRecord .

ex:EffectEntity a onto:Entity ;
    onto:causedBy ex:CauseEntity .
```

## 4. Reflection

Every entity can reflect and be reflected by other entities.

**Implementation:**
- `onto:reflects` and `onto:reflectedBy` properties
- Meta-modeling capabilities
- Self-awareness and introspection

**Example:**
```turtle
ex:ConceptEntity a onto:Entity ;
    onto:reflects ex:MetaConceptEntity .

ex:MetaConceptEntity a onto:Entity ;
    onto:reflectedBy ex:ConceptEntity ;
    rdfs:comment "Meta-representation of ConceptEntity" .
```

## Rule Validation

All four rules are enforced through SHACL shapes that validate:

- **Identity**: Ensures every entity has a unique identity
- **Containment**: Validates hierarchical relationships
- **Cause**: Checks causality chains and provenance
- **Reflection**: Verifies meta-modeling consistency

## Compliance Levels

Entities can implement rules at different levels:

1. **Minimal**: Identity rule only (required)
2. **Structured**: Identity + Containment
3. **Causal**: Identity + Containment + Cause
4. **Complete**: All four rules implemented