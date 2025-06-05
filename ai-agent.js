#!/usr/bin/env node

/**
 * 🤖 AI Agent with Desktop Automation using Terminator.js SDK
 * 
 * A powerful local AI agent using:
 * - Terminator.js SDK for desktop automation
 * - DeepSeek-R1:1.5B (reasoning model) via Ollama
 * - Vercel AI SDK with Ollama provider
 * - Interactive CLI interface with tools
 * - Rich formatting and features
 * 
 * Features:
 * - Desktop automation (screenshots, clicks, OCR)
 * - Application control and UI interaction
 * - Advanced reasoning capabilities
 * - Tool calling (calculator, file ops, web search simulation)
 * - Conversation history
 * - Streaming responses
 * - Beautiful CLI interface
 */

import { ollama } from 'ollama-ai-provider';
import { generateText, streamText, generateObject } from 'ai';
import { z } from 'zod';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import ora from 'ora';
import gradient from 'gradient-string';
import boxen from 'boxen';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Terminator.js SDK
import { Desktop } from 'terminator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Terminator SDK
const desktop = new Desktop();

// 🎨 Styling
const rainbowGradient = gradient(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']);
const purpleGradient = gradient(['#6C5CE7', '#A29BFE']);

// 🧠 AI Model Configuration
const model = ollama('deepseek-r1:1.5b', {
  // Enable thinking mode for reasoning
  temperature: 0.7,
  simulateStreaming: true
});

// 🛠️ Tool Definitions
const tools = {
  // 📸 Desktop Screenshot Tool
  screenshot: {
    description: 'Take a screenshot of the desktop and optionally analyze it with OCR',
    parameters: z.object({
      withOCR: z.boolean().optional().describe('Whether to perform OCR text extraction'),
      savePath: z.string().optional().describe('Path to save screenshot (optional)')
    }),
    execute: async ({ withOCR = false, savePath }) => {
      try {
        const screenshot = await desktop.captureScreen();
        let result = { 
          status: 'success', 
          message: 'Screenshot taken successfully',
          size: `${screenshot.width}x${screenshot.height}`
        };

        if (savePath) {
          // Save screenshot as PNG
          const imageBuffer = Buffer.from(screenshot.imageData);
          await fs.writeFile(savePath, imageBuffer);
          result.savedTo = savePath;
        }

        if (withOCR) {
          const ocrText = await desktop.ocrScreenshot(screenshot);
          result.ocrText = ocrText;
          result.textLength = ocrText.length;
        }

        return result;
      } catch (error) {
        return { error: `Screenshot failed: ${error.message}` };
      }
    }
  },

  // 🖱️ Desktop Click Tool
  clickElement: {
    description: 'Click on UI elements by locator string or find elements by role/name',
    parameters: z.object({
      selector: z.string().describe('Selector string (e.g., "name:Seven", "role:button", "text:OK")'),
      action: z.enum(['click', 'doubleClick', 'rightClick']).default('click').describe('Click action type')
    }),
    execute: async ({ selector, action = 'click' }) => {
      try {
        const locator = desktop.locator(selector);
        const element = await locator.first();
        
        let result;
        switch (action) {
          case 'click':
            result = element.click();
            break;
          case 'doubleClick':
            result = element.doubleClick();
            break;
          case 'rightClick':
            element.rightClick();
            result = { method: 'rightClick', details: 'Right clicked successfully' };
            break;
        }

        return { 
          status: 'success', 
          message: `${action} performed successfully`,
          result: result
        };
      } catch (error) {
        return { error: `Click failed: ${error.message}` };
      }
    }
  },

  // 🔍 Element Discovery Tool
  findElements: {
    description: 'Find UI elements on the screen by selector',
    parameters: z.object({
      selector: z.string().describe('Selector string (e.g., "role:button", "name:Edit", "text:Save")'),
      limit: z.number().optional().default(10).describe('Maximum number of elements to return')
    }),
    execute: async ({ selector, limit = 10 }) => {
      try {
        const locator = desktop.locator(selector);
        const elements = await locator.all();
        const limitedElements = elements.slice(0, limit);
        
        const elementDetails = limitedElements.map(el => ({
          name: el.name() || 'Unknown',
          role: el.role(),
          bounds: el.bounds(),
          text: el.text(2), // Get text with max depth 2
          visible: el.isVisible(),
          enabled: el.isEnabled()
        }));

        return {
          status: 'success',
          selector,
          count: elements.length,
          returned: limitedElements.length,
          elements: elementDetails
        };
      } catch (error) {
        return { error: `Element discovery failed: ${error.message}` };
      }
    }
  },

  // 🚀 Application Control Tool
  appControl: {
    description: 'Launch, focus, or list applications',
    parameters: z.object({
      action: z.enum(['launch', 'list', 'focus', 'activate']).describe('Application action'),
      appName: z.string().optional().describe('Application name (for launch/focus/activate)')
    }),
    execute: async ({ action, appName }) => {
      try {
        switch (action) {
          case 'launch':
            if (!appName) return { error: 'App name required for launch' };
            
            const launchedApp = desktop.openApplication(appName);
            return { 
              status: 'success', 
              message: `Launched ${appName}`,
              action: 'launch',
              app: {
                name: launchedApp.name(),
                role: launchedApp.role()
              }
            };

          case 'list':
            const apps = desktop.applications();
            return {
              status: 'success',
              action: 'list',
              count: apps.length,
              applications: apps.slice(0, 10).map(app => ({
                name: app.name(),
                role: app.role(),
                bounds: app.bounds()
              }))
            };

          case 'focus':
          case 'activate':
            if (!appName) return { error: 'App name required for focus/activate' };
            
            if (action === 'activate') {
              desktop.activateApplication(appName);
            } else {
              const app = desktop.application(appName);
              app.focus();
            }
            
            return { 
              status: 'success', 
              message: `${action === 'activate' ? 'Activated' : 'Focused'} ${appName}`,
              action
            };

          default:
            return { error: 'Invalid action' };
        }
      } catch (error) {
        return { error: `App control failed: ${error.message}` };
      }
    }
  },

  // 🔤 OCR Text Recognition Tool
  ocrTool: {
    description: 'Perform OCR text recognition on the current screen',
    parameters: z.object({
      imagePath: z.string().optional().describe('Path to image file, or leave empty for screenshot')
    }),
    execute: async ({ imagePath }) => {
      try {
        let ocrText;
        
        if (imagePath) {
          ocrText = await desktop.ocrImagePath(imagePath);
        } else {
          const screenshot = await desktop.captureScreen();
          ocrText = await desktop.ocrScreenshot(screenshot);
        }

        return {
          status: 'success',
          source: imagePath || 'screenshot',
          textLength: ocrText.length,
          wordCount: ocrText.split(/\s+/).length,
          text: ocrText.slice(0, 1000) + (ocrText.length > 1000 ? '...' : ''),
          fullText: ocrText
        };
      } catch (error) {
        return { error: `OCR failed: ${error.message}` };
      }
    }
  },

  // ⌨️ Text Input Tool
  textInput: {
    description: 'Type text into the currently focused element or a specific element',
    parameters: z.object({
      text: z.string().describe('Text to type'),
      selector: z.string().optional().describe('Optional selector to find element first'),
      useClipboard: z.boolean().optional().default(false).describe('Use clipboard for pasting')
    }),
    execute: async ({ text, selector, useClipboard = false }) => {
      try {
        let element;
        
        if (selector) {
          const locator = desktop.locator(selector);
          element = await locator.first();
        } else {
          element = desktop.focusedElement();
        }

        element.typeText(text, useClipboard);

        return {
          status: 'success',
          message: `Typed "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
          method: useClipboard ? 'clipboard' : 'keyboard',
          target: selector || 'focused element'
        };
      } catch (error) {
        return { error: `Text input failed: ${error.message}` };
      }
    }
  },

  // 🧮 Calculator Tool (Enhanced)
  calculator: {
    description: 'Perform mathematical calculations or launch Calculator app',
    parameters: z.object({
      expression: z.string().describe('Mathematical expression to evaluate'),
      useApp: z.boolean().optional().describe('Whether to use the Calculator app for demonstration')
    }),
    execute: async ({ expression, useApp = false }) => {
      try {
        // Calculate the result programmatically
        const result = Function(`"use strict"; return (${expression})`)();
        
        let response = { 
          result: result.toString(), 
          expression,
          method: 'programmatic'
        };

        // Optionally demonstrate with Calculator app
        if (useApp) {
          try {
            const calcApp = desktop.openApplication('calc');
            response.appDemo = 'Calculator app launched for demonstration';
            response.method = 'app + programmatic';
            response.app = {
              name: calcApp.name(),
              role: calcApp.role()
            };
          } catch (error) {
            response.appError = 'Could not launch Calculator app';
          }
        }

        return response;
      } catch (error) {
        return { error: 'Invalid mathematical expression', expression };
      }
    }
  },

  // 📂 File Manager Tool (Enhanced)
  fileManager: {
    description: 'Read, write, or list files',
    parameters: z.object({
      action: z.enum(['read', 'write', 'list', 'open']).describe('File operation to perform'),
      filepath: z.string().optional().describe('Path to file (for read/write/open)'),
      content: z.string().optional().describe('Content to write (for write action)'),
      directory: z.string().optional().describe('Directory to list (for list action)')
    }),
    execute: async ({ action, filepath, content, directory }) => {
      try {
        switch (action) {
          case 'read':
            if (!filepath) return { error: 'Filepath required for read action' };
            const fileContent = await fs.readFile(filepath, 'utf-8');
            return { action: 'read', filepath, content: fileContent };
          
          case 'write':
            if (!filepath || !content) return { error: 'Filepath and content required for write action' };
            await fs.writeFile(filepath, content, 'utf-8');
            return { action: 'write', filepath, message: 'File written successfully' };
          
          case 'list':
            const dir = directory || '.';
            const files = await fs.readdir(dir);
            return { action: 'list', directory: dir, files };

          case 'open':
            if (!filepath) return { error: 'Filepath required for open action' };
            desktop.openFile(filepath);
            return { action: 'open', filepath, message: 'File opened with default application' };
          
          default:
            return { error: 'Invalid action' };
        }
      } catch (error) {
        return { error: error.message, action };
      }
    }
  },

  // 🌐 Web Tool (Enhanced)
  webTool: {
    description: 'Open URLs in browser or get current browser window',
    parameters: z.object({
      action: z.enum(['open', 'getCurrentBrowser']).describe('Web action to perform'),
      url: z.string().optional().describe('URL to open (for open action)'),
      browser: z.string().optional().describe('Specific browser to use')
    }),
    execute: async ({ action, url, browser }) => {
      try {
        switch (action) {
          case 'open':
            if (!url) return { error: 'URL required for open action' };
            desktop.openUrl(url, browser);
            return { action: 'open', url, browser: browser || 'default', message: 'URL opened in browser' };

          case 'getCurrentBrowser':
            const browserWindow = await desktop.getCurrentBrowserWindow();
            return {
              action: 'getCurrentBrowser',
              browser: {
                name: browserWindow.name(),
                role: browserWindow.role(),
                bounds: browserWindow.bounds(),
                text: browserWindow.text(1)
              }
            };

          default:
            return { error: 'Invalid action' };
        }
      } catch (error) {
        return { error: `Web tool failed: ${error.message}`, action };
      }
    }
  },

  // 🏃 Command Runner Tool
  commandRunner: {
    description: 'Run shell commands',
    parameters: z.object({
      windowsCommand: z.string().optional().describe('Command to run on Windows'),
      unixCommand: z.string().optional().describe('Command to run on Unix/Linux/macOS'),
      timeout: z.number().optional().default(30000).describe('Timeout in milliseconds')
    }),
    execute: async ({ windowsCommand, unixCommand, timeout = 30000 }) => {
      try {
        const commandOutput = await desktop.runCommand(windowsCommand, unixCommand);
        
        return {
          status: 'success',
          exitStatus: commandOutput.exitStatus,
          stdout: commandOutput.stdout,
          stderr: commandOutput.stderr,
          command: {
            windows: windowsCommand,
            unix: unixCommand
          }
        };
      } catch (error) {
        return { error: `Command execution failed: ${error.message}` };
      }
    }
  }
};

// 📚 Conversation History
let conversationHistory = [];

// 🎭 Display Banner
function displayBanner() {
  console.clear();
  console.log(rainbowGradient(figlet.textSync('AI Agent', { font: 'ANSI Shadow' })));
  console.log(purpleGradient('\n🤖 Powered by Terminator.js + DeepSeek-R1:1.5B + Ollama + Vercel AI SDK\n'));
  
  console.log(boxen(
    chalk.white.bold('🚀 Desktop Automation + AI Features:\n') +
    chalk.cyan('• Advanced reasoning with DeepSeek-R1\n') +
    chalk.cyan('• Desktop automation (screenshots, clicks, OCR)\n') +
    chalk.cyan('• Application control and UI interaction\n') +
    chalk.cyan('• Element discovery and manipulation\n') +
    chalk.cyan('• Text input and keyboard simulation\n') +
    chalk.cyan('• File operations and command execution\n') +
    chalk.cyan('• Web automation and browser control\n') +
    chalk.cyan('• Streaming responses and interactive CLI\n') +
    chalk.gray('Type "help" for commands, "exit" to quit'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'magenta'
    }
  ));
}

// 🔧 Available Commands
const commands = {
  'help': () => {
    console.log(boxen(
      chalk.yellow.bold('📋 Available Commands:\n\n') +
      chalk.white('🤖 ') + chalk.green('chat') + chalk.gray(' - Start interactive chat with desktop automation\n') +
      chalk.white('📸 ') + chalk.green('screenshot') + chalk.gray(' - Take desktop screenshot with OCR\n') +
      chalk.white('🖱️ ') + chalk.green('click <selector>') + chalk.gray(' - Click UI elements (e.g., "name:Seven")\n') +
      chalk.white('🔍 ') + chalk.green('find <selector>') + chalk.gray(' - Find UI elements (e.g., "role:button")\n') +
      chalk.white('🚀 ') + chalk.green('app <action> [name]') + chalk.gray(' - Launch/list/focus applications\n') +
      chalk.white('🔤 ') + chalk.green('ocr [imagePath]') + chalk.gray(' - Perform OCR text recognition\n') +
      chalk.white('⌨️ ') + chalk.green('type <text>') + chalk.gray(' - Type text into focused element\n') +
      chalk.white('🧮 ') + chalk.green('calc <expression>') + chalk.gray(' - Quick calculation\n') +
      chalk.white('📂 ') + chalk.green('files') + chalk.gray(' - List current directory\n') +
      chalk.white('🌐 ') + chalk.green('web <url>') + chalk.gray(' - Open URL in browser\n') +
      chalk.white('🏃 ') + chalk.green('run <command>') + chalk.gray(' - Run shell command\n') +
      chalk.white('💭 ') + chalk.green('think <question>') + chalk.gray(' - Deep reasoning mode\n') +
      chalk.white('📜 ') + chalk.green('history') + chalk.gray(' - Show conversation history\n') +
      chalk.white('🔄 ') + chalk.green('clear') + chalk.gray(' - Clear conversation history\n') +
      chalk.white('❌ ') + chalk.green('exit') + chalk.gray(' - Exit the agent'),
      { padding: 1, borderStyle: 'round', borderColor: 'blue' }
    ));
  },

  'screenshot': async () => {
    const spinner = ora('📸 Taking screenshot...').start();
    const result = await tools.screenshot.execute({ withOCR: true });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else {
      console.log(chalk.green(`✅ Screenshot taken (${result.size})`));
      if (result.ocrText) {
        console.log(chalk.blue(`📝 OCR extracted ${result.textLength} characters`));
        console.log(chalk.gray(`Preview: ${result.ocrText.slice(0, 200)}...`));
      }
    }
  },

  'click': async (selector) => {
    if (!selector) {
      console.log(chalk.red('❌ Please specify a selector: e.g., "name:Seven", "role:button", "text:OK"'));
      return;
    }
    
    const spinner = ora(`🖱️ Clicking ${selector}...`).start();
    const result = await tools.clickElement.execute({ selector });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else {
      console.log(chalk.green(`✅ ${result.message}`));
    }
  },

  'find': async (selector) => {
    if (!selector) {
      console.log(chalk.red('❌ Please specify a selector: e.g., "role:button", "name:Edit", "text:Save"'));
      return;
    }
    
    const spinner = ora(`🔍 Finding elements with ${selector}...`).start();
    const result = await tools.findElements.execute({ selector });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else {
      console.log(chalk.green(`✅ Found ${result.count} elements (showing ${result.returned}):`));
      result.elements.forEach((el, i) => {
        console.log(chalk.gray(`  ${i + 1}. ${el.name} (${el.role}) ${el.visible ? '👁️' : '🚫'} ${el.enabled ? '✅' : '❌'}`));
        if (el.text) console.log(chalk.blue(`     Text: "${el.text.substring(0, 100)}"`));
      });
    }
  },

  'app': async (action, appName) => {
    if (!action) {
      console.log(chalk.red('❌ Please specify action: launch, list, focus, or activate'));
      return;
    }
    
    const spinner = ora(`🚀 ${action}ing ${appName || 'applications'}...`).start();
    const result = await tools.appControl.execute({ action, appName });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else if (action === 'list') {
      console.log(chalk.green(`✅ Found ${result.count} applications:`));
      result.applications.forEach((app, i) => {
        console.log(chalk.gray(`  ${i + 1}. ${app.name} (${app.role})`));
      });
    } else {
      console.log(chalk.green(`✅ ${result.message}`));
    }
  },

  'ocr': async (imagePath) => {
    const spinner = ora('🔤 Performing OCR...').start();
    const result = await tools.ocrTool.execute({ imagePath });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else {
      console.log(chalk.green(`✅ OCR completed on ${result.source}`));
      console.log(chalk.blue(`📊 Found ${result.wordCount} words (${result.textLength} characters)`));
      console.log(boxen(
        chalk.white(result.text),
        { padding: 1, borderStyle: 'round', borderColor: 'cyan' }
      ));
    }
  },

  'type': async (text) => {
    if (!text) {
      console.log(chalk.red('❌ Please provide text to type'));
      return;
    }
    
    const spinner = ora('⌨️ Typing text...').start();
    const result = await tools.textInput.execute({ text });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else {
      console.log(chalk.green(`✅ ${result.message}`));
    }
  },

  'calc': async (expression) => {
    if (!expression) {
      console.log(chalk.red('❌ Please provide a mathematical expression'));
      return;
    }
    
    const spinner = ora('🧮 Calculating...').start();
    const result = await tools.calculator.execute({ expression });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else {
      console.log(chalk.green(`✅ ${result.expression} = ${result.result}`));
      if (result.appDemo) {
        console.log(chalk.blue(`📱 ${result.appDemo}`));
      }
    }
  },

  'files': async () => {
    const spinner = ora('📂 Listing files...').start();
    const result = await tools.fileManager.execute({ action: 'list' });
    spinner.stop();
    
    console.log(chalk.blue(`📁 Files in ${result.directory}:`));
    result.files.forEach(file => {
      console.log(chalk.gray(`  • ${file}`));
    });
  },

  'web': async (url) => {
    if (!url) {
      console.log(chalk.red('❌ Please provide a URL to open'));
      return;
    }
    
    const spinner = ora('🌐 Opening URL...').start();
    const result = await tools.webTool.execute({ action: 'open', url });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else {
      console.log(chalk.green(`✅ ${result.message}`));
    }
  },

  'run': async (command) => {
    if (!command) {
      console.log(chalk.red('❌ Please provide a command to run'));
      return;
    }
    
    const spinner = ora('🏃 Running command...').start();
    // Determine if we're on Windows or Unix
    const isWindows = process.platform === 'win32';
    const result = await tools.commandRunner.execute({
      windowsCommand: isWindows ? command : undefined,
      unixCommand: !isWindows ? command : undefined
    });
    spinner.stop();
    
    if (result.error) {
      console.log(chalk.red(`❌ ${result.error}`));
    } else {
      console.log(chalk.green(`✅ Command executed (exit code: ${result.exitStatus})`));
      if (result.stdout) {
        console.log(chalk.blue('📤 STDOUT:'));
        console.log(result.stdout);
      }
      if (result.stderr) {
        console.log(chalk.red('📥 STDERR:'));
        console.log(result.stderr);
      }
    }
  },

  'think': async (question) => {
    if (!question) {
      console.log(chalk.red('❌ Please provide a question to think about'));
      return;
    }

    const spinner = ora('🧠 Deep thinking mode...').start();
    
    try {
      const response = await generateText({
        model,
        prompt: `Think deeply about this question and provide a comprehensive, reasoned answer: ${question}`,
        temperature: 0.3 // Lower temperature for more focused reasoning
      });

      spinner.stop();
      console.log(boxen(
        chalk.blue.bold('🧠 Deep Reasoning Result:\n\n') + chalk.white(response.text),
        { padding: 1, borderStyle: 'double', borderColor: 'blue' }
      ));

      conversationHistory.push({ type: 'thinking', question, response: response.text });
    } catch (error) {
      spinner.stop();
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  },

  'history': () => {
    if (conversationHistory.length === 0) {
      console.log(chalk.yellow('📜 No conversation history yet'));
      return;
    }

    console.log(chalk.blue.bold('📜 Conversation History:\n'));
    conversationHistory.forEach((entry, index) => {
      console.log(chalk.gray(`${index + 1}. [${entry.type.toUpperCase()}]`));
      if (entry.type === 'chat') {
        console.log(chalk.white(`   User: ${entry.user}`));
        console.log(chalk.cyan(`   AI: ${entry.ai.substring(0, 100)}...`));
      } else if (entry.type === 'thinking') {
        console.log(chalk.white(`   Question: ${entry.question}`));
        console.log(chalk.cyan(`   Answer: ${entry.response.substring(0, 100)}...`));
      }
      console.log();
    });
  },

  'clear': () => {
    conversationHistory = [];
    console.log(chalk.green('✅ Conversation history cleared'));
  },

  'chat': async () => {
    console.log(chalk.blue.bold('\n💬 Interactive Chat Mode with Desktop Automation'));
    console.log(chalk.gray('Type your message (or "back" to return to main menu)\n'));
    console.log(chalk.yellow('🎯 Available tools: screenshot, click, OCR, app control, text input, file ops, web automation, commands\n'));

    while (true) {
      const { message } = await inquirer.prompt([{
        type: 'input',
        name: 'message',
        message: chalk.green('You:'),
        prefix: '🧑'
      }]);

      if (message.toLowerCase() === 'back') break;
      if (!message.trim()) continue;

      console.log(chalk.cyan('\n🤖 AI: '), { newline: false });

      try {
        const response = await streamText({
          model,
          prompt: `Previous conversation context: ${JSON.stringify(conversationHistory.slice(-3))}\n\nUser message: ${message}`,
          tools: {
            screenshot: tools.screenshot,
            clickElement: tools.clickElement,
            findElements: tools.findElements,
            appControl: tools.appControl,
            ocrTool: tools.ocrTool,
            textInput: tools.textInput,
            calculator: tools.calculator,
            fileManager: tools.fileManager,
            webTool: tools.webTool,
            commandRunner: tools.commandRunner
          }
        });

        let fullResponse = '';
        
        for await (const chunk of response.textStream) {
          process.stdout.write(chalk.cyan(chunk));
          fullResponse += chunk;
        }

        console.log('\n');

        // Handle tool calls if any
        if (response.toolCalls && response.toolCalls.length > 0) {
          console.log(chalk.yellow('\n🔧 Tool Results:'));
          for (const toolCall of response.toolCalls) {
            console.log(chalk.gray(`  Tool: ${toolCall.toolName}`));
            console.log(chalk.white(`  Result: ${JSON.stringify(toolCall.result, null, 2)}`));
          }
        }

        conversationHistory.push({ type: 'chat', user: message, ai: fullResponse });

      } catch (error) {
        console.log(chalk.red(`\n❌ Error: ${error.message}`));
      }
    }
  }
};

// 🎮 Main Command Loop
async function main() {
  displayBanner();

  // Check if Ollama and model are available
  const spinner = ora('🔍 Checking DeepSeek-R1:1.5B availability...').start();
  try {
    await generateText({
      model,
      prompt: 'Hello! Are you working correctly?',
      maxTokens: 10
    });
    spinner.succeed('✅ DeepSeek-R1:1.5B is ready!');
  } catch (error) {
    spinner.fail('❌ DeepSeek-R1:1.5B not available');
    console.log(chalk.red('\n🚨 Setup Instructions:'));
    console.log(chalk.yellow('1. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh'));
    console.log(chalk.yellow('2. Pull the model: ollama pull deepseek-r1:1.5b'));
    console.log(chalk.yellow('3. Ensure Ollama is running: ollama serve'));
    process.exit(1);
  }

  // Main command loop
  while (true) {
    console.log();
    const { command } = await inquirer.prompt([{
      type: 'input',
      name: 'command',
      message: chalk.magenta('🤖 Agent'),
      prefix: '>'
    }]);

    const [cmd, ...args] = command.trim().split(' ');
    
    if (cmd === 'exit') {
      console.log(chalk.green('\n👋 Goodbye! Thanks for using the AI Agent!'));
      process.exit(0);
    }

    if (commands[cmd]) {
      await commands[cmd](...args);
    } else if (cmd) {
      console.log(chalk.red(`❌ Unknown command: ${cmd}`));
      console.log(chalk.gray('Type "help" for available commands'));
    }
  }
}

// 🚀 Error Handling & Startup
process.on('uncaughtException', (error) => {
  console.log(chalk.red('\n💥 Unexpected error:', error.message));
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(chalk.green('\n\n👋 Goodbye! Thanks for using the AI Agent!'));
  process.exit(0);
});

// Start the agent
main().catch(error => {
  console.error(chalk.red('🚨 Fatal error:', error.message));
  process.exit(1);
}); 