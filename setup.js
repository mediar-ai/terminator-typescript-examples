#!/usr/bin/env node

/**
 * 🛠️ Setup Script for DeepSeek AI Agent
 * 
 * This script helps users set up Ollama and the DeepSeek-R1:1.5B model
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import boxen from 'boxen';

const execAsync = promisify(exec);

console.clear();
console.log(chalk.blue.bold('🛠️  DeepSeek AI Agent Setup\n'));

async function checkCommand(command, name) {
  try {
    await execAsync(`${command} --version`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log(chalk.yellow('🔍 Checking system requirements...\n'));

  // Check Node.js
  const hasNode = await checkCommand('node', 'Node.js');
  console.log(hasNode ? 
    chalk.green('✅ Node.js is installed') : 
    chalk.red('❌ Node.js not found - please install Node.js 18+')
  );

  // Check Ollama
  const hasOllama = await checkCommand('ollama', 'Ollama');
  console.log(hasOllama ? 
    chalk.green('✅ Ollama is installed') : 
    chalk.red('❌ Ollama not found')
  );

  if (!hasNode) {
    console.log(chalk.red('\n🚨 Please install Node.js first: https://nodejs.org/'));
    process.exit(1);
  }

  if (!hasOllama) {
    const { installOllama } = await inquirer.prompt([{
      type: 'confirm',
      name: 'installOllama',
      message: 'Would you like installation instructions for Ollama?',
      default: true
    }]);

    if (installOllama) {
      console.log(boxen(
        chalk.white.bold('📦 Ollama Installation Instructions:\n\n') +
        chalk.cyan('Windows:\n') +
        chalk.gray('  Download from: https://ollama.ai/download\n\n') +
        chalk.cyan('macOS/Linux:\n') +
        chalk.gray('  curl -fsSL https://ollama.ai/install.sh | sh\n\n') +
        chalk.yellow('After installation, restart this setup script.'),
        { padding: 1, borderStyle: 'round', borderColor: 'blue' }
      ));
      process.exit(0);
    }
  }

  // Check if DeepSeek model is available
  console.log(chalk.yellow('\n🤖 Checking DeepSeek-R1:1.5B model...\n'));
  
  try {
    const { stdout } = await execAsync('ollama list');
    const hasDeepSeek = stdout.includes('deepseek-r1:1.5b');
    
    if (hasDeepSeek) {
      console.log(chalk.green('✅ DeepSeek-R1:1.5B model is available!'));
    } else {
      console.log(chalk.yellow('📥 DeepSeek-R1:1.5B model not found.'));
      
      const { downloadModel } = await inquirer.prompt([{
        type: 'confirm',
        name: 'downloadModel',
        message: 'Would you like to download DeepSeek-R1:1.5B now? (~1.1GB)',
        default: true
      }]);

      if (downloadModel) {
        const spinner = ora('📥 Downloading DeepSeek-R1:1.5B model...').start();
        spinner.info('This may take several minutes depending on your internet connection.');
        
        try {
          await execAsync('ollama pull deepseek-r1:1.5b');
          spinner.succeed('✅ DeepSeek-R1:1.5B model downloaded successfully!');
        } catch (error) {
          spinner.fail('❌ Failed to download model');
          console.log(chalk.red(`Error: ${error.message}`));
          console.log(chalk.yellow('\n🔧 Try running manually: ollama pull deepseek-r1:1.5b'));
          process.exit(1);
        }
      }
    }
  } catch (error) {
    console.log(chalk.red('❌ Cannot check Ollama models. Is Ollama running?'));
    console.log(chalk.yellow('💡 Try starting Ollama: ollama serve'));
    process.exit(1);
  }

  // Final setup check
  console.log(chalk.green.bold('\n✨ Setup Complete!\n'));
  
  console.log(boxen(
    chalk.white.bold('🚀 Ready to use the AI Agent!\n\n') +
    chalk.cyan('Start the agent:\n') +
    chalk.gray('  npm start\n\n') +
    chalk.cyan('Or run the demo:\n') +
    chalk.gray('  node demo.js\n\n') +
    chalk.yellow('Commands available in the agent:\n') +
    chalk.gray('  • help - Show all commands\n') +
    chalk.gray('  • chat - Interactive chat mode\n') +
    chalk.gray('  • calc - Calculator tool\n') +
    chalk.gray('  • think - Deep reasoning mode\n') +
    chalk.gray('  • code - Code generation'),
    { padding: 1, borderStyle: 'double', borderColor: 'green' }
  ));

  const { startNow } = await inquirer.prompt([{
    type: 'confirm',
    name: 'startNow',
    message: 'Would you like to start the AI agent now?',
    default: true
  }]);

  if (startNow) {
    console.log(chalk.blue('\n🚀 Starting AI Agent...\n'));
    const { spawn } = await import('child_process');
    spawn('node', ['ai-agent.js'], { stdio: 'inherit' });
  } else {
    console.log(chalk.green('\n👋 Run "npm start" when you\'re ready!'));
  }
}

main().catch(error => {
  console.error(chalk.red('🚨 Setup failed:', error.message));
  process.exit(1);
}); 