import { config } from "dotenv";
import { DeviceStateResponse } from "./types.js";
import { GoveeClient } from "./client.js";
import { devices } from "./devices.js";
import "./cli.js";  // Import the CLI module

config();

const API_KEY = process.env.GOVEE_API_KEY;

if (!API_KEY) {
  throw new Error("GOVEE_API_KEY environment variable is required");
}

export const client = new GoveeClient(API_KEY);

export function formatDeviceState(state: any) {
  if (!state?.payload?.capabilities) {
    throw new Error("Invalid device state response");
  }

  const capabilities = state.payload.capabilities;
  
  const powerState = capabilities.find(
    (cap: any) => cap.type === "devices.capabilities.on_off" && cap.instance === "powerSwitch"
  );
  const brightness = capabilities.find(
    (cap: any) => cap.type === "devices.capabilities.range" && cap.instance === "brightness"
  );
  const colorTemp = capabilities.find(
    (cap: any) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorTemperatureK"
  );
  const color = capabilities.find(
    (cap: any) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorRgb"
  );
  const online = capabilities.find(
    (cap: any) => cap.type === "devices.capabilities.online" && cap.instance === "online"
  );

  return {
    power: powerState?.state?.value === 1,
    brightness: brightness?.state?.value,
    colorTemp: colorTemp?.state?.value,
    color: color?.state?.value,
    online: online?.state?.value ?? false,
  };
}

export async function getDeviceState(deviceName: string) {
  const device = devices[deviceName];
  if (!device) {
    throw new Error(
      `Device ${deviceName} not found. Available devices: ${Object.keys(
        devices
      ).join(", ")}`
    );
  }
  console.log(
    `Getting state for device: ${deviceName} (${device.device}, ${device.sku})`
  );
  const state = await client.getDeviceState(device.device, device.sku);
  return formatDeviceState(state);
}
