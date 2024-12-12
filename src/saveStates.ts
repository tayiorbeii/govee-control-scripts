import fs from 'fs/promises';
import path from 'path';
import { getCurrentDeviceStates } from './goveeControl.js';

const STATES_FILE = 'saved-states.json';

export async function saveCurrentStates() {
  try {
    const states = await getCurrentDeviceStates();
    await fs.writeFile(
      STATES_FILE,
      JSON.stringify(states, null, 2),
      'utf-8'
    );
    console.log('Successfully saved current states to', STATES_FILE);
    return states;
  } catch (error) {
    console.error('Error saving states:', error);
    throw error;
  }
} 