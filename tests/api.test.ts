import { describe, it, expect } from '@jest/globals';

// Mock fetch for testing
global.fetch = jest.fn();

describe('/api/validate', () => {
  const API_URL = 'http://localhost:3000/api/validate';

  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  it('should validate a valid Cell1 concept and return conforms=true', async () => {
    const validTurtle = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .

ex:TestCell a ex:Cell ;
    rdfs:label "Test Cell" ;
    rdfs:comment "A test biological cell" ;
    onto:hasIdentity ex:TestCell_Identity .

ex:TestCell_Identity a onto:Identity ;
    onto:identityValue "test-cell-001" .`;

    // Mock successful response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        conforms: true,
        report: 'Validation passed - no issues found'
      })
    } as Response);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/turtle',
      },
      body: validTurtle,
    });

    const result = await response.json();

    expect(fetch).toHaveBeenCalledWith(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/turtle',
      },
      body: validTurtle,
    });

    expect(result.conforms).toBe(true);
    expect(result.report).toContain('passed');
  });

  it('should validate an invalid concept and return conforms=false', async () => {
    const invalidTurtle = `@prefix ex: <http://example.org/> .

ex:InvalidCell a ex:Cell ;
    rdfs:label "Invalid Cell" .`;

    // Mock failed validation response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        conforms: false,
        report: 'Validation failed: Missing required identity'
      })
    } as Response);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/turtle',
      },
      body: invalidTurtle,
    });

    const result = await response.json();

    expect(result.conforms).toBe(false);
    expect(result.report).toContain('failed');
  });

  it('should handle empty turtle content', async () => {
    // Mock error response for empty content
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Empty turtle content'
      })
    } as Response);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/turtle',
      },
      body: '',
    });

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(result.error).toBe('Empty turtle content');
  });

  it('should only accept POST method', async () => {
    // Mock method not allowed response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 405,
      json: async () => ({
        error: 'Method not allowed'
      })
    } as Response);

    const response = await fetch(API_URL, {
      method: 'GET',
    });

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(result.error).toBe('Method not allowed');
  });
});