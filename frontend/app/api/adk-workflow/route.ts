export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    console.log('🚀 Starting ADK Workflow...');
    
    // Path to the js-scraper directory
    const jsScraperPath = path.join(process.cwd(), '..', 'js-scraper');
    
    return new Promise<Response>((resolve) => {
      const child = spawn('node', ['adk_workflow_orchestrator.mjs'], {
        cwd: jsScraperPath,
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        console.log('ADK Workflow:', message.trim());
      });

      child.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        console.error('ADK Workflow Error:', message.trim());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({
            success: true,
            message: 'ADK Workflow completed successfully',
            output: output,
            timestamp: new Date().toISOString()
          }));
        } else {
          resolve(NextResponse.json({
            success: false,
            message: 'ADK Workflow failed',
            error: errorOutput,
            code: code,
            timestamp: new Date().toISOString()
          }, { status: 500 }));
        }
      });

      child.on('error', (error) => {
        resolve(NextResponse.json({
          success: false,
          message: 'Failed to start ADK Workflow',
          error: error.message,
          timestamp: new Date().toISOString()
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('ADK Workflow API Error:', error);
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
    message: 'ADK Workflow API - Use POST to start the workflow',
    endpoints: {
      'POST /api/adk-workflow': 'Start the ADK workflow orchestrator'
    }
  });
}
