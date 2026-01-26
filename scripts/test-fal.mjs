#!/usr/bin/env node
/**
 * fal.ai Test Script
 *
 * Run this script to test fal.ai image generation from your terminal.
 *
 * Usage:
 *   node scripts/test-fal.mjs
 *
 * Or with a custom prompt:
 *   node scripts/test-fal.mjs "your custom prompt here"
 *
 * Environment:
 *   Set FAL_KEY in your environment or create a .env file
 */

import { fal } from "@fal-ai/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// =============================================================================
// CONFIGURATION
// =============================================================================

// Load .env file manually (since we're not using vite)
function loadEnv() {
  const envPath = resolve(__dirname, "../.env");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnv();

// Get API key from environment
const FAL_KEY = process.env.VITE_FAL_KEY || process.env.FAL_KEY;

if (!FAL_KEY || FAL_KEY === "your-fal-api-key-here") {
  console.error("❌ Error: FAL_KEY not configured");
  console.error("");
  console.error("Please set your fal.ai API key:");
  console.error("  1. Go to https://fal.ai/dashboard/keys");
  console.error("  2. Create a new API key");
  console.error("  3. Add it to your .env file:");
  console.error('     VITE_FAL_KEY="your-actual-key-here"');
  console.error("");
  process.exit(1);
}

// Configure fal client
fal.config({
  credentials: FAL_KEY,
});

console.log("✅ fal.ai configured successfully");
console.log("");

// =============================================================================
// TEST FUNCTIONS
// =============================================================================

/**
 * Test 1: Simple synchronous generation (fast)
 */
async function testSimpleGeneration(prompt) {
  console.log("🎨 Test 1: Simple Generation (flux/schnell)");
  console.log(`   Prompt: "${prompt}"`);
  console.log("   Generating...");

  const startTime = Date.now();

  try {
    const result = await fal.run("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        image_size: { width: 1024, height: 1024 },
        num_images: 1,
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`   ✅ Done in ${elapsed}s`);
    console.log(`   🖼️  Image URL: ${result.data.images[0].url}`);
    console.log(`   📐 Size: ${result.data.images[0].width}x${result.data.images[0].height}`);
    console.log("");
    return result.data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Test 2: Queue-based generation (for longer jobs)
 */
async function testQueueGeneration(prompt) {
  console.log("🎨 Test 2: Queue-based Generation (flux/dev)");
  console.log(`   Prompt: "${prompt}"`);
  console.log("   Submitting to queue...");

  try {
    // Submit job
    const { request_id } = await fal.queue.submit("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
        image_size: { width: 1024, height: 1024 },
        num_images: 1,
      },
    });

    console.log(`   📋 Request ID: ${request_id}`);
    console.log("   Polling for status...");

    // Poll for completion
    let status;
    let dots = "";
    do {
      status = await fal.queue.status("fal-ai/flux/dev", {
        requestId: request_id,
        logs: true,
      });

      dots += ".";
      process.stdout.write(`\r   Status: ${status.status}${dots.padEnd(10)}`);

      if (status.status !== "COMPLETED" && status.status !== "FAILED") {
        await new Promise((r) => setTimeout(r, 2000)); // Wait 2 seconds
      }
    } while (status.status !== "COMPLETED" && status.status !== "FAILED");

    console.log(""); // New line after status

    if (status.status === "FAILED") {
      throw new Error("Job failed");
    }

    // Get result
    const result = await fal.queue.result("fal-ai/flux/dev", {
      requestId: request_id,
    });

    console.log(`   ✅ Done!`);
    console.log(`   🖼️  Image URL: ${result.data.images[0].url}`);
    console.log("");
    return result.data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Test 3: Streaming/Subscribe (with real-time updates)
 */
async function testStreamingGeneration(prompt) {
  console.log("🎨 Test 3: Streaming Generation (with real-time updates)");
  console.log(`   Prompt: "${prompt}"`);
  console.log("   Starting stream...");

  const startTime = Date.now();

  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        image_size: { width: 1024, height: 1024 },
        num_images: 1,
      },
      onQueueUpdate: (update) => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`   [${elapsed}s] Status: ${update.status}`);
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`   ✅ Done in ${elapsed}s`);
    console.log(`   🖼️  Image URL: ${result.data.images[0].url}`);
    console.log("");
    return result.data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Test 4: Batch generation (multiple images in parallel)
 */
async function testBatchGeneration() {
  console.log("🎨 Test 4: Batch Generation (3 variants in parallel)");

  const prompts = [
    "Professional product photography of a sleek gadget, studio lighting, white background",
    "Lifestyle image of person using modern technology, warm lighting, cozy home setting",
    "Artistic hero shot with dramatic lighting, bold colors, minimalist composition",
  ];

  console.log("   Generating 3 variants simultaneously...");
  const startTime = Date.now();

  try {
    const results = await Promise.all(
      prompts.map((prompt, i) =>
        fal
          .run("fal-ai/flux/schnell", {
            input: {
              prompt: prompt,
              image_size: { width: 1024, height: 1024 },
              num_images: 1,
            },
          })
          .then((r) => {
            console.log(`   ✅ Variant ${i + 1} complete`);
            return r.data;
          })
      )
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`   ✅ All 3 variants done in ${elapsed}s`);
    results.forEach((r, i) => {
      console.log(`   🖼️  Variant ${i + 1}: ${r.images[0].url}`);
    });
    console.log("");
    return results;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  const customPrompt = process.argv[2];
  const defaultPrompt =
    "A beautiful glass bottle with a galaxy inside, sitting on a wooden table, dramatic lighting, product photography";

  const prompt = customPrompt || defaultPrompt;

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                    fal.ai Test Suite                         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("");

  // Run tests
  try {
    // Test 1: Simple generation
    await testSimpleGeneration(prompt);

    // Test 2: Skip queue test by default (slow)
    // Uncomment to test:
    // await testQueueGeneration(prompt);

    // Test 3: Streaming
    await testStreamingGeneration(prompt);

    // Test 4: Batch generation
    await testBatchGeneration();

    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║                    All Tests Passed! ✅                       ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
  } catch (error) {
    console.error("");
    console.error("Test suite failed:", error.message);
    process.exit(1);
  }
}

main();
