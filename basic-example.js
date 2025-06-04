const { Desktop } = require('terminator.js');

async function basicExample() {
  console.log('🚀 Starting Terminator SDK exploration...\n');
  
  try {
    const desktop = new Desktop();
    
    // Get root element info
    const root = desktop.root();
    console.log('📱 Root element:', {
      role: root.role(),
      name: root.name()
    });
    
    // List running applications
    console.log('\n📂 Running applications:');
    const apps = desktop.applications();
    apps.slice(0, 5).forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.name()} (${app.role()})`);
    });
    if (apps.length > 5) {
      console.log(`  ... and ${apps.length - 5} more applications`);
    }
    
    // Get focused element
    console.log('\n🎯 Currently focused element:');
    const focused = desktop.focusedElement();
    console.log(`  Name: ${focused.name()}`);
    console.log(`  Role: ${focused.role()}`);
    
    // Take a screenshot
    console.log('\n📸 Taking screenshot...');
    const screenshot = await desktop.captureScreen();
    console.log(`  Size: ${screenshot.width}x${screenshot.height}`);
    console.log(`  Data size: ${screenshot.imageData.length} bytes`);
    
    // Run a simple command
    console.log('\n💻 Running command...');
    const result = await desktop.runCommand('echo Hello from Terminator!');
    console.log(`  Output: ${result.stdout.trim()}`);
    
    console.log('\n✅ Basic example completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

basicExample(); 