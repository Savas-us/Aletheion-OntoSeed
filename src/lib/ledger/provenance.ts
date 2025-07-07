import sqlite3 from 'sqlite3';
import { createHash } from 'crypto';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as snarkjs from 'snarkjs';

export interface ProvenanceEvent {
  id: number;
  subject: string;
  predicate: string;
  object: string;
  timestamp: number;
  hash: string;
}

export interface SnarkProof {
  a: unknown[];
  b: unknown[][];
  c: unknown[];
}

export interface ProvenanceRecord {
  id: number;
  hash: string;
  proof: SnarkProof;
  publicSignals: string[];
}

export class ProvenanceLedger {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = join(dataDir, 'ledger.db');
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Create tables if they don't exist
        this.db!.serialize(() => {
          this.db!.run(`
            CREATE TABLE IF NOT EXISTS provenance_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              subject TEXT NOT NULL,
              predicate TEXT NOT NULL,
              object TEXT NOT NULL,
              timestamp INTEGER NOT NULL,
              hash TEXT NOT NULL UNIQUE
            )
          `);
          
          this.db!.run(`
            CREATE INDEX IF NOT EXISTS idx_subject ON provenance_events(subject);
          `);
          
          this.db!.run(`
            CREATE INDEX IF NOT EXISTS idx_hash ON provenance_events(hash);
          `);
        });
        
        resolve();
      });
    });
  }

  async recordEvent(subj: string, obj: string): Promise<ProvenanceRecord> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    const predicate = 'http://ontoseed.org/core#causes';
    const timestamp = Date.now();
    
    // Create hash of subject||object||timestamp
    const hashInput = `${subj}||${obj}||${timestamp}`;
    const hash = createHash('sha256').update(hashInput).digest('hex');
    
    // Insert into database
    const id = await new Promise<number>((resolve, reject) => {
      this.db!.run(
        'INSERT INTO provenance_events (subject, predicate, object, timestamp, hash) VALUES (?, ?, ?, ?, ?)',
        [subj, predicate, obj, timestamp, hash],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });

    // Generate ZKP proof
    const proof = await this.generateProof(subj, obj, timestamp);
    
    return {
      id,
      hash,
      proof: proof.proof,
      publicSignals: proof.publicSignals
    };
  }

  async getChain(uri: string): Promise<ProvenanceEvent[]> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      this.db!.all(
        'SELECT * FROM provenance_events WHERE subject = ? ORDER BY timestamp ASC',
        [uri],
        (err, rows: unknown[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as ProvenanceEvent[]);
          }
        }
      );
    });
  }

  async verifyProof(hash: string, proof: SnarkProof, publicSignals: string[]): Promise<boolean> {
    try {
      // Load verification key
      const vkPath = join(process.cwd(), 'build', 'prov_hash.vkey.json');
      if (!existsSync(vkPath)) {
        throw new Error('Verification key not found. Run npm run build:circom first.');
      }

      const vKey = await import(vkPath);
      const result = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
      // Also verify the hash matches the public signal
      const expectedHash = publicSignals[0];
      return result && hash === expectedHash;
    } catch (_error) {
      console.error('Proof verification failed:', _error);
      return false;
    }
  }

  private async generateProof(subj: string, obj: string, timestamp: number): Promise<{proof: SnarkProof, publicSignals: string[]}> {
    try {
      // Convert inputs to circuit format
      const hashInput = `${subj}||${obj}||${timestamp}`;
      const hash = createHash('sha256').update(hashInput).digest('hex');
      
      // Convert hash to field elements (simplified for demonstration)
      const hashBigInt = BigInt('0x' + hash.substring(0, 16)); // Use first 64 bits
      
      const input = {
        subject: this.stringToCircuitInput(subj),
        object: this.stringToCircuitInput(obj),
        timestamp: timestamp,
        expectedHash: hashBigInt.toString()
      };

      // Load circuit files
      const wasmPath = join(process.cwd(), 'build', 'prov_hash.wasm');
      const zkeyPath = join(process.cwd(), 'build', 'prov_hash.zkey');
      
      if (!existsSync(wasmPath) || !existsSync(zkeyPath)) {
        throw new Error('Circuit files not found. Run npm run build:circom first.');
      }

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
      
      return { proof, publicSignals };
    } catch (_error) {
      console.error('Proof generation failed:', _error);
      // Return mock proof for development
      return {
        proof: { a: [], b: [], c: [] },
        publicSignals: [createHash('sha256').update(`${subj}||${obj}||${timestamp}`).digest('hex')]
      };
    }
  }

  private stringToCircuitInput(str: string): string {
    // Convert string to field element (simplified)
    const hash = createHash('sha256').update(str).digest('hex');
    return BigInt('0x' + hash.substring(0, 16)).toString();
  }

  async close(): Promise<void> {
    if (this.db) {
      return new Promise((resolve) => {
        this.db!.close(() => {
          this.db = null;
          resolve();
        });
      });
    }
  }
}

// Singleton instance
let ledgerInstance: ProvenanceLedger | null = null;

export async function getProvenanceLedger(): Promise<ProvenanceLedger> {
  if (!ledgerInstance) {
    ledgerInstance = new ProvenanceLedger();
    await ledgerInstance.init();
  }
  return ledgerInstance;
}