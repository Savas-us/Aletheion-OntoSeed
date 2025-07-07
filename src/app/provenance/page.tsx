'use client';

import { useState } from 'react';

interface ProvenanceEvent {
  id: number;
  subject: string;
  predicate: string;
  object: string;
  timestamp: number;
  hash: string;
}

interface ProvenanceRecord {
  id: number;
  hash: string;
  proof: unknown;
  publicSignals: string[];
}

interface VerificationResult {
  valid?: boolean;
  error?: string;
}

export default function ProvenancePage() {
  const [recordSubj, setRecordSubj] = useState('');
  const [recordObj, setRecordObj] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyProof, setVerifyProof] = useState('');
  const [verifyPublicSignals, setVerifyPublicSignals] = useState('');
  const [chainUri, setChainUri] = useState('');
  const [recordResult, setRecordResult] = useState<ProvenanceRecord | { error: string } | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [chainResult, setChainResult] = useState<ProvenanceEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRecord = async () => {
    if (!recordSubj.trim() || !recordObj.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/prov?action=record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subj: recordSubj,
          obj: recordObj
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setRecordResult(data.record);
        // Auto-populate verify form with the new record
        setVerifyHash(data.record.hash);
        setVerifyProof(JSON.stringify(data.record.proof, null, 2));
        setVerifyPublicSignals(JSON.stringify(data.record.publicSignals, null, 2));
      } else {
        setRecordResult({ error: data.error });
      }
    } catch (_error) {
      setRecordResult({ error: String(_error) });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyHash.trim() || !verifyProof.trim() || !verifyPublicSignals.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/prov?action=verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hash: verifyHash,
          proof: JSON.parse(verifyProof),
          publicSignals: JSON.parse(verifyPublicSignals)
        })
      });
      
      const data = await response.json();
      setVerifyResult(data);
    } catch (_error) {
      setVerifyResult({ error: String(_error) });
    } finally {
      setLoading(false);
    }
  };

  const handleGetChain = async () => {
    if (!chainUri.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/prov?action=chain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uri: chainUri
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setChainResult(data.chain);
      } else {
        setChainResult([]);
      }
    } catch (_error) {
      setChainResult([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setRecordSubj('http://example.org/Human1');
    setRecordObj('http://example.org/Company1');
    setChainUri('http://example.org/Human1');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Provenance Ledger</h1>
        <p className="text-gray-600 mb-8">
          Record causality events with ZKP proofs and verify provenance chains
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Record Event */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">1. Record Cause Event</h2>
              <button
                onClick={loadExample}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Load Example
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={recordSubj}
                onChange={(e) => setRecordSubj(e.target.value)}
                placeholder="Subject URI (what causes)"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={recordObj}
                onChange={(e) => setRecordObj(e.target.value)}
                placeholder="Object URI (what is caused)"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleRecord}
                disabled={loading || !recordSubj.trim() || !recordObj.trim()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Recording...' : 'Record Event + Generate Proof'}
              </button>
            </div>
            
            {recordResult && (
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-medium mb-2">Record Result:</h3>
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(recordResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Verify Proof */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">2. Verify ZKP Proof</h2>
            
            <div className="space-y-3">
              <input
                type="text"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                placeholder="Event Hash"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <textarea
                value={verifyProof}
                onChange={(e) => setVerifyProof(e.target.value)}
                placeholder="Proof JSON"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <textarea
                value={verifyPublicSignals}
                onChange={(e) => setVerifyPublicSignals(e.target.value)}
                placeholder="Public Signals JSON"
                className="w-full h-16 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={handleVerify}
                disabled={loading || !verifyHash.trim() || !verifyProof.trim()}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify Proof'}
              </button>
            </div>
            
            {verifyResult && (
              <div className={`p-4 border rounded-lg ${verifyResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className="font-medium mb-2">Verification Result:</h3>
                <div className={`text-lg font-bold ${verifyResult.valid ? 'text-green-700' : 'text-red-700'}`}>
                  {verifyResult.valid ? '✓ Proof Valid' : '✗ Proof Invalid'}
                </div>
                {verifyResult.error && (
                  <div className="text-sm text-red-600 mt-2">{verifyResult.error}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Provenance Chain */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">3. View Provenance Chain</h2>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={chainUri}
              onChange={(e) => setChainUri(e.target.value)}
              placeholder="Subject URI to trace"
              className="flex-1 p-3 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleGetChain}
              disabled={loading || !chainUri.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Get Chain'}
            </button>
          </div>
          
          {chainResult.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Object</th>
                    <th className="px-4 py-2 text-left">Timestamp</th>
                    <th className="px-4 py-2 text-left">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {chainResult.map((event) => (
                    <tr key={event.id} className="border-t">
                      <td className="px-4 py-2">{event.id}</td>
                      <td className="px-4 py-2 text-sm">{event.subject}</td>
                      <td className="px-4 py-2 text-sm">{event.object}</td>
                      <td className="px-4 py-2 text-sm">{new Date(event.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm font-mono">{event.hash.substring(0, 16)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How ZKP Provenance Works</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• <strong>Record:</strong> Events stored in SQLite with cryptographic hashes</li>
            <li>• <strong>Proof:</strong> ZKP proves hash correctness without revealing inputs</li>
            <li>• <strong>Verify:</strong> Groth16 verification ensures authenticity</li>
            <li>• <strong>Chain:</strong> Immutable causality relationships for trust</li>
          </ul>
        </div>
      </div>
    </div>
  );
}