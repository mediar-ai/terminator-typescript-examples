const { Desktop } = require('terminator.js');

async function automateNotepad() {
  console.log('📝 Notepad Automation Example\n');
  
  try {
    const desktop = new Desktop();
    
    console.log('📱 Opening Notepad...');
    
    // Open notepad
    await desktop.openApplication('notepad');
    
    // Wait for notepad to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔍 Looking for Notepad window...');
    const notepadWindow = desktop.locator('window:Notepad');
    await notepadWindow.expectVisible();
    
    // Find the text editor area
    console.log('✏️ Finding text editor...');
    const textEditor = desktop.locator('window:Notepad').locator('role:Edit');
    
    // Type some text
    const sampleText = `Hello from Terminator SDK!

This is a demonstration of:
- Opening applications
- Finding UI elements
- Typing text
- Getting element properties

Current time: ${new Date().toLocaleString()}

Pretty cool, right? 🚀`;

    console.log('⌨️ Typing text...');
    await textEditor.typeText(sampleText);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the text back to verify
    console.log('📖 Reading back the text...');
    const result = await textEditor.text();
    console.log('📄 Text content preview:');
    console.log('-------------------');
    console.log(result.substring(0, 100) + '...');
    console.log('-------------------');
    
    // Get element bounds
    const bounds = await textEditor.bounds();
    console.log('📏 Text editor bounds:', {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    });
    
    // Check if element is visible
    const isVisible = await textEditor.isVisible();
    console.log('👁️ Text editor is visible:', isVisible);
    
    // Get element attributes
    console.log('🏷️ Getting element attributes...');
    const attributes = await textEditor.attributes();
    console.log('Element attributes:', {
      role: attributes.role,
      name: attributes.name,
      value: attributes.value ? attributes.value.substring(0, 50) + '...' : null
    });
    
    console.log('✅ Notepad automation completed!');
    
  } catch (error) {
    console.error('❌ Notepad automation failed:', error.message);
    console.error(error);
  }
}

automateNotepad(); 