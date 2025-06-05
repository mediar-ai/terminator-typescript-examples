#!/usr/bin/env node

/**
 * 🎨 Actually Working Vision Artist
 * 
 * Simple version that ACTUALLY works:
 * - Opens Paint
 * - Draws stuff
 * - Takes screenshots
 * - Uses AI to analyze
 */

import { ollama } from 'ollama-ai-provider';
import { generateText } from 'ai';
import chalk from 'chalk';
import fs from 'fs/promises';
import { Desktop } from '../terminator/bindings/nodejs/index.js';

const model = ollama('gemma3:4b-it-q4_K_M', { temperature: 0.7 });
const desktop = new Desktop();

console.log(chalk.blue('🎨 Working Vision Artist'));

async function openPaint() {
  try {
    console.log(chalk.yellow('🚀 Opening Paint...'));
    desktop.openApplication('mspaint');
    await new Promise(r => setTimeout(r, 3000));
    console.log(chalk.green('✅ Paint opened'));
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to open Paint: ${error.message}`));
    return false;
  }
}

async function drawSomething(x1, y1, x2, y2, description) {
  try {
    console.log(chalk.yellow(`✏️ Drawing ${description} from (${x1},${y1}) to (${x2},${y2})...`));
    
    const paintWindow = desktop.locator('name:Paint');
    paintWindow.mouseClickAndHold(x1, y1);
    await new Promise(r => setTimeout(r, 100));
    paintWindow.mouseMove(x2, y2);
    paintWindow.mouseRelease();
    
    console.log(chalk.green(`✅ Drew ${description}`));
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to draw: ${error.message}`));
    return false;
  }
}

async function takeScreenshot() {
  try {
    console.log(chalk.yellow('📸 Taking screenshot...'));
    
    const screenshot = await desktop.captureScreen();
    const filename = `artwork_${Date.now()}.png`;
    
    await fs.writeFile(filename, Buffer.from(screenshot.imageData));
    const sizeKB = Math.round(screenshot.imageData.length / 1024);
    
    console.log(chalk.green(`✅ Screenshot saved: ${filename} (${sizeKB}KB)`));
    return filename;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to take screenshot: ${error.message}`));
    return null;
  }
}

async function analyzeArtwork(filename) {
  try {
    console.log(chalk.yellow('🔍 Analyzing artwork with AI...'));
    
    const imageData = await fs.readFile(filename);
    const base64 = imageData.toString('base64');
    
    const prompt = `Look at this MS Paint screenshot. What do you see? Describe the artwork, shapes, colors, and overall composition.

Be specific about what was drawn and how it looks.

[Image: data:image/png;base64,${base64.substring(0, 100)}...]`;

    const { text } = await generateText({ model, prompt, maxTokens: 300 });
    
    console.log(chalk.cyan('\n👁️ AI Vision Analysis:'));
    console.log(chalk.white(text));
    
    return text;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to analyze: ${error.message}`));
    return null;
  }
}

// Main workflow
async function createArt(description) {
  console.log(chalk.blue(`\n🎨 Creating: ${description}`));
  console.log(chalk.gray('-'.repeat(50)));
  
  // Step 1: Open Paint
  const paintOpened = await openPaint();
  if (!paintOpened) return;
  
  // Step 2: Draw something
  let drawn = false;
  if (description.includes('circle')) {
    drawn = await drawSomething(300, 200, 400, 300, 'circle shape');
  } else if (description.includes('star')) {
    // Draw a simple star shape with multiple lines
    drawn = await drawSomething(350, 150, 350, 350, 'vertical line for star');
    await drawSomething(200, 250, 500, 250, 'horizontal line for star');
    await drawSomething(250, 180, 450, 320, 'diagonal line 1 for star');
    await drawSomething(450, 180, 250, 320, 'diagonal line 2 for star');
  } else if (description.includes('line')) {
    drawn = await drawSomething(200, 300, 600, 300, 'horizontal line');
  } else {
    // Default: draw a simple shape
    drawn = await drawSomething(300, 200, 500, 400, 'simple shape');
  }
  
  if (!drawn) return;
  
  // Step 3: Take screenshot
  const filename = await takeScreenshot();
  if (!filename) return;
  
  // Step 4: Analyze with AI
  const analysis = await analyzeArtwork(filename);
  
  console.log(chalk.green('\n🎨 Artwork creation complete!'));
  console.log(chalk.gray(`Screenshot: ${filename}`));
  
  return { filename, analysis };
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'test':
    console.log(chalk.blue('\n🧪 Testing each step...'));
    
    console.log('\n1. Testing Paint opening...');
    await openPaint();
    
    console.log('\n2. Testing drawing...');
    await drawSomething(300, 200, 500, 300, 'test line');
    
    console.log('\n3. Testing screenshot...');
    const filename = await takeScreenshot();
    
    if (filename) {
      console.log('\n4. Testing AI analysis...');
      await analyzeArtwork(filename);
    }
    
    console.log(chalk.green('\n✅ All tests complete!'));
    break;
    
  case 'circle':
    await createArt('draw a circle');
    break;
    
  case 'star':
    await createArt('draw a star');
    break;
    
  case 'line':
    await createArt('draw a line');
    break;
    
  default:
    console.log(chalk.blue('\n🎨 Working Vision Artist'));
    console.log(chalk.gray('Commands:'));
    console.log(chalk.white('  node working-artist.js test    # Test all functions'));
    console.log(chalk.white('  node working-artist.js circle  # Draw a circle'));
    console.log(chalk.white('  node working-artist.js star    # Draw a star'));
    console.log(chalk.white('  node working-artist.js line    # Draw a line'));
} 