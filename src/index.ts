import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import {
  add,
  analyzeNumbers,
  delay,
  getValue,
  inspectPayload,
  setValue,
  type JsonScalar
} from './poc.js';

function textResult(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }]
  };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true
  };
}

function createServer(): McpServer {
  const server = new McpServer({ name: 'local-mcp-poc', version: '1.0.0' });

  server.registerTool(
    'ping',
    {
      description: 'Verify that the local MCP server is reachable.',
      inputSchema: z.object({})
    },
    async () => textResult({ ok: true, server: 'local-mcp-poc', version: '1.0.0' })
  );

  server.registerTool(
    'add',
    {
      description: 'Add two finite numbers. Used to verify structured arguments and a local computation round trip.',
      inputSchema: z.object({
        a: z.number().finite(),
        b: z.number().finite()
      })
    },
    async ({ a, b }) => textResult({ a, b, result: add(a, b) })
  );

  server.registerTool(
    'set_value',
    {
      description: 'Persist one simple key/value pair in the local POC state file.',
      inputSchema: z.object({
        key: z.string().min(1).max(100),
        value: z.union([z.string(), z.number().finite(), z.boolean(), z.null()])
      })
    },
    async ({ key, value }) => {
      try {
        const state = await setValue(key, value as JsonScalar);
        return textResult({ saved: true, key, value, state });
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_value',
    {
      description: 'Read one key from the local POC state file.',
      inputSchema: z.object({ key: z.string().min(1).max(100) })
    },
    async ({ key }) => {
      try {
        const result = await getValue(key);
        return textResult({ key, ...result });
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'analyze_numbers',
    {
      description: 'Compute count, min, max, sum and average locally. Used to prove that data work can stay outside the model.',
      inputSchema: z.object({
        numbers: z.array(z.number().finite()).min(1).max(10000)
      })
    },
    async ({ numbers }) => {
      try {
        return textResult(analyzeNumbers(numbers));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'inspect_payload',
    {
      description: 'Return UTF-8 size, character count and SHA-256 for text without echoing the full payload.',
      inputSchema: z.object({ text: z.string().max(250000) })
    },
    async ({ text }) => textResult(inspectPayload(text))
  );

  server.registerTool(
    'delay',
    {
      description: 'Wait locally for up to 5 seconds, then return. Used to verify a non-instant tool call.',
      inputSchema: z.object({ ms: z.number().int().min(0).max(5000) })
    },
    async ({ ms }) => {
      try {
        return textResult(await delay(ms));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'fail_test',
    {
      description: 'Intentionally return a tool error. Used to verify that the model can observe and recover from a failed local call.',
      inputSchema: z.object({})
    },
    async () => ({
      content: [{ type: 'text', text: 'POC_TEST_ERROR' }],
      isError: true
    })
  );

  return server;
}

void serveStdio(createServer);
console.error('local-mcp-poc MCP server is running on stdio');
