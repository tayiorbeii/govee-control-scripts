import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CONFIG_FILES } from '../utils/constants.js';

interface ColorChoice {
  name: string;
  hex: string;
}

interface SavedStates {
  [deviceName: string]: {
    color?: string;
    brightness?: number;
    colorTemp?: number;
    power?: boolean;
  };
}

export class ColorService {
  private savedStates: SavedStates = {};
  private favoriteColors: ColorChoice[] = [
    { name: 'Warm White', hex: '#FF8C00' },
    { name: 'Cool White', hex: '#F5F5F5' },
    { name: 'Soft White', hex: '#FFE4C4' },
    { name: 'Reading Light', hex: '#FFF5E1' },
    { name: 'Night Light', hex: '#FFB347' },
    { name: 'Relaxing', hex: '#B19CD9' },
    { name: 'Focus', hex: '#87CEEB' },
    { name: 'Energizing', hex: '#98FB98' }
  ];

  async init(): Promise<void> {
    try {
      const savedStatesPath = join(process.cwd(), CONFIG_FILES.SAVED_STATES);
      const data = readFileSync(savedStatesPath, 'utf8');
      this.savedStates = JSON.parse(data);
    } catch (error) {
      console.warn('No saved states found, using defaults');
    }
  }

  async getCurrentColor(deviceName: string): Promise<string | undefined> {
    return this.savedStates[deviceName]?.color;
  }

  async setCurrentColor(deviceName: string, color: string): Promise<void> {
    if (!this.savedStates[deviceName]) {
      this.savedStates[deviceName] = {};
    }
    this.savedStates[deviceName].color = color;
    await this.saveStates();
  }

  getFavoriteColors(): ColorChoice[] {
    return this.favoriteColors;
  }

  private async saveStates(): Promise<void> {
    try {
      const savedStatesPath = join(process.cwd(), CONFIG_FILES.SAVED_STATES);
      writeFileSync(savedStatesPath, JSON.stringify(this.savedStates, null, 2));
    } catch (error) {
      console.error('Error saving states:', error);
      throw error;
    }
  }
} 