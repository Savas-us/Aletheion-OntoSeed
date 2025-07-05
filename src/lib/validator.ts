import { OntoSeedOntology } from './ontology';

/**
 * OntoSeed Validation Engine
 * Validates new concepts against the four universal rules
 */
export class OntoSeedValidator {
  private ontology: OntoSeedOntology;

  constructor(ontology: OntoSeedOntology) {
    this.ontology = ontology;
  }

  /**
   * Validate a new concept against OntoSeed universal rules
   */
  validateConcept(conceptUri: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    // Rule 1: Identity validation
    const identityResult = this.validateIdentityRule(conceptUri);
    errors.push(...identityResult.errors);
    warnings.push(...identityResult.warnings);
    info.push(...identityResult.info);

    // Rule 2: Containment validation
    const containmentResult = this.validateContainmentRule(conceptUri);
    errors.push(...containmentResult.errors);
    warnings.push(...containmentResult.warnings);
    info.push(...containmentResult.info);

    // Rule 3: Causality validation
    const causalityResult = this.validateCausalityRule(conceptUri);
    errors.push(...causalityResult.errors);
    warnings.push(...causalityResult.warnings);
    info.push(...causalityResult.info);

    // Rule 4: Reflection validation
    const reflectionResult = this.validateReflectionRule(conceptUri);
    errors.push(...reflectionResult.errors);
    warnings.push(...reflectionResult.warnings);
    info.push(...reflectionResult.info);

    return {
      conceptUri,
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
      compliance: this.ontology.getComplianceReport(conceptUri),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate Rule 1: Identity
   */
  private validateIdentityRule(conceptUri: string): RuleValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    if (!this.ontology.hasIdentity(conceptUri)) {
      errors.push({
        rule: 'identity',
        severity: 'error',
        message: 'Concept must have an identity',
        conceptUri,
        suggestion: 'Add an identity using onto:hasIdentity property'
      });
    } else {
      info.push({
        rule: 'identity',
        message: 'Identity rule satisfied',
        conceptUri
      });
    }

    return { errors, warnings, info };
  }

  /**
   * Validate Rule 2: Containment
   */
  private validateContainmentRule(conceptUri: string): RuleValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    const canContain = this.ontology.canContain(conceptUri);
    
    if (!canContain) {
      info.push({
        rule: 'containment',
        message: 'Concept does not participate in containment relationships',
        conceptUri
      });
    } else {
      info.push({
        rule: 'containment',
        message: 'Containment rule satisfied',
        conceptUri
      });
    }

    return { errors, warnings, info };
  }

  /**
   * Validate Rule 3: Causality
   */
  private validateCausalityRule(conceptUri: string): RuleValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    const hasCausalRelations = this.ontology.hasCausalRelations(conceptUri);
    
    if (!hasCausalRelations) {
      info.push({
        rule: 'causality',
        message: 'Concept does not participate in causal relationships',
        conceptUri
      });
    } else {
      info.push({
        rule: 'causality',
        message: 'Causality rule satisfied',
        conceptUri
      });
    }

    return { errors, warnings, info };
  }

  /**
   * Validate Rule 4: Reflection
   */
  private validateReflectionRule(conceptUri: string): RuleValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    const hasReflections = this.ontology.hasReflections(conceptUri);
    
    if (!hasReflections) {
      info.push({
        rule: 'reflection',
        message: 'Concept does not participate in reflection relationships',
        conceptUri
      });
    } else {
      info.push({
        rule: 'reflection',
        message: 'Reflection rule satisfied',
        conceptUri
      });
    }

    return { errors, warnings, info };
  }

  /**
   * Batch validate multiple concepts
   */
  validateBatch(conceptUris: string[]): BatchValidationResult {
    const results = conceptUris.map(uri => this.validateConcept(uri));
    
    const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);
    const totalWarnings = results.reduce((sum, result) => sum + result.warnings.length, 0);
    const validConcepts = results.filter(result => result.isValid).length;

    return {
      results,
      summary: {
        totalConcepts: conceptUris.length,
        validConcepts,
        invalidConcepts: conceptUris.length - validConcepts,
        totalErrors,
        totalWarnings
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate a detailed validation report
   */
  generateReport(result: ValidationResult): string {
    const lines: string[] = [];
    
    lines.push(`OntoSeed Validation Report`);
    lines.push(`Concept: ${result.conceptUri}`);
    lines.push(`Status: ${result.isValid ? 'VALID' : 'INVALID'}`);
    lines.push(`Timestamp: ${result.timestamp}`);
    lines.push('');

    // Compliance overview
    lines.push('Universal Rules Compliance:');
    lines.push(`  Identity: ${result.compliance.identity ? '✓' : '✗'}`);
    lines.push(`  Containment: ${result.compliance.containment ? '✓' : '✗'}`);
    lines.push(`  Causality: ${result.compliance.causality ? '✓' : '✗'}`);
    lines.push(`  Reflection: ${result.compliance.reflection ? '✓' : '✗'}`);
    lines.push('');

    // Errors
    if (result.errors.length > 0) {
      lines.push('ERRORS:');
      result.errors.forEach(error => {
        lines.push(`  [${error.rule.toUpperCase()}] ${error.message}`);
        if (error.suggestion) {
          lines.push(`    Suggestion: ${error.suggestion}`);
        }
      });
      lines.push('');
    }

    // Warnings
    if (result.warnings.length > 0) {
      lines.push('WARNINGS:');
      result.warnings.forEach(warning => {
        lines.push(`  [${warning.rule.toUpperCase()}] ${warning.message}`);
        if (warning.suggestion) {
          lines.push(`    Suggestion: ${warning.suggestion}`);
        }
      });
      lines.push('');
    }

    // Info
    if (result.info.length > 0) {
      lines.push('INFO:');
      result.info.forEach(info => {
        lines.push(`  [${info.rule.toUpperCase()}] ${info.message}`);
      });
    }

    return lines.join('\n');
  }
}

// Type definitions
export interface ValidationResult {
  conceptUri: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
  compliance: {
    identity: boolean;
    containment: boolean;
    causality: boolean;
    reflection: boolean;
    overallCompliant: boolean;
  };
  timestamp: string;
}

export interface ValidationError {
  rule: string;
  severity: 'error';
  message: string;
  conceptUri: string;
  suggestion?: string;
}

export interface ValidationWarning {
  rule: string;
  severity: 'warning';
  message: string;
  conceptUri: string;
  suggestion?: string;
}

export interface ValidationInfo {
  rule: string;
  message: string;
  conceptUri: string;
}

interface RuleValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
}

export interface BatchValidationResult {
  results: ValidationResult[];
  summary: {
    totalConcepts: number;
    validConcepts: number;
    invalidConcepts: number;
    totalErrors: number;
    totalWarnings: number;
  };
  timestamp: string;
}