'use client';

import { useState } from 'react';

interface ValidationResult {
  conforms: boolean;
  report: string;
  error?: string;
}

export default function PlaygroundPage() {
  const [turtleContent, setTurtleContent] = useState(`@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .

# Example concept to validate
ex:TestEntity a ex:Cell ;
    rdfs:label "Test Cell" ;
    rdfs:comment "A test biological cell" ;
    onto:hasIdentity ex:TestEntity_Identity .

ex:TestEntity_Identity a onto:Identity ;
    onto:identityValue "test-cell-001" .`);

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  const handleValidate = async () => {
    if (!turtleContent.trim()) {
      alert('Please enter some turtle content to validate');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/turtle',
        },
        body: turtleContent,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Validation failed');
      }

      setValidationResult(result);
      setShowFullReport(false);
    } catch (error) {
      setValidationResult({
        conforms: false,
        report: `Error: ${error instanceof Error ? error.message : String(error)}`,
        error: String(error)
      });
    } finally {
      setIsValidating(false);
    }
  };

  const loadExample = (example: string) => {
    const examples = {
      valid: `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .

# Valid concept following OntoSeed rules
ex:ValidCell a ex:Cell ;
    rdfs:label "Valid Cell" ;
    rdfs:comment "A properly structured cell" ;
    onto:hasIdentity ex:ValidCell_Identity .

ex:ValidCell_Identity a onto:Identity ;
    onto:identityValue "valid-cell-001" .`,

      invalid: `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .

# Invalid concept - missing identity
ex:InvalidCell a ex:Cell ;
    rdfs:label "Invalid Cell" ;
    rdfs:comment "A cell missing required identity" .`,

      containment: `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .

# Containment relationship example
ex:Human1 a ex:Human ;
    rdfs:label "Human Example" ;
    onto:hasIdentity ex:Human1_Identity ;
    onto:contains ex:Cell1 .

ex:Human1_Identity a onto:Identity ;
    onto:identityValue "human-example-001" .

ex:Cell1 a ex:Cell ;
    rdfs:label "Cell Example" ;
    onto:hasIdentity ex:Cell1_Identity ;
    onto:containedBy ex:Human1 .

ex:Cell1_Identity a onto:Identity ;
    onto:identityValue "cell-example-001" .`
    };

    setTurtleContent(examples[example as keyof typeof examples] || examples.valid);
    setValidationResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              OntoSeed Playground
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Validate your concepts against OntoSeed universal rules
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Turtle Content
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadExample('valid')}
                      className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded"
                    >
                      Valid Example
                    </button>
                    <button
                      onClick={() => loadExample('invalid')}
                      className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded"
                    >
                      Invalid Example
                    </button>
                    <button
                      onClick={() => loadExample('containment')}
                      className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                    >
                      Containment Example
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={turtleContent}
                  onChange={(e) => setTurtleContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your Turtle RDF content here..."
                />
                
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={handleValidate}
                    disabled={isValidating || !turtleContent.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isValidating ? 'Validating...' : 'Validate Against OntoSeed Rules'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Validation Results
                </h2>
                
                {isValidating && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700 dark:text-blue-300">Running SHACL validation...</span>
                  </div>
                )}

                {validationResult && (
                  <div className="space-y-4">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                      validationResult.conforms
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        validationResult.conforms ? 'bg-green-600' : 'bg-red-600'
                      }`}></div>
                      {validationResult.conforms ? 'Valid ✓' : 'Invalid ✗'}
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {validationResult.conforms ? 'Validation Passed' : 'Validation Failed'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {validationResult.conforms
                          ? 'Your concept follows all OntoSeed universal rules.'
                          : 'Your concept violates one or more OntoSeed universal rules.'}
                      </p>
                    </div>

                    {/* Detailed Report */}
                    {validationResult.report && (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowFullReport(!showFullReport)}
                          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${showFullReport ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {showFullReport ? 'Hide' : 'Show'} Detailed Report
                        </button>
                        
                        {showFullReport && (
                          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-auto max-h-96 border">
                            {validationResult.report}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!validationResult && !isValidating && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Click &quot;Validate&quot; to check your concept</p>
                  </div>
                )}
              </div>

              {/* Help Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  OntoSeed Universal Rules
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="font-medium text-blue-600 min-w-[60px]">Rule 1:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Identity</strong> - Every entity must have exactly one identity
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-medium text-green-600 min-w-[60px]">Rule 2:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Containment</strong> - Entities can contain and be contained by others
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-medium text-purple-600 min-w-[60px]">Rule 3:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Cause</strong> - Entities can cause and be caused by others
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-medium text-orange-600 min-w-[60px]">Rule 4:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Reflection</strong> - Entities can reflect and be reflected by others
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}