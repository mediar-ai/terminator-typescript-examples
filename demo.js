#!/usr/bin/env node

/**
 * 🚀 Quick Demo of AI Agent Features
 * 
 * This demo showcases the beautiful CLI interface and tool system
 * without requiring the full Ollama setup.
 */

import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import ora from 'ora';

// 🎨 Styling
const rainbowGradient = gradient(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']);
const purpleGradient = gradient(['#6C5CE7', '#A29BFE']);

console.clear();
console.log(rainbowGradient(figlet.textSync('AI Agent', { font: 'ANSI Shadow' })));
console.log(purpleGradient('\n🤖 Powered by DeepSeek-R1:1.5B + Ollama + Vercel AI SDK\n'));

console.log(boxen(
  chalk.white.bold('🚀 Demo Features:\n') +
  chalk.cyan('• Beautiful CLI interface with colors and animations\n') +
  chalk.cyan('• Tool system (calculator, file manager, code gen)\n') +
  chalk.cyan('• Advanced reasoning capabilities\n') +
  chalk.cyan('• Streaming responses\n') +
  chalk.cyan('• Conversation history\n') +
  chalk.gray('\nThis is a preview of the full AI agent!'),
  {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'magenta'
  }
));

// Demo calculator tool
console.log(chalk.blue.bold('\n🧮 Calculator Tool Demo:'));
const calcSpinner = ora('Calculating 15 * 42 + 8...').start();
setTimeout(() => {
  calcSpinner.succeed('✅ 15 * 42 + 8 = 638');
  
  // Demo file listing
  console.log(chalk.blue.bold('\n📂 File Manager Demo:'));
  const fileSpinner = ora('Listing files...').start();
  
  setTimeout(() => {
    fileSpinner.succeed('📁 Files found:');
    console.log(chalk.gray('  • ai-agent.js'));
    console.log(chalk.gray('  • package.json'));
    console.log(chalk.gray('  • README.md'));
    console.log(chalk.gray('  • demo.js'));
    
    // Demo code generation
    console.log(chalk.blue.bold('\n💻 Code Generation Demo:'));
    const codeSpinner = ora('Generating Python code...').start();
    
    setTimeout(() => {
      codeSpinner.succeed('Generated Python code:');
      console.log(boxen(
        chalk.white('def fibonacci(n):\n') +
        chalk.white('    """Generate fibonacci sequence up to n terms"""\n') +
        chalk.white('    a, b = 0, 1\n') +
        chalk.white('    for _ in range(n):\n') +
        chalk.white('        yield a\n') +
        chalk.white('        a, b = b, a + b'),
        { padding: 1, borderStyle: 'round', borderColor: 'green' }
      ));
      
      // Setup instructions
      console.log(chalk.yellow.bold('\n🚨 To run the full AI agent:'));
      console.log(chalk.white('1. Install Ollama: ') + chalk.cyan('curl -fsSL https://ollama.ai/install.sh | sh'));
      console.log(chalk.white('2. Pull the model: ') + chalk.cyan('ollama pull deepseek-r1:1.5b'));
      console.log(chalk.white('3. Start the agent: ') + chalk.cyan('npm start'));
      
      console.log(chalk.green.bold('\n✨ The AI agent is ready to amaze you!'));
      console.log(chalk.gray('Run "npm start" when you have Ollama set up.\n'));
      
    }, 1500);
  }, 1000);
}, 800); 