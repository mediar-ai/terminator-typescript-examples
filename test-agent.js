#!/usr/bin/env node

/**
 * 🧪 Test Agent - CLI Arguments
 * 
 * Usage:
 * node test-agent.js screenshot
 * node test-agent.js screenshot --ocr
 * node test-agent.js click "name:Calculator"
 * node test-agent.js find "role:button"
 * node test-agent.js open "notepad"
 * node test-agent.js type "hello world"
 * node test-agent.js calc "2+2"
 * node test-agent.js run "dir"
 * node test-agent.js chat "take a screenshot"
 */

import { ollama } from 'ollama-ai-provider';
import { streamText } from 'ai';
import { z } from 'zod';
import chalk from 'chalk';
import { Desktop } from 'terminator.js';

// Initialize desktop automation
const desktop = new Desktop();
console.log(chalk.blue('🤖 Initializing Desktop automation engine'));

// AI Model
const model = ollama('deepseek-r1:1.5b', {
  temperature: 0.7
});

// Tools for the AI to use
const tools = {
  screenshot: {
    description: 'Take a screenshot of the desktop with optional OCR text extraction',
    parameters: z.object({
      withOCR: z.boolean().optional().describe('Whether to extract text from the screenshot')
    }),
    execute: async ({ withOCR = false }) => {
      try {
        console.log(chalk.yellow('📸 Taking screenshot...'));
        const screenshot = await desktop.captureScreen();
        let result = { 
          success: true,
          message: `Screenshot taken (${screenshot.width}x${screenshot.height})`
        };

        if (withOCR) {
          console.log(chalk.yellow('🔤 Extracting text...'));
          const text = await desktop.ocrScreenshot(screenshot);
          result.extractedText = text;
          result.message += ` with ${text.length} characters of text extracted`;
        }

        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  clickElement: {
    description: 'Click on UI elements by name, role, or text',
    parameters: z.object({
      selector: z.string().describe('Element selector like "name:Calculator", "role:button", "text:OK"')
    }),
    execute: async ({ selector }) => {
      try {
        console.log(chalk.yellow(`🖱️ Looking for ${selector}...`));
        const locator = desktop.locator(selector);
        const element = await locator.first();
        console.log(chalk.yellow(`🖱️ Clicking...`));
        await element.click();
        return { success: true, message: `Clicked on ${selector}` };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  findElements: {
    description: 'Find and list UI elements on screen',
    parameters: z.object({
      selector: z.string().describe('Element selector to search for')
    }),
    execute: async ({ selector }) => {
      try {
        console.log(chalk.yellow(`🔍 Searching for ${selector}...`));
        const locator = desktop.locator(selector);
        const elements = await locator.all();
        const details = elements.slice(0, 5).map(el => ({
          name: el.name() || 'Unknown',
          role: el.role(),
          text: el.text(1),
          visible: el.isVisible()
        }));
        return { 
          success: true, 
          count: elements.length, 
          elements: details,
          message: `Found ${elements.length} elements matching ${selector}`
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  openApp: {
    description: 'Launch or focus applications',
    parameters: z.object({
      appName: z.string().describe('Name of the application to open')
    }),
    execute: async ({ appName }) => {
      try {
        console.log(chalk.yellow(`🚀 Opening ${appName}...`));
        const app = desktop.openApplication(appName);
        return { 
          success: true, 
          message: `Opened ${appName}`,
          app: { name: app.name(), role: app.role() }
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  typeText: {
    description: 'Type text into the currently focused element',
    parameters: z.object({
      text: z.string().describe('Text to type')
    }),
    execute: async ({ text }) => {
      try {
        console.log(chalk.yellow(`⌨️ Typing "${text}"...`));
        const element = desktop.focusedElement();
        element.typeText(text, false);
        return { success: true, message: `Typed: "${text}"` };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  calculate: {
    description: 'Perform mathematical calculations',
    parameters: z.object({
      expression: z.string().describe('Mathematical expression to calculate')
    }),
    execute: async ({ expression }) => {
      try {
        console.log(chalk.yellow(`🧮 Calculating ${expression}...`));
        const result = Function(`"use strict"; return (${expression})`)();
        return { 
          success: true, 
          result: result.toString(), 
          message: `${expression} = ${result}`
        };
      } catch (error) {
        return { success: false, error: 'Invalid mathematical expression' };
      }
    }
  },

  runCommand: {
    description: 'Execute shell commands',
    parameters: z.object({
      command: z.string().describe('Command to execute')
    }),
    execute: async ({ command }) => {
      try {
        console.log(chalk.yellow(`🏃 Running command: ${command}...`));
        const isWindows = process.platform === 'win32';
        const result = await desktop.runCommand(
          isWindows ? command : undefined,
          !isWindows ? command : undefined
        );
        return {
          success: true,
          exitCode: result.exitStatus,
          output: result.stdout,
          error: result.stderr,
          message: `Command executed with exit code ${result.exitStatus}`
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }
};

console.log(chalk.green('✅ Desktop automation engine initialized'));

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];
const params = args.slice(1);

if (!command) {
  console.log(chalk.blue('\n🧪 Test Agent - CLI Mode'));
  console.log(chalk.gray('Usage examples:'));
  console.log(chalk.white('  node test-agent.js screenshot'));
  console.log(chalk.white('  node test-agent.js screenshot --ocr'));
  console.log(chalk.white('  node test-agent.js click "name:Calculator"'));
  console.log(chalk.white('  node test-agent.js find "role:button"'));
  console.log(chalk.white('  node test-agent.js open "notepad"'));
  console.log(chalk.white('  node test-agent.js type "hello world"'));
  console.log(chalk.white('  node test-agent.js calc "2+2"'));
  console.log(chalk.white('  node test-agent.js run "dir"'));
  console.log(chalk.white('  node test-agent.js chat "take a screenshot"'));
  process.exit(0);
}

// Execute commands
async function executeCommand() {
  try {
    let result;

    switch (command) {
      case 'screenshot':
        const withOCR = params.includes('--ocr');
        result = await tools.screenshot.execute({ withOCR });
        break;

      case 'click':
        if (!params[0]) {
          console.log(chalk.red('❌ Please provide a selector'));
          process.exit(1);
        }
        result = await tools.clickElement.execute({ selector: params[0] });
        break;

      case 'find':
        if (!params[0]) {
          console.log(chalk.red('❌ Please provide a selector'));
          process.exit(1);
        }
        result = await tools.findElements.execute({ selector: params[0] });
        break;

      case 'open':
        if (!params[0]) {
          console.log(chalk.red('❌ Please provide an app name'));
          process.exit(1);
        }
        result = await tools.openApp.execute({ appName: params[0] });
        break;

      case 'type':
        if (!params[0]) {
          console.log(chalk.red('❌ Please provide text to type'));
          process.exit(1);
        }
        result = await tools.typeText.execute({ text: params.join(' ') });
        break;

      case 'calc':
        if (!params[0]) {
          console.log(chalk.red('❌ Please provide an expression'));
          process.exit(1);
        }
        result = await tools.calculate.execute({ expression: params.join(' ') });
        break;

      case 'run':
        if (!params[0]) {
          console.log(chalk.red('❌ Please provide a command'));
          process.exit(1);
        }
        result = await tools.runCommand.execute({ command: params.join(' ') });
        break;

      case 'chat':
        if (!params[0]) {
          console.log(chalk.red('❌ Please provide a message'));
          process.exit(1);
        }
        
        console.log(chalk.blue('\n🤖 AI: '), { newline: false });
        
        const response = await streamText({
          model,
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant with desktop automation capabilities. You can:
- Take screenshots and extract text (OCR)
- Click on UI elements by selector
- Find and identify elements on screen  
- Open applications
- Type text
- Perform calculations
- Run shell commands

When the user asks you to do something that requires these capabilities, use the appropriate tools. Be conversational and helpful. Always explain what you're doing.

Current platform: ${process.platform}`
            },
            {
              role: 'user', 
              content: params.join(' ')
            }
          ],
          tools: {
            screenshot: tools.screenshot,
            clickElement: tools.clickElement,
            findElements: tools.findElements,
            openApp: tools.openApp,
            typeText: tools.typeText,
            calculate: tools.calculate,
            runCommand: tools.runCommand
          }
        });

        let aiResponse = '';
        for await (const chunk of response.textStream) {
          process.stdout.write(chalk.blue(chunk));
          aiResponse += chunk;
        }

        // Show tool results if any were used
        if (response.toolCalls && response.toolCalls.length > 0) {
          for (const toolCall of response.toolCalls) {
            const toolResult = toolCall.result;
            if (toolResult.success) {
              console.log(chalk.green(`\n✅ ${toolResult.message}`));
              if (toolResult.extractedText) {
                console.log(chalk.gray(`📝 Text found: ${toolResult.extractedText.substring(0, 200)}...`));
              }
              if (toolResult.elements) {
                console.log(chalk.gray(`🔍 Elements: ${toolResult.elements.map(e => e.name).join(', ')}`));
              }
              if (toolResult.output && toolResult.output.trim()) {
                console.log(chalk.gray(`📤 Output: ${toolResult.output.trim()}`));
              }
            } else {
              console.log(chalk.red(`\n❌ Error: ${toolResult.error}`));
            }
          }
        }

        console.log('\n');
        process.exit(0);

      default:
        console.log(chalk.red(`❌ Unknown command: ${command}`));
        process.exit(1);
    }

    // Display results
    if (result.success) {
      console.log(chalk.green(`✅ ${result.message}`));
      
      if (result.extractedText) {
        console.log(chalk.gray(`📝 Text found (${result.extractedText.length} chars):`));
        console.log(chalk.white(result.extractedText.substring(0, 500)));
        if (result.extractedText.length > 500) {
          console.log(chalk.gray('... (truncated)'));
        }
      }
      
      if (result.elements) {
        console.log(chalk.gray(`🔍 Found ${result.count} elements:`));
        result.elements.forEach((el, i) => {
          console.log(chalk.white(`  ${i + 1}. ${el.name} (${el.role}) ${el.visible ? '👁️' : '🚫'}`));
          if (el.text) console.log(chalk.gray(`     Text: "${el.text}"`));
        });
      }
      
      if (result.output && result.output.trim()) {
        console.log(chalk.gray('📤 Output:'));
        console.log(chalk.white(result.output.trim()));
      }
      
      if (result.error && result.error.trim()) {
        console.log(chalk.yellow('⚠️ Stderr:'));
        console.log(chalk.yellow(result.error.trim()));
      }
      
      if (result.result) {
        console.log(chalk.cyan(`🔢 Result: ${result.result}`));
      }
      
      if (result.app) {
        console.log(chalk.gray(`📱 App: ${result.app.name} (${result.app.role})`));
      }
      
    } else {
      console.log(chalk.red(`❌ ${result.error}`));
      process.exit(1);
    }

  } catch (error) {
    console.log(chalk.red(`💥 Fatal error: ${error.message}`));
    process.exit(1);
  }
}

// Run the command
executeCommand(); 