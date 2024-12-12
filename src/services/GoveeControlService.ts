import { GoveeApiService } from "./GoveeApiService.js";
import {
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
  MIN_COLOR_TEMP,
  MAX_COLOR_TEMP,
} from "../utils/constants.js";
import type { GoveeDevice } from "../types";
import { devices } from "../config/devices.js";

export class GoveeControlService {
  private apiService: GoveeApiService;

  constructor() {
    this.apiService = new GoveeApiService();
  }

  async turnDevice(device: GoveeDevice, power: boolean): Promise<void> {
    await this.apiService.turnDevice(device.device, device.sku, power);
  }

  async setBrightness(device: GoveeDevice, brightness: number): Promise<void> {
    if (brightness < MIN_BRIGHTNESS || brightness > MAX_BRIGHTNESS) {
      throw new Error(
        `Brightness must be between ${MIN_BRIGHTNESS} and ${MAX_BRIGHTNESS}`
      );
    }

    await this.apiService.setBrightness(device.device, device.sku, brightness);
  }

  async setColor(
    device: GoveeDevice,
    color: { r: number; g: number; b: number }
  ): Promise<void> {
    // Validate RGB values
    if (Object.values(color).some((v) => v < 0 || v > 255)) {
      throw new Error("RGB values must be between 0 and 255");
    }

    await this.apiService.setColor(device.device, device.sku, color);
  }

  async setColorTemperature(
    device: GoveeDevice,
    temperature: number
  ): Promise<void> {
    if (temperature < MIN_COLOR_TEMP || temperature > MAX_COLOR_TEMP) {
      throw new Error(
        `Color temperature must be between ${MIN_COLOR_TEMP}K and ${MAX_COLOR_TEMP}K`
      );
    }

    await this.apiService.setColorTemperature(
      device.device,
      device.sku,
      temperature
    );
  }

  async getDeviceState(device: GoveeDevice) {
    return this.apiService.getDeviceState(device.device, device.sku);
  }

  async getAllDevices() {
    return this.apiService.getDevices();
  }
}

// Create a singleton instance
const goveeControl = new GoveeControlService();

// Export individual functions that wrap the class methods
export const turnOn = async (deviceName: string) => {
  const device = devices[deviceName];
  if (!device) {
    throw new Error(`Device ${deviceName} not found`);
  }
  await goveeControl.turnDevice(device, true);
};

export const turnOff = async (deviceName: string) => {
  const device = devices[deviceName];
  if (!device) {
    throw new Error(`Device ${deviceName} not found`);
  }
  await goveeControl.turnDevice(device, false);
};

export const setBrightness = async (deviceName: string, brightness: number) => {
  const device = devices[deviceName];
  if (!device) {
    throw new Error(`Device ${deviceName} not found`);
  }
  await goveeControl.setBrightness(device, brightness);
};

export const setColor = async (deviceName: string, hexColor: string) => {
  const device = devices[deviceName];
  if (!device) {
    throw new Error(`Device ${deviceName} not found`);
  }

  // Convert hex to RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  await goveeControl.setColor(device, { r, g, b });
};

export const setColorTemperature = async (
  deviceName: string,
  temperature: number
) => {
  const device = devices[deviceName];
  if (!device) {
    throw new Error(`Device ${deviceName} not found`);
  }
  await goveeControl.setColorTemperature(device, temperature);
};

export const workMode = async () => {
  // Implement work mode logic here
  throw new Error("Work mode not implemented");
};

export const saveCurrentStates = async () => {
  // Implement save states logic here
  throw new Error("Save states not implemented");
};
