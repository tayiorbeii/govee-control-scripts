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

interface ColorConfig {
  currentColors: {
    [deviceName: string]: string;
  };
  favoriteColors: ColorChoice[];
}

export class ColorService {
  private savedStates: SavedStates = {};
  private colorConfig: ColorConfig = {
    currentColors: {},
    favoriteColors: []
  };

  async init(): Promise<void> {
    try {
      const savedStatesPath = join(process.cwd(), CONFIG_FILES.SAVED_STATES);
      const data = readFileSync(savedStatesPath, 'utf8');
      this.savedStates = JSON.parse(data);

      const colorsPath = join(process.cwd(), CONFIG_FILES.COLORS);
      const colorData = readFileSync(colorsPath, 'utf8');
      this.colorConfig = JSON.parse(colorData);
    } catch (error) {
      console.warn('Error loading configuration:', error);
    }
  }

  async getCurrentColor(deviceName: string): Promise<string | undefined> {
    return this.colorConfig.currentColors[deviceName] || this.savedStates[deviceName]?.color;
  }

  async setCurrentColor(deviceName: string, color: string): Promise<void> {
    if (!this.savedStates[deviceName]) {
      this.savedStates[deviceName] = {};
    }
    this.savedStates[deviceName].color = color;
    this.colorConfig.currentColors[deviceName] = color;
    await this.saveStates();
    await this.saveColors();
  }

  getFavoriteColors(): ColorChoice[] {
    return this.colorConfig.favoriteColors;
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

  private async saveColors(): Promise<void> {
    try {
      const colorsPath = join(process.cwd(), CONFIG_FILES.COLORS);
      writeFileSync(colorsPath, JSON.stringify(this.colorConfig, null, 2));
    } catch (error) {
      console.error('Error saving colors:', error);
      throw error;
    }
  }
} 