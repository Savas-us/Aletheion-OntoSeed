'use client';

import { useState } from 'react';

export default function SemComPage() {
  const [turtleInput, setTurtleInput] = useState('');
  const [encodedOutput, setEncodedOutput] = useState('');
  const [decodedOutput, setDecodedOutput] = useState('');
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEncode = async () => {
    if (!turtleInput.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/semcom?action=encode', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/turtle'
        },
        body: turtleInput
      });
      
      if (!response.ok) {
        throw new Error('Failed to encode');
      }
      
      const data = await response.json();
      setEncodedOutput(JSON.stringify(data.package, null, 2));
      setCompressionStats(data.stats);
    } catch (error) {
      console.error('Encoding error:', error);
      setEncodedOutput('Error: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async () => {
    if (!encodedOutput.trim()) return;
    
    setLoading(true);
    try {
      const packageData = JSON.parse(encodedOutput);
      
      const response = await fetch('/api/semcom?action=decode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to decode');
      }
      
      const data = await response.json();
      setDecodedOutput(data.turtle);
    } catch (error) {
      console.error('Decoding error:', error);
      setDecodedOutput('Error: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    const exampleTurtle = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ex: <http://example.org/> .

ex:Cell1 a owl:NamedIndividual ;
    rdfs:label "Cell Example" ;
    rdfs:comment "A sample cell entity" .

ex:Human1 a owl:NamedIndividual ;
    rdfs:label "Human Example" ;
    rdfs:comment "A sample human entity" .`;
    
    setTurtleInput(exampleTurtle);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">SemCom Playground</h1>
        <p className="text-gray-600 mb-8">
          Compress Turtle RDF into Semantic Communication packages for bandwidth-efficient transmission
        </p>
        
        {/* Compression Stats Badge */}
        {compressionStats && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">
                Compression: {compressionStats.compressionRatio}% saved
              </span>
              <span className="text-sm text-green-600">
                {compressionStats.originalSize} → {compressionStats.compressedSize} bytes
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input: Turtle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">1. Turtle Input</h2>
              <button
                onClick={loadExample}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={turtleInput}
              onChange={(e) => setTurtleInput(e.target.value)}
              placeholder="Enter Turtle RDF content here..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none"
            />
            <button
              onClick={handleEncode}
              disabled={loading || !turtleInput.trim()}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Encoding...' : 'Encode →'}
            </button>
          </div>

          {/* Output: JSON Package */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">2. SemCom Package</h2>
            <textarea
              value={encodedOutput}
              onChange={(e) => setEncodedOutput(e.target.value)}
              placeholder="Encoded JSON package will appear here..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none"
            />
            <button
              onClick={handleDecode}
              disabled={loading || !encodedOutput.trim()}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Decoding...' : 'Decode →'}
            </button>
          </div>

          {/* Output: Decoded Turtle */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">3. Decoded Turtle</h2>
            <textarea
              value={decodedOutput}
              readOnly
              placeholder="Decoded Turtle will appear here..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50"
            />
            <div className="text-sm text-gray-600">
              Round-trip validation: Compare with original input
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How SemCom Works</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• <strong>Concepts:</strong> Extracts unique entities with SHA-1 based IDs</li>
            <li>• <strong>Intents:</strong> Compresses semantic meaning using label hashes</li>
            <li>• <strong>Bandwidth:</strong> Reduces payload size for efficient transmission</li>
            <li>• <strong>Round-trip:</strong> Enables reconstruction of original semantic content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}