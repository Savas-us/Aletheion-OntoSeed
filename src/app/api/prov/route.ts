import { NextRequest, NextResponse } from 'next/server';
import { getProvenanceLedger } from '@/lib/ledger/provenance';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    const ledger = await getProvenanceLedger();
    
    if (action === 'record') {
      const { subj, obj } = await request.json();
      
      if (!subj || !obj) {
        return NextResponse.json(
          { error: 'Missing required fields: subj, obj' },
          { status: 400 }
        );
      }
      
      const record = await ledger.recordEvent(subj, obj);
      
      return NextResponse.json({
        success: true,
        record
      });
      
    } else if (action === 'verify') {
      const { hash, proof, publicSignals } = await request.json();
      
      if (!hash || !proof || !publicSignals) {
        return NextResponse.json(
          { error: 'Missing required fields: hash, proof, publicSignals' },
          { status: 400 }
        );
      }
      
      const isValid = await ledger.verifyProof(hash, proof, publicSignals);
      
      return NextResponse.json({
        valid: isValid
      });
      
    } else if (action === 'chain') {
      const { uri } = await request.json();
      
      if (!uri) {
        return NextResponse.json(
          { error: 'Missing required field: uri' },
          { status: 400 }
        );
      }
      
      const chain = await ledger.getChain(uri);
      
      return NextResponse.json({
        chain
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=record, ?action=verify, or ?action=chain' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Provenance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST with ?action=record, ?action=verify, or ?action=chain' },
    { status: 405 }
  );
}