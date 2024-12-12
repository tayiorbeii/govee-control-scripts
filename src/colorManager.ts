import fs from 'fs';
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
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.filePath = path.join(__dirname, '..', 'colors.json');
  }

  async init(): Promise<void> {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(data) as Partial<ColorState>;
      this.colorState = {
        currentColors: parsed.currentColors ?? DEFAULT_COLORS.currentColors,
        favoriteColors: parsed.favoriteColors ?? DEFAULT_COLORS.favoriteColors
      };
    } catch (error) {
      // If file doesn't exist, create it with default values
      await this.save();
    }
  }

  private async save(): Promise<void> {
    try {
      fs.writeFileSync(
        this.filePath, 
        JSON.stringify(this.colorState, null, 2)
      );
    } catch (error) {
      console.error('Error saving color state:', error);
      throw error;
    }
  }

  async getCurrentColor(deviceName: string): Promise<string | undefined> {
    return this.colorState.currentColors[deviceName];
  }

  async setCurrentColor(deviceName: string, color: string): Promise<void> {
    this.colorState.currentColors[deviceName] = color;
    await this.save();
  }

  getFavoriteColors(): Array<{ name: string; hex: string }> {
    return this.colorState.favoriteColors;
  }
}

export const colorManager = new ColorManager(); 

// Update file paths for color-related JSON files
const colorsPath = path.join(process.cwd(), "src", "config", "colors.json");
const deviceColorsPath = path.join(process.cwd(), "src", "config", "device-colors.json");

export function loadColors() {
  try {
    return JSON.parse(fs.readFileSync(colorsPath, "utf8"));
  } catch (error) {
    console.error("Error loading colors:", error);
    return {};
  }
}

export function loadDeviceColors() {
  try {
    return JSON.parse(fs.readFileSync(deviceColorsPath, "utf8"));
  } catch (error) {
    console.error("Error loading device colors:", error);
    return {};
  }
}

export function saveDeviceColors(colors: any) {
  fs.writeFileSync(deviceColorsPath, JSON.stringify(colors, null, 2));
} 