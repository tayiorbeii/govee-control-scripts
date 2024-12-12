import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

interface ColorState {
  currentColors: Record<string, string>;  // deviceName -> hex color
  favoriteColors: {
    name: string;
    hex: string;
  }[];
}

const DEFAULT_COLORS: ColorState = {
  currentColors: {},
  favoriteColors: [
    { name: "Warm White", hex: "#FFE5CC" },
    { name: "Cool White", hex: "#F5F5F5" },
    { name: "Soft White", hex: "#F4EBD9" },
    { name: "Reading", hex: "#FFE0B3" },
    { name: "Relaxing", hex: "#FFD700" },
    { name: "Evening", hex: "#FFA07A" },
  ]
};

class ColorManager {
  private colorState: ColorState = DEFAULT_COLORS;
  private readonly filePath: string;

  constructor() {
    // Get the directory of the current module
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.filePath = path.join(__dirname, '..', 'colors.json');
  }

  async init(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      this.colorState = {
        currentColors: parsed.currentColors || {},
        favoriteColors: parsed.favoriteColors || DEFAULT_COLORS.favoriteColors
      };
    } catch (error) {
      // If file doesn't exist or is invalid, create it with default values
      await this.save();
    }
  }

  private async save(): Promise<void> {
    try {
      await fs.writeFile(
        this.filePath, 
        JSON.stringify(this.colorState, null, 2)
      );
    } catch (error) {
      console.error('Error saving color state:', error);
    }
  }

  async getCurrentColor(deviceName: string): Promise<string | undefined> {
    return this.colorState.currentColors[deviceName];
  }

  async setCurrentColor(deviceName: string, color: string): Promise<void> {
    this.colorState.currentColors[deviceName] = color;
    await this.save();
  }

  getFavoriteColors(): { name: string; hex: string; }[] {
    return this.colorState.favoriteColors;
  }
}

export const colorManager = new ColorManager(); 