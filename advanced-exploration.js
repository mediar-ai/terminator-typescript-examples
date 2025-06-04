const { Desktop } = require('terminator.js');

async function advancedExploration() {
  console.log('🔬 Advanced UI Element Exploration\n');
  
  try {
    const desktop = new Desktop();
    
    // First, let's see what's currently focused
    console.log('🎯 Current focus analysis:');
    const focused = desktop.focusedElement();
    console.log(`   Focused element: "${focused.name()}" (${focused.role()})`);
    
    // Let's explore the focused element and its children
    console.log('\n🔍 Exploring focused element structure...');
    try {
      const focusedLocator = desktop.locator(`automationid:${focused.id()}`);
      const exploreResult = await focusedLocator.explore();
      
      console.log(`📊 Parent element: "${exploreResult.parent.name()}" (${exploreResult.parent.role()})`);
      console.log(`👥 Found ${exploreResult.children.length} children:`);
      
      exploreResult.children.slice(0, 5).forEach((child, index) => {
        console.log(`   ${index + 1}. ${child.role}: "${child.name || 'unnamed'}" ${child.suggestedSelector ? `[${child.suggestedSelector}]` : ''}`);
      });
      
      if (exploreResult.children.length > 5) {
        console.log(`   ... and ${exploreResult.children.length - 5} more children`);
      }
    } catch (error) {
      console.log('❌ Could not explore focused element:', error.message);
    }
    
    // Let's try to find all windows and their properties
    console.log('\n🪟 Window analysis:');
    try {
      const windows = await desktop.locator('role:Window').all(3000);
      console.log(`Found ${windows.length} windows:`);
      
      for (let i = 0; i < Math.min(5, windows.length); i++) {
        const window = windows[i];
        try {
          const name = window.name();
          const bounds = await window.getBounds();
          const isVisible = await window.isVisible();
          
          console.log(`   ${i + 1}. "${name}"`);
          console.log(`      Bounds: ${bounds.x}, ${bounds.y}, ${bounds.width}x${bounds.height}`);
          console.log(`      Visible: ${isVisible}`);
        } catch (e) {
          console.log(`   ${i + 1}. [Error getting window info: ${e.message}]`);
        }
      }
    } catch (error) {
      console.log('❌ Could not analyze windows:', error.message);
    }
    
    // Let's test different selector patterns
    console.log('\n🎯 Selector pattern testing:');
    
    const selectorTests = [
      { name: 'Buttons', selector: 'role:Button' },
      { name: 'Text elements', selector: 'role:Text' },
      { name: 'Edit controls', selector: 'role:Edit' },
      { name: 'Links', selector: 'role:Link' },
      { name: 'Images', selector: 'role:Image' },
      { name: 'Menus', selector: 'role:Menu' },
      { name: 'MenuItems', selector: 'role:MenuItem' }
    ];
    
    for (const test of selectorTests) {
      try {
        const elements = await desktop.locator(test.selector).all(2000);
        console.log(`   ${test.name}: ${elements.length} found`);
        
        // Show first element name if available
        if (elements.length > 0) {
          try {
            const firstName = elements[0].name();
            console.log(`     First: "${firstName}"`);
          } catch (e) {
            console.log(`     First: [unnamed]`);
          }
        }
      } catch (error) {
        console.log(`   ${test.name}: Error - ${error.message}`);
      }
    }
    
    // Monitor and system info
    console.log('\n🖥️ System information:');
    try {
      const monitorName = await desktop.getActiveMonitorName();
      console.log(`   Active monitor: ${monitorName}`);
      
      const screenshot = await desktop.captureScreen();
      console.log(`   Screen resolution: ${screenshot.width}x${screenshot.height}`);
      console.log(`   Screenshot data size: ${(screenshot.imageData.length / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.log('❌ Could not get system info:', error.message);
    }
    
    // Test command execution
    console.log('\n💻 Command execution test:');
    try {
      const commands = [
        'echo Current time: %time%',
        'echo Current directory: %cd%',
        'echo Computer name: %computername%'
      ];
      
      for (const command of commands) {
        try {
          const result = await desktop.runCommand(command);
          console.log(`   ${command}`);
          console.log(`   → ${result.stdout.trim()}`);
        } catch (e) {
          console.log(`   ${command} → Error: ${e.message}`);
        }
      }
    } catch (error) {
      console.log('❌ Command execution failed:', error.message);
    }
    
    console.log('\n✅ Advanced exploration completed!');
    
  } catch (error) {
    console.error('❌ Advanced exploration failed:', error.message);
    console.error(error);
  }
}

advancedExploration(); 