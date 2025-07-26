// Simple System Check
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 SYSTEM ENVIRONMENT CHECK');
console.log('=' .repeat(40));

console.log('Environment Variables:');
console.log(`MOONSHOT_API_KEY: ${process.env.MOONSHOT_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`MOONSHOT_BASE_URL: ${process.env.MOONSHOT_BASE_URL || 'Default'}`);
console.log(`PORT: ${process.env.PORT || '3000'}`);
console.log(`MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Missing'}`);

console.log('\nFile Structure Check:');

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const criticalFiles = [
    'utils/query.js',
    'utils/agents.js', 
    'prompts/supervisor_worldclass.md',
    'prompts/tags_worldclass.md',
    'prompts/emotion_worldclass.md',
    'prompts/memory_worldclass.md'
];

criticalFiles.forEach(file => {
    const fullPath = join(__dirname, file);
    console.log(`${file}: ${existsSync(fullPath) ? '✅' : '❌'}`);
});

// Test basic query function import
console.log('\nModule Import Check:');
try {
    const queryModule = await import('./utils/query.js');
    console.log('query.js: ✅ Imported successfully');
    console.log(`query function: ${typeof queryModule.query === 'function' ? '✅' : '❌'}`);
} catch (error) {
    console.log('query.js: ❌ Import failed -', error.message);
}

try {
    const agentsModule = await import('./utils/agents.js');
    console.log('agents.js: ✅ Imported successfully');
} catch (error) {
    console.log('agents.js: ❌ Import failed -', error.message);
}

console.log('\n🏁 System check completed');
