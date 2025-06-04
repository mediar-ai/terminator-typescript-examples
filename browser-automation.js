const { Desktop } = require('terminator.js');

async function automateBrowser() {
  console.log('🌐 Browser Automation Example\n');
  
  try {
    const desktop = new Desktop();
    
    console.log('🚀 Opening GitHub repository...');
    
    // Open the Terminator GitHub repository
    await desktop.openUrl('https://github.com/mediar-ai/terminator');
    
    // Wait for browser to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get current browser window
    console.log('🔍 Getting browser window...');
    const browserWindow = await desktop.getCurrentBrowserWindow();
    console.log(`📱 Browser window: "${browserWindow.name()}"`);
    
    // Take a screenshot
    console.log('📸 Taking screenshot of webpage...');
    const screenshot = await desktop.captureScreen();
    console.log(`📷 Screenshot: ${screenshot.width}x${screenshot.height}`);
    
    // Try to perform OCR on the page
    console.log('🔤 Performing OCR on the page...');
    try {
      const ocrText = await desktop.ocrScreenshot(screenshot);
      console.log(`📄 OCR detected text (first 200 chars):`);
      console.log('---');
      console.log(ocrText.substring(0, 200) + '...');
      console.log('---');
      
      // Check if we can find specific text
      if (ocrText.toLowerCase().includes('terminator')) {
        console.log('✅ Successfully detected "terminator" in the page!');
      }
      if (ocrText.toLowerCase().includes('automation')) {
        console.log('✅ Successfully detected "automation" in the page!');
      }
    } catch (error) {
      console.log('❌ OCR failed:', error.message);
    }
    
    // Try to find some common web elements
    console.log('\n🔍 Looking for web elements...');
    
    try {
      const links = await desktop.locator('role:Link').all(5000);  // 5 second timeout
      console.log(`🔗 Found ${links.length} links on the page`);
      
      // Show first few links
      for (let i = 0; i < Math.min(3, links.length); i++) {
        const link = links[i];
        try {
          const linkName = link.name();
          console.log(`   - Link ${i + 1}: "${linkName}"`);
        } catch (e) {
          console.log(`   - Link ${i + 1}: [unable to get name]`);
        }
      }
    } catch (error) {
      console.log('❌ Could not find links:', error.message);
    }
    
    try {
      const buttons = await desktop.locator('role:Button').all(3000);
      console.log(`🔘 Found ${buttons.length} buttons on the page`);
    } catch (error) {
      console.log('❌ Could not find buttons:', error.message);
    }
    
    console.log('✅ Browser automation completed!');
    
  } catch (error) {
    console.error('❌ Browser automation failed:', error.message);
    console.error(error);
  }
}

automateBrowser(); 