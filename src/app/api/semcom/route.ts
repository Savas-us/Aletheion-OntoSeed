import { NextRequest, NextResponse } from 'next/server';
import { encode, SemComPackage } from '@/lib/semcom/encode';
import { decode } from '@/lib/semcom/decode';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'encode') {
      // Encode Turtle to SemComPackage
      const turtleContent = await request.text();
      
      if (!turtleContent || turtleContent.trim().length === 0) {
        return NextResponse.json(
          { error: 'Empty turtle content' },
          { status: 400 }
        );
      }
      
      const semComPackage = encode(turtleContent);
      
      // Calculate compression ratio
      const originalSize = new TextEncoder().encode(turtleContent).length;
      const compressedSize = new TextEncoder().encode(JSON.stringify(semComPackage)).length;
      const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
      
      return NextResponse.json({
        package: semComPackage,
        stats: {
          originalSize,
          compressedSize,
          compressionRatio: Math.max(0, compressionRatio)
        }
      });
      
    } else if (action === 'decode') {
      // Decode SemComPackage to Turtle
      const packageData = await request.json() as SemComPackage;
      
      if (!packageData || !packageData.concepts || !packageData.intents) {
        return NextResponse.json(
          { error: 'Invalid SemComPackage format' },
          { status: 400 }
        );
      }
      
      const turtle = decode(packageData);
      
      return NextResponse.json({ turtle });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=encode or ?action=decode' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('SemCom API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST with ?action=encode or ?action=decode' },
    { status: 405 }
  );
}