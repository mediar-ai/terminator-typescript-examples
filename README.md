# 🤖 DeepSeek AI Agent

> A powerful local AI agent using DeepSeek-R1:1.5B via Ollama and Vercel AI SDK

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Compatible-blue.svg)](https://ollama.ai/)
[![DeepSeek-R1](https://img.shields.io/badge/DeepSeek--R1-1.5B-purple.svg)](https://ollama.com/library/deepseek-r1:1.5b)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-4.0+-orange.svg)](https://sdk.vercel.ai/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![AI Agent Demo](https://via.placeholder.com/800x400/2D1B69/FFFFFF?text=🤖+DeepSeek+AI+Agent)

</div>

## ✨ Features

- 🧠 **Advanced Reasoning**: Powered by DeepSeek-R1:1.5B reasoning model
- 🛠️ **Tool Calling**: Calculator, file operations, web search simulation, code generation
- 💬 **Interactive Chat**: Streaming responses with conversation history
- 🎨 **Beautiful CLI**: Rich formatting with colors, gradients, and animations
- 📚 **Memory**: Persistent conversation history within sessions
- 🔄 **Real-time**: Live streaming responses as the AI thinks
- 🎯 **Local**: Runs completely offline after initial setup

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+**: [Download here](https://nodejs.org/)
2. **Ollama**: Install locally
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

### Installation

1. **Clone and setup**:
   ```bash
   git clone <your-repo-url>
   cd deepseek-ai-agent
   npm install
   ```

2. **Install the DeepSeek-R1:1.5B model**:
   ```bash
   # Pull the model (this will download ~1.1GB)
   ollama pull deepseek-r1:1.5b
   
   # Or use the npm script
   npm run install-model
   ```

3. **Start Ollama service** (if not running):
   ```bash
   ollama serve
   ```

4. **Run the AI Agent**:
   ```bash
   npm start
   # or
   node ai-agent.js
   ```

## 🎮 Usage

Once started, you'll see a beautiful banner and command prompt. Here are the available commands:

### 📋 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show all available commands | `help` |
| `chat` | Start interactive chat mode | `chat` |
| `calc <expression>` | Quick mathematical calculation | `calc 15 * 42 + 8` |
| `files` | List files in current directory | `files` |
| `think <question>` | Deep reasoning mode | `think Why is the sky blue?` |
| `code <lang> <task>` | Generate code | `code python fibonacci sequence` |
| `history` | Show conversation history | `history` |
| `clear` | Clear conversation history | `clear` |
| `exit` | Exit the agent | `exit` |

### 💬 Chat Mode

In chat mode, the AI can:
- Answer questions with advanced reasoning
- Use tools automatically (calculator, file operations, etc.)
- Generate code in any programming language
- Maintain conversation context
- Stream responses in real-time

**Example chat session:**
```
🧑 You: Can you help me calculate the area of a circle with radius 5 and then write Python code to do this calculation?

🤖 AI: I'll help you calculate the area of a circle with radius 5 and then provide Python code for this calculation.

First, let me calculate the area using the formula A = πr²:

🔧 Tool Results:
  Tool: calculator
  Result: {
    "result": "78.53975",
    "expression": "3.14159 * 5 * 5"
  }

The area of a circle with radius 5 is approximately 78.54 square units.

Now, here's Python code to calculate the area of a circle:

```python
import math

def circle_area(radius):
    """Calculate the area of a circle given its radius."""
    return math.pi * radius ** 2

# Example usage
radius = 5
area = circle_area(radius)
print(f"The area of a circle with radius {radius} is {area:.2f} square units")
```

## 🛠️ Tool System

The AI agent has access to several built-in tools:

### 🧮 Calculator
Perform mathematical calculations safely:
```bash
> calc 15 * 42 + sqrt(16)
✅ 15 * 42 + sqrt(16) = 634
```

### 📂 File Manager
Read, write, and list files:
```bash
> files
📁 Files in .:
  • ai-agent.js
  • package.json
  • README.md
```

### 🔍 Web Search (Simulated)
Simulate web search results (extend for real implementation):
```javascript
// In chat mode, ask: "Search for information about Node.js"
// The AI will use the webSearch tool automatically
```

### 💻 Code Generator
Generate code in any programming language:
```bash
> code javascript "function to reverse a string"
💻 Generated JavaScript Code:

function reverseString(str) {
    return str.split('').reverse().join('');
}
```

## 🧠 Advanced Reasoning

DeepSeek-R1 features advanced reasoning capabilities. Use the `think` command for complex problems:

```bash
> think How would you design a scalable microservices architecture for an e-commerce platform?

🧠 Deep Reasoning Result:

[Detailed reasoning about microservices architecture, including:
- Service decomposition strategies
- Data management patterns
- Communication protocols
- Scaling considerations
- Security implications]
```

## ⚙️ Configuration

### Model Configuration
You can modify the model settings in `ai-agent.js`:

```javascript
const model = ollama('deepseek-r1:1.5b', {
  temperature: 0.7,        // Creativity level (0.0-1.0)
  simulateStreaming: true, // Enable streaming responses
  // Add more Ollama-specific options
});
```

### Custom Tools
Add your own tools by extending the `tools` object:

```javascript
const tools = {
  // ... existing tools
  
  customTool: {
    description: 'Your custom tool description',
    parameters: z.object({
      param: z.string().describe('Parameter description'),
    }),
    execute: async ({ param }) => {
      // Your tool logic here
      return { result: 'Tool result' };
    }
  }
};
```

## 🎨 Customization

The agent supports rich customization:

- **Colors**: Modify gradients and chalk colors
- **Styling**: Change boxen styles and borders
- **Commands**: Add new commands to the `commands` object
- **Tools**: Extend functionality with custom tools
- **Model**: Switch to different Ollama models

## 📊 Performance

### Model Specifications

| Attribute | Value |
|-----------|-------|
| **Model Size** | 1.5B parameters |
| **Download Size** | ~1.1GB |
| **RAM Usage** | ~2-4GB during inference |
| **Architecture** | Qwen2-based reasoning model |
| **Context Length** | 131,072 tokens |

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 8GB | 16GB+ |
| **Storage** | 2GB free | 5GB+ free |
| **CPU** | 4 cores | 8 cores+ |
| **GPU** | None (CPU only) | NVIDIA GPU for faster inference |

## 🔧 Troubleshooting

### Common Issues

1. **Model not found**:
   ```bash
   Error: Model deepseek-r1:1.5b not found
   
   # Solution: Pull the model
   ollama pull deepseek-r1:1.5b
   ```

2. **Ollama not running**:
   ```bash
   Error: Connection refused
   
   # Solution: Start Ollama service
   ollama serve
   ```

3. **Permission errors**:
   ```bash
   # On macOS/Linux, you might need:
   chmod +x ai-agent.js
   ```

4. **Out of memory**:
   - Close other applications
   - Use a smaller model variant
   - Add more RAM to your system

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=* node ai-agent.js
```

## 🛡️ Security Considerations

- **Local execution**: All data stays on your machine
- **Safe evaluation**: Calculator uses Function constructor with restrictions
- **File access**: Limited to current directory by default
- **No external calls**: Web search is simulated (safe for local use)

## 🔮 Future Enhancements

- [ ] **Plugin system** for custom tools
- [ ] **Multiple model support** (switch between models)
- [ ] **Conversation export** (JSON, Markdown)
- [ ] **Real web search** integration
- [ ] **Voice input/output** support
- [ ] **GUI version** using Electron
- [ ] **Docker containerization**
- [ ] **Multi-language support**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Areas where help is needed:

- Additional tool implementations
- UI/UX improvements
- Performance optimizations
- Documentation enhancements
- Bug fixes and testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DeepSeek** for the amazing R1 reasoning model
- **Ollama** for local model serving
- **Vercel** for the excellent AI SDK
- **Community** for tool inspirations and feedback

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#🔧-troubleshooting)
2. Search existing [issues](https://github.com/your-username/deepseek-ai-agent/issues)
3. Create a new issue with detailed information

---

<div align="center">

**Made with ❤️ and 🤖 by the AI community**

[⭐ Star this repo](https://github.com/your-username/deepseek-ai-agent) if you found it helpful!

</div> 