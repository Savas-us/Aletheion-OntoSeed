import { ProvenanceLedger } from '../src/lib/ledger/provenance';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

describe('Provenance Ledger', () => {
  let ledger: ProvenanceLedger;
  const testDbPath = join(process.cwd(), 'data', 'test_ledger.db');

  beforeEach(async () => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    
    ledger = new ProvenanceLedger();
    await ledger.init();
  });

  afterEach(async () => {
    await ledger.close();
    
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  test('should initialize database successfully', async () => {
    expect(ledger).toBeDefined();
  });

  test('should record provenance event with proof', async () => {
    const subj = 'http://example.org/Human1';
    const obj = 'http://example.org/Company1';
    
    const record = await ledger.recordEvent(subj, obj);
    
    expect(record).toHaveProperty('id');
    expect(record).toHaveProperty('hash');
    expect(record).toHaveProperty('proof');
    expect(record).toHaveProperty('publicSignals');
    expect(typeof record.id).toBe('number');
    expect(typeof record.hash).toBe('string');
    expect(record.hash).toHaveLength(64); // SHA-256 hex
  });

  test('should retrieve provenance chain for subject', async () => {
    const subj = 'http://example.org/Human1';
    const obj1 = 'http://example.org/Company1';
    const obj2 = 'http://example.org/Company2';
    
    await ledger.recordEvent(subj, obj1);
    await ledger.recordEvent(subj, obj2);
    
    const chain = await ledger.getChain(subj);
    
    expect(chain).toHaveLength(2);
    expect(chain[0].subject).toBe(subj);
    expect(chain[1].subject).toBe(subj);
    expect(chain[0].object).toBe(obj1);
    expect(chain[1].object).toBe(obj2);
    
    // Should be ordered by timestamp
    expect(chain[0].timestamp).toBeLessThanOrEqual(chain[1].timestamp);
  });

  test('should verify valid proof', async () => {
    const subj = 'http://example.org/Human1';
    const obj = 'http://example.org/Company1';
    
    const record = await ledger.recordEvent(subj, obj);
    
    const isValid = await ledger.verifyProof(
      record.hash,
      record.proof,
      record.publicSignals
    );
    
    expect(isValid).toBe(true);
  });

  test('should reject invalid proof', async () => {
    const fakeProof = {
      a: ['0x123', '0x456'],
      b: [['0x789', '0xabc'], ['0xdef', '0x012']],
      c: ['0x345', '0x678']
    };
    const fakePublicSignals = ['0xfakehash'];
    
    const isValid = await ledger.verifyProof(
      'fakehash',
      fakeProof,
      fakePublicSignals
    );
    
    expect(isValid).toBe(false);
  });

  test('should handle empty chain for unknown subject', async () => {
    const chain = await ledger.getChain('http://example.org/Unknown');
    
    expect(chain).toHaveLength(0);
  });

  test('round-trip: record and verify should succeed', async () => {
    const subj = 'http://example.org/TestSubject';
    const obj = 'http://example.org/TestObject';
    
    // Record event
    const record = await ledger.recordEvent(subj, obj);
    
    // Verify the proof
    const isValid = await ledger.verifyProof(
      record.hash,
      record.proof,
      record.publicSignals
    );
    
    expect(isValid).toBe(true);
  });

  test('should generate unique hashes for different events', async () => {
    const record1 = await ledger.recordEvent('http://example.org/A', 'http://example.org/B');
    const record2 = await ledger.recordEvent('http://example.org/C', 'http://example.org/D');
    
    expect(record1.hash).not.toBe(record2.hash);
  });
});