import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { load } from './pi-host.mjs';

test('direct and nested reads redact secrets, leaving non-text blocks intact', async t => {
  const cwd = mkdtempSync(join(tmpdir(), 'pi-cloak-test-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(join(cwd, '.pi'));
  writeFileSync(join(cwd, '.pi/cloak.json'), JSON.stringify({ enabled: true, patterns: [{ filePattern: '*.env', cloakPattern: 'SECRET123', replace: '[REDACTED]' }] }));
  const host = await load(resolve('index.ts'), cwd);
  await host.emit('session_start');
  for (const parentToolCallId of [undefined, 'codemode/1']) {
    const result = (await host.emit('tool_result', {
      toolName: 'read', input: { path: 'test.env' }, parentToolCallId,
      content: [{ type: 'text', text: 'TOKEN=SECRET123' }, { type: 'image', data: 'image', mimeType: 'image/png' }],
    }))[0];
    assert.ok(result);
    assert.ok(!JSON.stringify(result).includes('SECRET123'));
    assert.equal(result.content[1].data, 'image');
  }
});
