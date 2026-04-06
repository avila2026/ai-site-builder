/**
 * Cliente Autonoma para execução de testes via API
 *
 * Variáveis de ambiente necessárias:
 * - AUTONOMA_CLIENT_ID
 * - AUTONOMA_SECRET_ID
 */

import fetch from 'node-fetch';

const AUTONOMA_BASE_URL = process.env.AUTONOMA_BASE_URL || 'https://autonoma.app/api';
const CLIENT_ID = process.env.AUTONOMA_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTONOMA_SECRET_ID;

// Validação das credenciais no startup
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('⚠️  AUTONOMA credentials not configured. Tests will fail.');
}

export interface TestRunRequest {
  testId: string;
  application_version_id?: string;
  runtime_metadata?: Record<string, unknown>;
}

export interface TestRunResponse {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  results?: unknown;
  error?: string;
}

/**
 * Dispara execução de teste na Autonoma
 */
export async function triggerTestRun({
  testId,
  application_version_id,
  runtime_metadata,
}: TestRunRequest): Promise<TestRunResponse> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Autonoma credentials not configured');
  }

  const response = await fetch(`${AUTONOMA_BASE_URL}/test/${testId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'autonoma-client-id': CLIENT_ID,
      'autonoma-client-secret': CLIENT_SECRET,
    },
    body: JSON.stringify({
      application_version_id,
      source: 'api',
      runtime_metadata: runtime_metadata || {},
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Autonoma API error (${response.status}): ${errorText}`);
  }

  return await response.json() as TestRunResponse;
}

/**
 * Verifica status de um teste em execução
 */
export async function getTestStatus(testRunId: string): Promise<TestRunResponse> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Autonoma credentials not configured');
  }

  const response = await fetch(`${AUTONOMA_BASE_URL}/test-run/${testRunId}/status`, {
    method: 'GET',
    headers: {
      'autonoma-client-id': CLIENT_ID,
      'autonoma-client-secret': CLIENT_SECRET,
    },
  });

  if (!response.ok) {
    throw new Error(`Autonoma API error: ${response.status}`);
  }

  return await response.json() as TestRunResponse;
}
