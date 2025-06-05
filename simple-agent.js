#!/usr/bin/env node

/**
 * 🤖 Simple AI Chat Agent with Desktop Automation
 * 
 * Just chat naturally - the AI will use tools when needed!
 * Powered by Terminator.js + DeepSeek-R1 + Ollama
 */

import { ollama } from 'ollama-ai-provider';
import { streamText } from 'ai';
import { z } from 'zod';
import chalk from 'chalk';
import inquirer from 'inquirer';
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
        const screenshot = await desktop.captureScreen();
        let result = { 
          success: true,
          message: `Screenshot taken (${screenshot.width}x${screenshot.height})`
        };

        if (withOCR) {
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
        const locator = desktop.locator(selector);
        const element = await locator.first();
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
console.log(chalk.blue('\n💬 Simple AI Chat Agent'));
console.log(chalk.gray('Just talk naturally - I can take screenshots, click things, open apps, and more!'));
console.log(chalk.gray('Type "quit" or "exit" to stop\n'));

// Main chat loop
async function chat() {
  while (true) {
    const { message } = await inquirer.prompt([{
      type: 'input',
      name: 'message',
      message: chalk.cyan('You:'),
    }]);

    if (message.toLowerCase() === 'quit' || message.toLowerCase() === 'exit') {
      console.log(chalk.green('\n👋 Goodbye!'));
      break;
    }

    if (!message.trim()) continue;

    try {
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
            content: message
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
          const result = toolCall.result;
          if (result.success) {
            console.log(chalk.green(`\n✅ ${result.message}`));
            if (result.extractedText) {
              console.log(chalk.gray(`📝 Text found: ${result.extractedText.substring(0, 200)}...`));
            }
            if (result.elements) {
              console.log(chalk.gray(`🔍 Elements: ${result.elements.map(e => e.name).join(', ')}`));
            }
            if (result.output && result.output.trim()) {
              console.log(chalk.gray(`📤 Output: ${result.output.trim()}`));
            }
          } else {
            console.log(chalk.red(`\n❌ Error: ${result.error}`));
          }
        }
      }

      console.log('\n');

    } catch (error) {
      console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
    }
  }
}

// Start the chat
chat().catch(error => {
  console.error(chalk.red('Fatal error:', error.message));
  process.exit(1);
}); 