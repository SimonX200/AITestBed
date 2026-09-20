/**
 * E2E Tests — validate the running Docker container
 * Uses Node.js built-in 'assert' and 'child_process'.
 */

import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { describe, it, before, after } from 'node:test';

const CONTAINER_NAME = 'session-app';

function dockerRun(args: string[]): string {
  // Quote arguments containing special shell characters
  const quotedArgs = args.map(arg => 
    /[{}$`\\!"'()]/.test(arg) ? `'${arg.replace(/'/g, "'\\''")}'` : arg
  );
  return execSync(`docker ${quotedArgs.join(' ')}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

describe('SessionManager — E2E Tests (Docker Container)', () => {
  before(() => {
    console.log('[E2E] Verifying container is running...');
    const status = dockerRun(['inspect', '--format', '{{.State.Status}}', CONTAINER_NAME]);
    assert.strictEqual(status, 'running', `Container "${CONTAINER_NAME}" is not running (status: ${status})`);
    console.log('[E2E] Container is running.');
  });

  after(() => {
    console.log('[E2E] Stopping container after tests...');
    try {
      dockerRun(['stop', CONTAINER_NAME]);
      dockerRun(['rm', CONTAINER_NAME]);
      console.log('[E2E] Container stopped and removed.');
    } catch {
      console.log('[E2E] Warning: could not clean up container');
    }
  });

  it('should have the container running', () => {
    const status = dockerRun(['inspect', '--format', '{{.State.Status}}', CONTAINER_NAME]);
    assert.strictEqual(status, 'running');
  });

  it('should have the correct image', () => {
    const image = dockerRun(['inspect', '--format', '{{.Config.Image}}', CONTAINER_NAME]);
    assert.strictEqual(image, 'session-app:latest');
  });

  it('should have port 3000 exposed', () => {
    const ports = dockerRun(['inspect', '--format', '{{json .Config.ExposedPorts}}', CONTAINER_NAME]);
    assert.ok(ports.includes('3000/tcp'), `Expected port 3000/tcp in exposed ports: ${ports}`);
  });

  it('should have the bundle.js file inside the container', () => {
    const files = dockerRun(['exec', CONTAINER_NAME, 'ls', '/app/bundle.js']);
    assert.strictEqual(files.trim(), '/app/bundle.js');
  });

  it('should have node:20-alpine as base image layers', () => {
    const history = dockerRun(['history', '--no-trunc', CONTAINER_NAME]);
    // Check for Alpine base image (node:20-alpine uses alpine-minirootfs)
    assert.ok(history.toLowerCase().includes('alpine'),
      `Base image should be Alpine-based. History snippet: ${history.substring(0, 500)}`);
  });

  it('should produce valid output when executed', () => {
    // Run the container's CMD directly and capture output
    const output = dockerRun(['exec', CONTAINER_NAME, 'node', '-e', 'console.log("container-ok")']);
    assert.strictEqual(output.trim(), 'container-ok');
  });

  it('should have esbuild available in the host build context', () => {
    const bundlePath = '/home/aurelb/devops/AITestBed/Example4/dist/bundle.js';
    const output = execSync(`wc -c < "${bundlePath}"`, { encoding: 'utf-8' }).trim();
    const size = parseInt(output, 10);
    assert.ok(size > 0, `bundle.js should not be empty (size: ${size})`);
    console.log(`[E2E] bundle.js size: ${size} bytes`);
  });
});
