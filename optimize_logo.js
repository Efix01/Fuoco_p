
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'Logocf.svg');
const outputPath = path.join(__dirname, 'assets', 'logo.svg');

try {
    let content = fs.readFileSync(inputPath, 'utf8');

    // Basic optimization:
    // 1. Remove newlines and extra spaces
    content = content.replace(/\s+/g, ' ');

    // 2. Reduce precision of coordinates to 2 decimal places to save space
    content = content.replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2));

    // 3. Remove XML declaration if present
    content = content.replace(/<\?xml.*?>/, '');

    // 4. Remove comments
    content = content.replace(/<!--.*?-->/g, '');

    fs.writeFileSync(outputPath, content);
    console.log(`Optimized SVG written to ${outputPath}`);

    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    console.log(`Original size: ${originalSize} bytes`);
    console.log(`New size: ${newSize} bytes`);
    console.log(`Reduction: ${((originalSize - newSize) / originalSize * 100).toFixed(2)}%`);

} catch (err) {
    console.error('Error optimizing SVG:', err);
    process.exit(1);
}
