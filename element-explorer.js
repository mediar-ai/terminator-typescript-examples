const { Desktop } = require('terminator.js');

async function exploreElements() {
  console.log('🔍 Element Explorer - Testing Different Selectors\n');
  
  try {
    const desktop = new Desktop();
    
    // Test different selector patterns
    console.log('🎯 Testing selector patterns...\n');
    
    // Find elements by role
    console.log('1. Finding buttons by role:');
    try {
      const buttonLocator = desktop.locator('role:Button');
      const buttons = await buttonLocator.all();
      console.log(`   Found ${buttons.length} buttons`);
      
      // Show first few buttons
      for (let i = 0; i < Math.min(3, buttons.length); i++) {
        const button = buttons[i];
        console.log(`   - Button ${i + 1}: "${button.name()}" (${button.role()})`);
      }
    } catch (error) {
      console.log('   No buttons found or error:', error.message);
    }
    
    console.log('\n2. Finding text elements:');
    try {
      const textLocator = desktop.locator('role:Text');
      const textElements = await textLocator.all();
      console.log(`   Found ${textElements.length} text elements`);
    } catch (error) {
      console.log('   No text elements found or error:', error.message);
    }
    
    console.log('\n3. Finding edit controls:');
    try {
      const editLocator = desktop.locator('role:Edit');
      const editElements = await editLocator.all();
      console.log(`   Found ${editElements.length} edit controls`);
    } catch (error) {
      console.log('   No edit controls found or error:', error.message);
    }
    
    // Explore current window
    console.log('\n🪟 Current window exploration:');
    try {
      const currentWindow = await desktop.getCurrentWindow();
      console.log(`   Current window: "${currentWindow.name()}" (${currentWindow.role()})`);
      
      // Get window bounds
      const bounds = await currentWindow.getBounds();
      console.log(`   Window bounds: ${bounds.x}, ${bounds.y}, ${bounds.width}x${bounds.height}`);
      
      // Check if it's visible
      const isVisible = await currentWindow.isVisible();
      console.log(`   Window is visible: ${isVisible}`);
      
    } catch (error) {
      console.log('   Error getting current window:', error.message);
    }
    
    // Explore current application
    console.log('\n📱 Current application exploration:');
    try {
      const currentApp = await desktop.getCurrentApplication();
      console.log(`   Current app: "${currentApp.name()}" (${currentApp.role()})`);
    } catch (error) {
      console.log('   Error getting current application:', error.message);
    }
    
    // Monitor information
    console.log('\n🖥️ Monitor information:');
    try {
      const monitorName = await desktop.getActiveMonitorName();
      console.log(`   Active monitor: ${monitorName}`);
    } catch (error) {
      console.log('   Error getting monitor info:', error.message);
    }
    
    // OCR test (if possible)
    console.log('\n🔤 OCR Test:');
    try {
      const screenshot = await desktop.captureScreen();
      console.log('   Taking screenshot for OCR...');
      
      // This might take a while, so let's add a timeout
      const ocrPromise = desktop.ocrScreenshot(screenshot);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OCR timeout')), 10000)
      );
      
      const ocrText = await Promise.race([ocrPromise, timeoutPromise]);
      console.log(`   OCR result preview: "${ocrText.substring(0, 100)}..."`);
    } catch (error) {
      console.log('   OCR failed or timed out:', error.message);
    }
    
    console.log('\n✅ Element exploration completed!');
    
  } catch (error) {
    console.error('❌ Element exploration failed:', error.message);
    console.error(error);
  }
}

exploreElements(); 