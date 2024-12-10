import { GoveeDevice } from "./types.js";
import { GoveeClient } from "./client.js";
import { config } from "dotenv";
import { devices } from "./devices.js";

config();

const API_KEY = process.env.GOVEE_API_KEY;

if (!API_KEY) {
  throw new Error("GOVEE_API_KEY environment variable is required");
}

const client = new GoveeClient(API_KEY);

type GoveeDeviceName = keyof typeof devices;

export async function turnOff(deviceName: GoveeDeviceName): Promise<void> {
  const device = devices[deviceName];
  await client.turnDevice(device.device, device.sku, false);
}

export async function turnOn(deviceName: GoveeDeviceName): Promise<void> {
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
  try {
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
  const device = devices[deviceName];
  await client.setBrightness(device.device, device.sku, brightness);
}

export async function setColor(
  deviceName: GoveeDeviceName,
  r: number,
  g: number,
  b: number
): Promise<void> {
  const device = devices[deviceName];
  await client.setColor(device.device, device.sku, r, g, b);
}

export async function setColorTemperature(
  deviceName: GoveeDeviceName,
  temperature: number
): Promise<void> {
  const device = devices[deviceName];
  const colorTempCap = device.capabilities.find(
    (cap) => 
      cap.type === "devices.capabilities.color_setting" && 
      cap.instance === "colorTemperatureK"
  );

  if (colorTempCap?.parameters?.dataType === "INTEGER" && colorTempCap.parameters.range) {
    const { min, max } = colorTempCap.parameters.range;
    if (temperature < min || temperature > max) {
      throw new Error(
        `Color temperature must be between ${min}K and ${max}K for this device`
      );
    }
  }

  await client.setColorTemperature(device.device, device.sku, temperature);
}

export async function workMode(): Promise<void> {
  const workModeSettings = [
    { device: "Desk Bulb", colorTemp: 5000, brightness: 100 },
    { device: "Ceiling 1", colorTemp: 4500, brightness: 80 },
    { device: "Ceiling 2", colorTemp: 4500, brightness: 80 },
  ] as const;

  for (const setting of workModeSettings) {
    const deviceName = setting.device as GoveeDeviceName;
    await turnOn(deviceName);
    await setBrightness(deviceName, setting.brightness);
    await setColorTemperature(deviceName, setting.colorTemp);
  }
}

// Utility function to get device capabilities
export function getDeviceCapabilities(deviceName: GoveeDeviceName) {
  const device = devices[deviceName];
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
}
