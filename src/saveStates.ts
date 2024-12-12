import fs from 'fs/promises';
import path from 'path';
import { getCurrentDeviceStates } from './goveeControl.js';

export async function saveCurrentStates() {
  try {
    console.log("Getting current device states...");
    const states = await getCurrentDeviceStates();
    
    const savePath = path.join(process.cwd(), "src", "config", "saved-states.json");
    console.log("Saving states to:", savePath);
    
    await fs.writeFile(
      savePath,
      JSON.stringify(states, null, 2),
      'utf-8'
    );
    console.log('Successfully saved current states to saved-states.json');
    return states;
  } catch (error) {
    console.error('Error saving states:', error);
    throw error;
  }
}

// Run if called directly
if (process.argv[1].endsWith('saveStates.ts') || process.argv[1].endsWith('tsx')) {
  console.log("Running saveStates directly...");
  saveCurrentStates().catch(console.error);
} 