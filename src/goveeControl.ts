import { GoveeDevice } from "./types.js";
import { GoveeClient } from "./client.js";
import { config } from "dotenv";
import { devices } from "./devices.js";
import { colorManager } from "./colorManager.js";
import * as fs from 'fs';

config();

const API_KEY = process.env.GOVEE_API_KEY;

if (!API_KEY) {
  throw new Error("GOVEE_API_KEY environment variable is required");
}

const client = new GoveeClient(API_KEY);

type GoveeDeviceName = keyof typeof devices;

export async function turnOff(deviceName: GoveeDeviceName): Promise<void> {
  try {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(
        `Device ${deviceName} not found. Available devices: ${Object.keys(
          devices
        ).join(", ")}`
      );
    }
    await client.turnDevice(device.device, device.sku, false);
    console.log(`Successfully turned off ${deviceName}`);
  } catch (error) {
    console.error(`Error turning off ${deviceName}:`, error);
    throw error;
  }
}

export async function turnOn(deviceName: GoveeDeviceName): Promise<void> {
  try {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(
        `Device ${deviceName} not found. Available devices: ${Object.keys(
          devices
        ).join(", ")}`
      );
    }
    console.log(
      `Turning on device: ${deviceName} (${device.device}, ${device.sku})`
    );
    await client.turnDevice(device.device, device.sku, true);
    console.log(`Successfully sent turn on command to ${deviceName}`);
  } catch (error) {
    console.error(`Error turning on ${deviceName}:`, error);
    throw error;
  }
}

export async function setBrightness(
  deviceName: GoveeDeviceName,
  brightness: number
): Promise<void> {
  try {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(
        `Device ${deviceName} not found. Available devices: ${Object.keys(
          devices
        ).join(", ")}`
      );
    }
    await client.setBrightness(device.device, device.sku, brightness);
    console.log(
      `Successfully set brightness to ${brightness} for ${deviceName}`
    );
  } catch (error) {
    console.error(`Error setting brightness for ${deviceName}:`, error);
    throw error;
  }
}

export async function setColor(
  deviceName: GoveeDeviceName,
  color: string
): Promise<void> {
  try {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(
        `Device ${deviceName} not found. Available devices: ${Object.keys(
          devices
        ).join(", ")}`
      );
    }

    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Validate RGB values
    if ([r, g, b].some((v) => isNaN(v) || v < 0 || v > 255)) {
      throw new Error(`Invalid color value: ${color}`);
    }

    await client.setColor(device.device, device.sku, { r, g, b });
    await colorManager.setCurrentColor(deviceName, `#${hex}`);
    console.log(
      `Successfully set ${deviceName} color to ${color} (R:${r} G:${g} B:${b})`
    );
  } catch (error) {
    console.error(`Error setting color for ${deviceName}:`, error);
    throw error;
  }
}

export async function setColorTemperature(
  deviceName: GoveeDeviceName,
  temperature: number
): Promise<void> {
  try {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(
        `Device ${deviceName} not found. Available devices: ${Object.keys(
          devices
        ).join(", ")}`
      );
    }

    const colorTempCap = device.capabilities.find(
      (cap) => cap.type === "colorTemperature" && cap.instance === "1"
    );

    if (
      colorTempCap?.parameters?.dataType === "INTEGER" &&
      colorTempCap.parameters.range
    ) {
      const { min, max } = colorTempCap.parameters.range;
      if (temperature < min || temperature > max) {
        throw new Error(
          `Color temperature must be between ${min}K and ${max}K for this device`
        );
      }
    }

    await client.setColorTemperature(device.device, device.sku, temperature);
    console.log(
      `Successfully set color temperature to ${temperature}K for ${deviceName}`
    );
  } catch (error) {
    console.error(`Error setting color temperature for ${deviceName}:`, error);
    throw error;
  }
}

export async function workMode(): Promise<void> {
  try {
    const workModeSettings = [
      { device: "deskBulb", colorTemp: 3800, brightness: 100 },
      { device: "ceiling1", colorTemp: 3800, brightness: 80 },
      { device: "ceiling2", colorTemp: 3800, brightness: 80 },
      { device: "cylinderFloorLamp", colorTemp: 3800, brightness: 80 },
    ] as const;

    for (const setting of workModeSettings) {
      const deviceName = setting.device as GoveeDeviceName;
      await turnOn(deviceName);
      await setBrightness(deviceName, setting.brightness);
      await setColorTemperature(deviceName, setting.colorTemp);
    }
    console.log("Work mode successfully activated for all devices");
  } catch (error) {
    console.error("Error activating work mode:", error);
    throw error;
  }
}

export function getDeviceCapabilities(deviceName: GoveeDeviceName) {
  try {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(
        `Device ${deviceName} not found. Available devices: ${Object.keys(
          devices
        ).join(", ")}`
      );
    }
    return device.capabilities.reduce(
      (acc: Record<string, { instance: string; parameters: unknown }>, cap) => {
        acc[`${cap.type}.${cap.instance}`] = {
          instance: cap.instance,
          parameters: cap.parameters,
        };
        return acc;
      },
      {}
    );
  } catch (error) {
    console.error(`Error getting capabilities for ${deviceName}:`, error);
    throw error;
  }
}

export async function getCurrentDeviceStates() {
  const states: Record<string, any> = {};
  
  for (const [deviceName, device] of Object.entries(devices)) {
    try {
      const state = await client.getDeviceState(device.device, device.sku);
      if (!state?.payload?.capabilities) {
        console.warn(`Invalid state response for ${deviceName}`);
        continue;
      }

      const capabilities = state.payload.capabilities;
      states[deviceName] = {
        power: capabilities.find(
          (cap: any) => cap.type === "devices.capabilities.on_off" && cap.instance === "powerSwitch"
        )?.state?.value === 1,
        brightness: capabilities.find(
          (cap: any) => cap.type === "devices.capabilities.range" && cap.instance === "brightness"
        )?.state?.value,
        colorTemp: capabilities.find(
          (cap: any) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorTemperatureK"
        )?.state?.value,
        color: capabilities.find(
          (cap: any) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorRgb"
        )?.state?.value
      };
    } catch (error) {
      console.error(`Error getting state for ${deviceName}:`, error);
    }
  }
  
  return states;
}

export async function saveCurrentStates() {
  try {
    const states = await getCurrentDeviceStates();
    await fs.promises.writeFile(
      'saved-states.json',
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
