import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';

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
    // Spawn pyshacl process
    const pyshacl = spawn('pyshacl', [
  '-',                 // data from stdin
  '-s', shapesPath,    // shapes file
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

    // Send turtle content to stdin
    pyshacl.stdin.write(turtleContent);
    pyshacl.stdin.end();

    pyshacl.on('close', (code) => {
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
      resolve({
        conforms: false,
        report: `Failed to run pyshacl: ${error.message}`,
        error: error.message
      });
    });
  });
}