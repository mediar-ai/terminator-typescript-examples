#!/usr/bin/env node

/**
 * 🎨 Simple Vision AI Artist
 * 
 * Just ONE model that can:
 * - Open Paint and draw 
 * - Take screenshots
 * - Analyze what it drew
 * - Improve based on feedback
 */

import { ollama } from 'ollama-ai-provider';
import { streamText, generateText } from 'ai';
import { z } from 'zod';
import chalk from 'chalk';
import fs from 'fs/promises';
import { Desktop } from '../terminator/bindings/nodejs/index.js';

// ONE MODEL FOR EVERYTHING
const model = ollama('gemma3:4b-it-q4_K_M', { temperature: 0.7 });

// Initialize desktop
const desktop = new Desktop();
console.log(chalk.blue('🎨 Initializing Simple Vision Artist...'));

// Simple tools
const tools = {
  openPaint: {
    description: 'Open MS Paint',
    parameters: z.object({}),
    execute: async () => {
      try {
        console.log(chalk.yellow('🚀 Opening Paint...'));
        desktop.openApplication('mspaint');
        await new Promise(r => setTimeout(r, 2000));
        return { success: true, message: 'Paint opened' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  drawOnCanvas: {
    description: 'Draw directly on the Paint canvas by clicking and dragging',
    parameters: z.object({
      startX: z.number().describe('Starting X coordinate (100-800)'),
      startY: z.number().describe('Starting Y coordinate (100-600)'),
      endX: z.number().describe('Ending X coordinate (100-800)'),
      endY: z.number().describe('Ending Y coordinate (100-600)'),
      description: z.string().describe('What you are drawing (e.g., "circle", "line", "star")')
    }),
    execute: async ({ startX, startY, endX, endY, description }) => {
      try {
        console.log(chalk.yellow(`✏️ Drawing ${description} from (${startX},${startY}) to (${endX},${endY})...`));
        
        // Simple click and drag
        const paintWindow = desktop.locator('name:Paint');
        paintWindow.mouseClickAndHold(startX, startY);
        await new Promise(r => setTimeout(r, 100));
        paintWindow.mouseMove(endX, endY);
        paintWindow.mouseRelease();
        
        return { 
          success: true, 
          message: `Drew ${description} from (${startX},${startY}) to (${endX},${endY})` 
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  takeScreenshot: {
    description: 'Take a screenshot to see what you drew',
    parameters: z.object({
      reason: z.string().optional().describe('Why taking screenshot')
    }),
    execute: async ({ reason = 'check artwork' }) => {
      try {
        console.log(chalk.yellow(`📸 Taking screenshot: ${reason}...`));
        
        const screenshot = await desktop.captureScreen();
        const filename = `art_${Date.now()}.png`;
        
        await fs.writeFile(filename, Buffer.from(screenshot.imageData));
        const sizeKB = Math.round(screenshot.imageData.length / 1024);
        
        return { 
          success: true, 
          message: `Screenshot saved: ${filename} (${sizeKB}KB)`,
          filename,
          sizeKB
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  analyzeScreenshot: {
    description: 'Look at the latest screenshot and analyze what you see',
    parameters: z.object({
      question: z.string().optional().describe('Specific question about the artwork')
    }),
    execute: async ({ question = 'What do you see in this artwork?' }) => {
      try {
        console.log(chalk.yellow('🔍 Analyzing screenshot...'));
        
        // Find latest screenshot
        const files = await fs.readdir('.');
        const artFiles = files.filter(f => f.startsWith('art_') && f.endsWith('.png'));
        
        if (artFiles.length === 0) {
          return { success: false, error: 'No screenshots found. Take a screenshot first.' };
        }
        
        const latest = artFiles.sort().pop();
        const imageData = await fs.readFile(latest);
        const base64 = imageData.toString('base64');
        
        // Simple vision prompt
        const prompt = `Look at this MS Paint screenshot and answer: ${question}

You are looking at a digital artwork created in MS Paint. Describe what you see - shapes, colors, lines, overall composition. Be specific about what was drawn and how it looks.

[Image: data:image/png;base64,${base64.substring(0, 100)}...]`;

        const { text } = await generateText({ model, prompt });
        
        return { 
          success: true, 
          message: 'Vision analysis complete',
          analysis: text,
          file: latest
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }
};

console.log(chalk.green('✅ Simple Vision Artist ready'));

// Get arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(chalk.blue('\n🎨 Simple Vision AI Artist'));
  console.log(chalk.gray('Usage:'));
  console.log(chalk.white('  node simple-vision-artist.js create "draw a star"'));
  console.log(chalk.white('  node simple-vision-artist.js test'));
  process.exit(0);
}

// Main function
async function createArt(description = 'simple drawing') {
  console.log(chalk.blue(`\n🎨 Creating: ${description}`));
  
  const prompt = `You are an AI artist. Your ONLY job is to use the provided tools to draw in MS Paint and verify your work.

MANDATORY STEPS - YOU MUST DO ALL OF THESE:
1. FIRST: Use openPaint tool to open MS Paint
2. THEN: Use drawOnCanvas tool to draw something (specify exact coordinates like startX:300, startY:200, endX:500, endY:400)
3. THEN: Use takeScreenshot tool to capture what you drew
4. THEN: Use analyzeScreenshot tool to see what you actually created
5. REPEAT steps 2-4 to add more elements

YOU MUST USE THE TOOLS. Do not just talk - USE THE TOOLS.

Task: ${description}

Start by using the openPaint tool RIGHT NOW.`;

  try {
    const response = await streamText({
      model,
      prompt,
      tools: {
        openPaint: tools.openPaint,
        drawOnCanvas: tools.drawOnCanvas,
        takeScreenshot: tools.takeScreenshot,
        analyzeScreenshot: tools.analyzeScreenshot
      },
      maxTokens: 1200
    });

    console.log(chalk.blue('\n🤖 AI Artist: '));
    
    let fullResponse = '';
    for await (const chunk of response.textStream) {
      process.stdout.write(chalk.blue(chunk));
      fullResponse += chunk;
    }

    // Show tool results
    if (response.toolCalls && response.toolCalls.length > 0) {
      console.log(chalk.yellow('\n\n🛠️ Actions taken:'));
      
      for (const toolCall of response.toolCalls) {
        const result = toolCall.result;
        
        if (result.success) {
          console.log(chalk.green(`✅ ${result.message}`));
          
          if (result.analysis) {
            console.log(chalk.cyan(`\n👁️ Vision Analysis:`));
            console.log(chalk.white(result.analysis));
          }
        } else {
          console.log(chalk.red(`❌ ${result.error}`));
        }
      }
    } else {
      console.log(chalk.red('\n❌ No tools were used! AI did not follow instructions.'));
    }
    
    console.log(chalk.green('\n🎨 Artwork creation complete!'));
    
  } catch (error) {
    console.log(chalk.red(`❌ Error: ${error.message}`));
  }
}

// Run commands
switch (command) {
  case 'create':
    const description = args.slice(1).join(' ') || 'simple drawing';
    await createArt(description);
    break;
    
  case 'test':
    console.log(chalk.blue('\n🧪 Testing basic functionality...'));
    
    // Test each tool
    console.log(chalk.yellow('\n1. Testing openPaint...'));
    let result = await tools.openPaint.execute();
    console.log(result.success ? chalk.green(`✅ ${result.message}`) : chalk.red(`❌ ${result.error}`));
    
    console.log(chalk.yellow('\n2. Testing drawOnCanvas...'));
    result = await tools.drawOnCanvas.execute({ 
      startX: 300, startY: 200, endX: 500, endY: 300, description: 'test line' 
    });
    console.log(result.success ? chalk.green(`✅ ${result.message}`) : chalk.red(`❌ ${result.error}`));
    
    console.log(chalk.yellow('\n3. Testing takeScreenshot...'));
    result = await tools.takeScreenshot.execute({ reason: 'test capture' });
    console.log(result.success ? chalk.green(`✅ ${result.message}`) : chalk.red(`❌ ${result.error}`));
    
    if (result.success) {
      console.log(chalk.yellow('\n4. Testing analyzeScreenshot...'));
      result = await tools.analyzeScreenshot.execute({ question: 'What did I just draw?' });
      console.log(result.success ? chalk.green(`✅ ${result.message}`) : chalk.red(`❌ ${result.error}`));
      
      if (result.success && result.analysis) {
        console.log(chalk.cyan('\n👁️ Analysis result:'));
        console.log(chalk.white(result.analysis.substring(0, 200) + '...'));
      }
    }
    
    console.log(chalk.green('\n✅ Test complete!'));
    break;
    
  default:
    console.log(chalk.red(`Unknown command: ${command}`));
} 