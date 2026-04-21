require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT after ${ms}ms`)), ms))
  ]);
}

async function runTests() {
  console.log('=== Gemini API Diagnostics ===');
  console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 15) + '...');
  console.log('');

  // Test 1: Basic call (no grounding)
  console.log('Test 1: Basic call (no grounding)...');
  try {
    const r = await withTimeout(
      ai.models.generateContent({ model: 'gemini-2.0-flash', contents: 'Say "OK" in one word' }),
      15000
    );
    console.log('✅ Basic call SUCCESS:', r.text?.trim());
  } catch (e) {
    console.log('❌ Basic call FAILED:', e.message);
  }

  // Test 2: Grounding (tools inside config — correct v1.x syntax)
  console.log('\nTest 2: Grounded search (tools in config)...');
  try {
    const r = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'What is 1+1?',
        config: { tools: [{ googleSearch: {} }] }
      }),
      20000
    );
    console.log('✅ Grounding SUCCESS:', r.text?.trim().substring(0, 100));
    const chunks = r.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    console.log('   Citation URLs:', chunks.length);
  } catch (e) {
    console.log('❌ Grounding FAILED:', e.message);
  }

  // Test 3: JSON mode
  console.log('\nTest 3: JSON response mode...');
  try {
    const r = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Return {"status": "ok"}',
        config: { responseMimeType: 'application/json' }
      }),
      15000
    );
    console.log('✅ JSON mode SUCCESS:', r.text?.trim().substring(0, 100));
  } catch (e) {
    console.log('❌ JSON mode FAILED:', e.message);
  }

  console.log('\n=== Diagnostics Complete ===');
}

runTests().catch(console.error);
