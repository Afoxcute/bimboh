export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    console.log('📊 Starting Bitquery Data Collection...');
    
    // Path to the bitquery directory
    const bitqueryPath = path.join(process.cwd(), '..', 'bitquery');
    
    return new Promise<Response>((resolve) => {
      const child = spawn('node', ['index.mjs'], {
        cwd: bitqueryPath,
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        console.log('Bitquery:', message.trim());
      });

      child.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        console.error('Bitquery Error:', message.trim());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({
            success: true,
            message: 'Bitquery data collection completed successfully',
            output: output,
            timestamp: new Date().toISOString()
          }));
        } else {
          resolve(NextResponse.json({
            success: false,
            message: 'Bitquery data collection failed',
            error: errorOutput,
            code: code,
            timestamp: new Date().toISOString()
          }, { status: 500 }));
        }
      });

      child.on('error', (error) => {
        resolve(NextResponse.json({
          success: false,
          message: 'Failed to start Bitquery data collection',
          error: error.message,
          timestamp: new Date().toISOString()
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('Bitquery API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(): Promise<Response> {
  return NextResponse.json({
    message: 'Bitquery API - Use POST to start data collection',
    endpoints: {
      'POST /api/bitquery': 'Start Bitquery data collection'
    }
  });
}
