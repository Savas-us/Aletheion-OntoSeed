import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import { mkdtempSync, writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    // Get the turtle content from request body
    const turtleContent = await request.text();
    
    if (!turtleContent || turtleContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Empty turtle content' },
        { status: 400 }
      );
    }

    // Path to shapes file
    const shapesPath = join(process.cwd(), 'src', 'ontology', 'shapes.ttl');

    // Run pyshacl validation
    const result = await runPySHACL(shapesPath, turtleContent);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

interface ValidationResult {
  conforms: boolean;
  report: string;
  error?: string;
}

function runPySHACL(shapesPath: string, turtleContent: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    let tempFilePath: string | null = null;
    
    try {
      // Create a temporary file for the turtle content
      const tempDir = mkdtempSync(join(tmpdir(), 'pyshacl-'));
      tempFilePath = join(tempDir, 'data.ttl');
      writeFileSync(tempFilePath, turtleContent, 'utf8');

      // Spawn pyshacl process with temp file as data graph
      const pyshacl = spawn('pyshacl', [
        '-s', shapesPath,
        tempFilePath,
        '-f', 'turtle'
      ]);

      let stdout = '';
      let stderr = '';

      // Collect output
      pyshacl.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pyshacl.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pyshacl.on('close', (code) => {
        // Clean up temp file
        try {
          if (tempFilePath) {
            unlinkSync(tempFilePath);
          }
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }

        // Parse the result
        const conforms = code === 0;
        
        // Combine stdout and stderr for the report
        let report = '';
        if (stdout.trim()) {
          report += stdout;
        }
        if (stderr.trim()) {
          if (report) report += '\n\n--- STDERR ---\n';
          report += stderr;
        }

        // If no specific validation report, provide a summary
        if (!report.trim()) {
          report = conforms 
            ? 'Validation passed - no issues found'
            : 'Validation failed - see exit code';
        }

        resolve({
          conforms,
          report: report.trim(),
          ...(code !== 0 && !conforms && { error: `pyshacl exited with code ${code}` })
        });
      });

      pyshacl.on('error', (error) => {
        // Clean up temp file on error
        try {
          if (tempFilePath) {
            unlinkSync(tempFilePath);
          }
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }

        resolve({
          conforms: false,
          report: `Failed to run pyshacl: ${error.message}`,
          error: error.message
        });
      });
    } catch (error) {
      // Clean up temp file if creation failed
      try {
        if (tempFilePath) {
          unlinkSync(tempFilePath);
        }
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }

      resolve({
        conforms: false,
        report: `Failed to create temp file: ${error}`,
        error: String(error)
      });
    }
  });
}