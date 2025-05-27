import { NextResponse, NextRequest } from 'next/server';
// import fs from 'fs/promises'; // Removed unused import

export const runtime = 'edge'; // Added Edge Runtime config

interface PastMessage {
  id: string;
  yearWritten: number;
  message: string;
}

// Environment variables for Cloudflare KV
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

const KV_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}`;

// Helper to check if essential KV config is present
function checkKvConfig(): string | null {
  if (!CLOUDFLARE_ACCOUNT_ID) return "CLOUDFLARE_ACCOUNT_ID is not configured.";
  if (!CLOUDFLARE_API_TOKEN) return "CLOUDFLARE_API_TOKEN is not configured.";
  if (!CLOUDFLARE_KV_NAMESPACE_ID) return "CLOUDFLARE_KV_NAMESPACE_ID is not configured.";
  return null;
}

// Common headers for Cloudflare API
const getKvHeaders = () => ({
  'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
  'Content-Type': 'application/json',
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const configError = checkKvConfig();
  if (configError) {
    console.error("KV Configuration Error:", configError);
    return NextResponse.json({ error: "Server configuration error for KV store." }, { status: 500 });
  }

  try {
    // 1. List keys (up to 1000, pagination can be added if more are expected)
    // We'll prefix keys with "message:"
    const listKeysResponse = await fetch(`${KV_BASE_URL}/keys?prefix=message:`, {
      method: 'GET',
      headers: getKvHeaders(),
    });

    if (!listKeysResponse.ok) {
      const errorData = await listKeysResponse.json();
      console.error('CF KV List Keys Error:', errorData);
      throw new Error(`Failed to list messages from KV: ${listKeysResponse.statusText}`);
    }

    const listKeysResult = await listKeysResponse.json();
    
    if (!listKeysResult.success || !Array.isArray(listKeysResult.result)) {
        console.error('CF KV List Keys - Unexpected response format:', listKeysResult);
        throw new Error('Unexpected format when listing messages from KV.');
    }

    const messageKeys: { name: string }[] = listKeysResult.result;
    const messages: PastMessage[] = [];

    // 2. Fetch each message value by its key
    for (const keyObj of messageKeys) {
      const key = keyObj.name;
      const getValueResponse = await fetch(`${KV_BASE_URL}/values/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: getKvHeaders(),
      });

      if (getValueResponse.ok) {
        try {
            const messageText = await getValueResponse.text(); // KV stores values as text/raw bytes
            if (messageText) {
                messages.push(JSON.parse(messageText) as PastMessage);
            }
        } catch (parseError) {
            console.error(`Error parsing message from KV for key ${key}:`, parseError);
            // Optionally skip this message or handle error differently
        }
      } else {
        console.warn(`Failed to fetch value for key ${key} from KV: ${getValueResponse.statusText}`);
        // Optionally skip this message or handle error differently
      }
    }
    
    return NextResponse.json(messages.sort((a, b) => b.yearWritten - a.yearWritten));

  } catch (error: unknown) {
    console.error('GET /api/messages (KV) Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to read messages from KV store.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  const configError = checkKvConfig();
  if (configError) {
    console.error("KV Configuration Error:", configError);
    return NextResponse.json({ error: "Server configuration error for KV store." }, { status: 500 });
  }

  try {
    const newMessageData: { yearWritten: number; message: string } = await request.json();
    if (!newMessageData.message || newMessageData.yearWritten === undefined) {
      return NextResponse.json({ error: 'Missing message or yearWritten' }, { status: 400 });
    }

    // const isDevMode = process.env.NODE_ENV === 'development'; // Removed unused variable
    // const currentRequestYear = newMessageData.yearWritten;
    // if (!isDevMode) { /* ... server-side check for existing message this year ... */ }

    const messageId = `message:${Date.now().toString()}`; // Unique key for KV
    const messageWithId: PastMessage = {
      ...newMessageData,
      id: messageId, // Using the KV key as the ID for simplicity, or use the timestamp part
    };
    
    const value = JSON.stringify(messageWithId);

    const writeResponse = await fetch(`${KV_BASE_URL}/values/${encodeURIComponent(messageId)}`, {
      method: 'PUT', // PUT creates or replaces
      headers: getKvHeaders(),
      body: value,
    });

    if (!writeResponse.ok) {
      const errorData = await writeResponse.json();
      console.error('CF KV Write Error:', errorData);
      throw new Error(`Failed to save message to KV: ${writeResponse.statusText}`);
    }
    const writeResult = await writeResponse.json();
    if (!writeResult.success) {
        console.error('CF KV Write - Operation not successful:', writeResult);
        throw new Error('Failed to save message to KV, operation reported not successful.');
    }

    return NextResponse.json(messageWithId, { status: 201 });

  } catch (error: unknown) {
    console.error('POST /api/messages (KV) Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save message to KV store.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(_request: NextRequest) {
  const configError = checkKvConfig();
  if (configError) {
    console.error("KV Configuration Error:", configError);
    return NextResponse.json({ error: "Server configuration error for KV store." }, { status: 500 });
  }

  // Safety: Only allow in dev mode, or if a specific query param for a single key is provided
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Operation not allowed in production for bulk delete.' }, { status: 403 });
  }
  
  // This function would delete ALL keys with "message:" prefix.
  // This is a destructive operation.
  try {
    const listKeysResponse = await fetch(`${KV_BASE_URL}/keys?prefix=message:`, {
      method: 'GET',
      headers: getKvHeaders(),
    });

    if (!listKeysResponse.ok) throw new Error('Failed to list keys for deletion.');
    const listResult = await listKeysResponse.json();
    if (!listResult.success) throw new Error('Failed to list keys for deletion (API error).');

    const keysToDelete: { name: string }[] = listResult.result;

    if (keysToDelete.length === 0) {
        return NextResponse.json({ message: 'No messages found to clear.' });
    }

    // Cloudflare KV API for bulk delete
    const keyNamesToDelete = keysToDelete.map(k => k.name);
    const bulkDeleteResponse = await fetch(`${KV_BASE_URL}/bulk`, {
        method: 'DELETE',
        headers: getKvHeaders(),
        body: JSON.stringify(keyNamesToDelete),
    });

    if (!bulkDeleteResponse.ok) {
        const errorData = await bulkDeleteResponse.json();
        console.error('CF KV Bulk Delete Error:', errorData);
        throw new Error(`Failed to bulk delete messages from KV: ${bulkDeleteResponse.statusText}`);
    }
    const bulkDeleteResult = await bulkDeleteResponse.json();
     if (!bulkDeleteResult.success) {
        console.error('CF KV Bulk Delete - Operation not successful:', bulkDeleteResult);
        throw new Error('Failed to bulk delete messages from KV, operation reported not successful.');
    }

    return NextResponse.json({ message: `Successfully cleared ${keyNamesToDelete.length} messages.` });

  } catch (error: unknown) {
    console.error('DELETE /api/messages (KV) Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to clear messages from KV store.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 