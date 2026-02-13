#!/usr/bin/env node
/**
 * Upload Source Maps to New Relic
 *
 * This script uses the official @newrelic/publish-sourcemap package to upload
 * Next.js production source maps to New Relic for better error stack traces.
 *
 * Required Environment Variables:
 * - NEW_RELIC_API_KEY: New Relic User API key (not license key)
 * - NEXT_PUBLIC_NEWRELIC_AGENT_ID: New Relic Browser application ID
 * - NEXT_PUBLIC_HOST: Production host URL (e.g., https://www.varsitytutors.com)
 * - NEXT_PUBLIC_BASE_PATH: Application base path (e.g., /checkout)
 *
 * Optional Environment Variables:
 * - RELEASE_VERSION: Version/release identifier (defaults to git commit SHA)
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { basename, join, relative } from 'path';

// Configuration
const BUILD_DIR = '.next';
const STATIC_DIR = join(BUILD_DIR, 'static');

// Environment variables
const API_KEY = process.env.NEW_RELIC_API_KEY;
const APP_ID = process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID;
const HOST = process.env.NEXT_PUBLIC_HOST || 'https://www.varsitytutors.com';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';

// Get release version from environment or git
// Supports: RELEASE_VERSION (GitHub Actions), COMMIT_REF (Netlify), or git command
function getReleaseVersion() {
  if (process.env.RELEASE_VERSION) {
    return process.env.RELEASE_VERSION;
  }
  if (process.env.COMMIT_REF) {
    return process.env.COMMIT_REF;
  }
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }
}

// Find all source map files recursively
function findSourceMaps(dir, files = []) {
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        findSourceMaps(fullPath, files);
      } else if (item.endsWith('.map')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }
  return files;
}

// Get the JavaScript URL for a source map
function getJavaScriptUrl(sourcemapPath) {
  const relativePath = relative(STATIC_DIR, sourcemapPath);
  // Normalize path separators for URLs (Windows uses backslashes)
  const jsPath = relativePath.replace(/\.map$/, '').replace(/\\/g, '/');
  return `${HOST}${BASE_PATH}/_next/static/${jsPath}`;
}

// Upload a single source map using the official New Relic CLI
async function uploadSourceMap(sourcemapPath, releaseVersion) {
  const jsUrl = getJavaScriptUrl(sourcemapPath);
  const filename = basename(sourcemapPath);

  try {
    execSync(
      `npx --yes @newrelic/publish-sourcemap ${sourcemapPath} ${jsUrl} ` +
        `--apiKey=${API_KEY} ` +
        `--applicationId=${APP_ID} ` +
        `--releaseName=${releaseVersion} ` +
        `--releaseId=${releaseVersion}`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return { success: true };
  } catch (error) {
    return { success: false, filename, jsUrl, error: error.stderr || error.message };
  }
}

// Main execution
async function main() {
  console.log('\n🗺️  New Relic Source Maps Upload\n');

  // Validate environment variables
  const missing = [];
  if (!API_KEY) missing.push('NEW_RELIC_API_KEY');
  if (!APP_ID) missing.push('NEXT_PUBLIC_NEWRELIC_AGENT_ID');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((v) => console.error(`   - ${v}`));
    process.exit(1);
  }

  const releaseVersion = getReleaseVersion();
  const displayVersion =
    releaseVersion.length > 12 ? `${releaseVersion.slice(0, 12)}...` : releaseVersion;
  console.log(`📦 Release: ${displayVersion}`);
  console.log(`🌐 Host: ${HOST}${BASE_PATH}`);
  console.log(`🔑 App ID: ${APP_ID}\n`);

  // Find source maps
  const sourceMaps = findSourceMaps(STATIC_DIR);

  if (sourceMaps.length === 0) {
    console.warn('⚠️  No source maps found. Ensure UPLOAD_SOURCEMAPS=true during build.');
    process.exit(0);
  }

  console.log(`📤 Uploading ${sourceMaps.length} source map(s)...`);

  // Upload each source map
  const failures = [];

  for (const sourcemap of sourceMaps) {
    const result = await uploadSourceMap(sourcemap, releaseVersion);
    if (!result.success) {
      failures.push(result);
    }
  }

  // Summary
  const successCount = sourceMaps.length - failures.length;
  console.log(`\n📊 Results: ${successCount} uploaded, ${failures.length} failed`);

  if (failures.length > 0) {
    console.error('\n❌ Failed uploads:');
    for (const failure of failures) {
      console.error(`\n   ${failure.filename}`);
      console.error(`   URL: ${failure.jsUrl}`);
      console.error(`   Error: ${failure.error}`);
    }
    console.log('');
    process.exit(1);
  }

  console.log('\n✅ All source maps uploaded successfully!\n');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
