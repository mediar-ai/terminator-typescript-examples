const { Desktop } = require('terminator.js');

async function automateCalculator() {
  console.log('🧮 Calculator Automation Example\n');
  
  try {
    const desktop = new Desktop();
    
    console.log('📱 Opening Calculator...');
    
    // Open calculator
    await desktop.openApplication('calc');
    
    // Wait a moment for it to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Locate calculator window
    console.log('🔍 Looking for Calculator window...');
    const calcWindow = desktop.locator('window:Calculator');
    await calcWindow.expectVisible();
    
    console.log('🔢 Performing calculation: 7 + 3 = ?');
    
    // Click number 7
    const sevenButton = desktop.locator('name:Seven');
    await sevenButton.click();
    console.log('  Clicked: 7');
    
    // Click plus
    const plusButton = desktop.locator('name:Plus');
    await plusButton.click();
    console.log('  Clicked: +');
    
    // Click number 3
    const threeButton = desktop.locator('name:Three');
    await threeButton.click();
    console.log('  Clicked: 3');
    
    // Click equals
    const equalsButton = desktop.locator('name:Equals');
    await equalsButton.click();
    console.log('  Clicked: =');
    
    // Wait a moment for calculation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get result using the correct method
    console.log('📊 Getting result...');
    const resultElement = desktop.locator('automationid:CalculatorResults');
    const result = await resultElement.text();
    console.log(`🎉 Calculation result: ${result}`);
    
    // Take a screenshot of the calculator
    console.log('📸 Taking screenshot...');
    const screenshot = await desktop.captureScreen();
    console.log(`📷 Screenshot captured: ${screenshot.width}x${screenshot.height}`);
    
    console.log('✅ Calculator automation completed!');
    
  } catch (error) {
    console.error('❌ Calculator automation failed:', error.message);
    console.error(error);
  }
}

automateCalculator(); 