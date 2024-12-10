import { config } from "dotenv";
import { DeviceStateResponse } from "./types.js";
import { GoveeClient } from "./client.js";
import { turnOn, turnOff } from "./goveeControl.js";
import { devices } from "./devices.js";

config();

const API_KEY = process.env.GOVEE_API_KEY;

if (!API_KEY) {
  throw new Error("GOVEE_API_KEY environment variable is required");
}

const client = new GoveeClient(API_KEY);

function formatDeviceState(state: DeviceStateResponse) {
  const powerState = state.payload.capabilities.find(
    (cap) => cap.type === "devices.capabilities.on_off" && cap.instance === "powerSwitch"
  );
  const brightness = state.payload.capabilities.find(
    (cap) => cap.type === "devices.capabilities.range" && cap.instance === "brightness"
  );
  const colorTemp = state.payload.capabilities.find(
    (cap) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorTemperatureK"
  );
  const color = state.payload.capabilities.find(
    (cap) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorRgb"
  );

  return {
    power: powerState?.state.value === 1,
    brightness: brightness?.state.value,
    colorTemp: colorTemp?.state.value,
    color: color?.state.value,
    online: state.payload.capabilities.find(
      (cap) => cap.type === "devices.capabilities.online"
    )?.state.value,
  };
}

async function getDeviceState(deviceName: string) {
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

async function main() {
  try {
    console.log("Available devices:", Object.keys(devices));
    console.log("Attempting to turn on cylinderFloorLamp...");

    await turnOn("cylinderFloorLamp");
    console.log("Turn on command sent successfully");

    console.log("Waiting 2 seconds for device to update...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Getting device state...");
    const state = await getDeviceState("cylinderFloorLamp");
    console.log("Current state:", state);
  } catch (error) {
    console.error("Error occurred:");
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}

main();
