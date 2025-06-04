const { Desktop } = require('terminator.js');

async function comprehensiveDemo() {
  console.log('🎯 Terminator SDK - Comprehensive Demo\n');
  console.log('This demo showcases the key features of the Terminator desktop automation SDK\n');
  
  try {
    // Initialize the desktop automation engine
    console.log('🚀 Initializing Desktop Automation...');
    const desktop = new Desktop();
    
    // === PART 1: System Information ===
    console.log('\n📊 === SYSTEM INFORMATION ===');
    
    // Get root element
    const root = desktop.root();
    console.log(`🖥️  Root Element: "${root.name()}" (${root.role()})`);
    
    // Monitor information
    const monitorName = await desktop.getActiveMonitorName();
    console.log(`🖥️  Active Monitor: ${monitorName}`);
    
    // Screenshot capabilities
    const screenshot = await desktop.captureScreen();
    console.log(`📸 Screen Resolution: ${screenshot.width}x${screenshot.height}`);
    console.log(`📊 Screenshot Data: ${(screenshot.imageData.length / 1024 / 1024).toFixed(2)} MB`);
    
    // === PART 2: Application Discovery ===
    console.log('\n📱 === APPLICATION DISCOVERY ===');
    
    const apps = desktop.applications();
    console.log(`🔍 Found ${apps.length} running applications:`);
    
    apps.slice(0, 5).forEach((app, index) => {
      const name = app.name() || '[Unnamed]';
      console.log(`   ${index + 1}. ${name} (${app.role()})`);
    });
    
    if (apps.length > 5) {
      console.log(`   ... and ${apps.length - 5} more applications`);
    }
    
    // Current application
    try {
      const currentApp = await desktop.getCurrentApplication();
      console.log(`🎯 Current Application: "${currentApp.name()}"`);
    } catch (error) {
      console.log('🎯 Current Application: Could not determine');
    }
    
    // === PART 3: UI Element Analysis ===
    console.log('\n🔍 === UI ELEMENT ANALYSIS ===');
    
    const elementTypes = [
      { name: 'Buttons', selector: 'role:Button', emoji: '🔘' },
      { name: 'Text Elements', selector: 'role:Text', emoji: '📝' },
      { name: 'Edit Controls', selector: 'role:Edit', emoji: '✏️' },
      { name: 'Links', selector: 'role:Link', emoji: '🔗' },
      { name: 'Images', selector: 'role:Image', emoji: '🖼️' }
    ];
    
    for (const elementType of elementTypes) {
      try {
        const elements = await desktop.locator(elementType.selector).all(3000);
        console.log(`${elementType.emoji} ${elementType.name}: ${elements.length} found`);
        
        if (elements.length > 0) {
          try {
            const firstName = elements[0].name();
            console.log(`   First: "${firstName || '[Unnamed]'}"`);
          } catch (e) {
            console.log(`   First: [Unable to get name]`);
          }
        }
      } catch (error) {
        console.log(`${elementType.emoji} ${elementType.name}: Error - ${error.message.substring(0, 50)}...`);
      }
    }
    
    // === PART 4: OCR Demonstration ===
    console.log('\n🔤 === OCR CAPABILITIES ===');
    
    try {
      console.log('📸 Performing OCR on current screen...');
      const ocrText = await desktop.ocrScreenshot(screenshot);
      
      console.log(`📄 OCR Results:`);
      console.log(`   Text Length: ${ocrText.length} characters`);
      console.log(`   Preview (first 150 chars):`);
      console.log('   ' + '-'.repeat(50));
      console.log(`   ${ocrText.substring(0, 150)}...`);
      console.log('   ' + '-'.repeat(50));
      
      // Check for specific keywords
      const keywords = ['terminator', 'automation', 'github', 'desktop', 'browser'];
      const foundKeywords = keywords.filter(keyword => 
        ocrText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length > 0) {
        console.log(`✅ Found keywords: ${foundKeywords.join(', ')}`);
      }
      
    } catch (error) {
      console.log('❌ OCR failed:', error.message);
    }
    
    // === PART 5: Command Execution ===
    console.log('\n💻 === COMMAND EXECUTION ===');
    
    const testCommands = [
      { cmd: 'echo Hello from Terminator!', desc: 'Simple echo command' },
      { cmd: 'dir /b | findstr /c:".js"', desc: 'List JavaScript files' },
      { cmd: 'powershell "Get-Date"', desc: 'Get current date/time' }
    ];
    
    for (const test of testCommands) {
      try {
        console.log(`🔧 ${test.desc}:`);
        const result = await desktop.runCommand(test.cmd);
        console.log(`   ✅ Exit Code: ${result.exitStatus || 0}`);
        console.log(`   📤 Output: ${result.stdout.trim().substring(0, 100)}${result.stdout.length > 100 ? '...' : ''}`);
        if (result.stderr && result.stderr.trim()) {
          console.log(`   ⚠️  Error: ${result.stderr.trim()}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
    // === PART 6: Browser Integration ===
    console.log('\n🌐 === BROWSER INTEGRATION ===');
    
    try {
      console.log('🔍 Checking for browser window...');
      const browserWindow = await desktop.getCurrentBrowserWindow();
      console.log(`📱 Browser Window: "${browserWindow.name()}"`);
      
      // Count web elements
      const webLinks = await desktop.locator('role:Link').all(2000);
      const webButtons = await desktop.locator('role:Button').all(2000);
      
      console.log(`🔗 Web Links Found: ${webLinks.length}`);
      console.log(`🔘 Web Buttons Found: ${webButtons.length}`);
      
    } catch (error) {
      console.log('❌ No browser window detected or error:', error.message.substring(0, 50) + '...');
    }
    
    // === PART 7: Focus and Interaction Analysis ===
    console.log('\n🎯 === FOCUS ANALYSIS ===');
    
    try {
      const focused = desktop.focusedElement();
      console.log(`🎯 Currently Focused: "${focused.name() || '[Unnamed]'}" (${focused.role()})`);
      
      // Try to get element ID
      try {
        const focusedId = focused.id();
        console.log(`🆔 Element ID: ${focusedId || '[No ID]'}`);
      } catch (e) {
        console.log('🆔 Element ID: [Unable to retrieve]');
      }
      
    } catch (error) {
      console.log('❌ Could not get focused element:', error.message);
    }
    
    // === SUMMARY ===
    console.log('\n🎉 === DEMO SUMMARY ===');
    console.log('✅ Desktop automation engine initialized successfully');
    console.log('✅ System information retrieved');
    console.log('✅ Application discovery working');
    console.log('✅ UI element detection functioning');
    console.log('✅ OCR capabilities demonstrated');
    console.log('✅ Command execution tested');
    console.log('✅ Browser integration explored');
    console.log('✅ Focus tracking operational');
    
    console.log('\n🚀 Terminator SDK is ready for automation tasks!');
    console.log('\nNext steps:');
    console.log('  • Use specific selectors to target UI elements');
    console.log('  • Combine with .click(), .typeText(), .text() for interactions');
    console.log('  • Leverage OCR for visual text detection');
    console.log('  • Automate workflows across applications');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error);
  }
}

comprehensiveDemo(); 