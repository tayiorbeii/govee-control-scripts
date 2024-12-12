import { config } from "dotenv";
import { GoveeClient } from "./client.js";
import { writeFile } from "fs/promises";
import { join } from "path";
import { GoveeDevice, DeviceStateResponse } from "./types.js";
import { devices } from "./devices.js";

config();

const API_KEY = process.env.GOVEE_API_KEY;

if (!API_KEY) {
  throw new Error("GOVEE_API_KEY environment variable is required");
}

const client = new GoveeClient(API_KEY);

async function saveDevices(devices: GoveeDevice[]) {
  const filePath = join(process.cwd(), "src", "config", "devices.json");
  await writeFile(filePath, JSON.stringify(devices, null, 2));
  console.log("Devices saved to src/config/devices.json");
}

function formatDeviceState(state: DeviceStateResponse) {
  const capabilities = state.payload.capabilities;

  const powerState = capabilities.find(
    (cap) =>
      cap.type === "devices.capabilities.on_off" &&
      cap.instance === "powerSwitch"
  );
  const brightness = capabilities.find(
    (cap) =>
      cap.type === "devices.capabilities.range" && cap.instance === "brightness"
  );
  const colorTemp = capabilities.find(
    (cap) =>
      cap.type === "devices.capabilities.color_setting" &&
      cap.instance === "colorTemperatureK"
  );
  const color = capabilities.find(
    (cap) =>
      cap.type === "devices.capabilities.color_setting" &&
      cap.instance === "colorRgb"
  );

  return {
    power: powerState?.state?.value === 1,
    brightness: brightness?.state?.value,
    colorTemp: colorTemp?.state?.value,
    ...(color?.state?.value && {
      color: `#${color.state.value.toString(16).padStart(6, "0")}`,
    }),
  };
}

async function saveCurrentStates(deviceStates: Record<string, any>) {
  const filePath = join(process.cwd(), "src", "config", "saved-states.json");
  await writeFile(filePath, JSON.stringify(deviceStates, null, 2));
  console.log("Current states saved to saved-states.json");
}

async function identifyDevices() {
  try {
    const deviceList = await client.getDevices();
    console.log("Found devices:", deviceList.length);
    await saveDevices(deviceList);

    const deviceStates: Record<string, any> = {};

    for (const [deviceKey, device] of Object.entries(devices)) {
      console.log("\nDevice:", device.deviceName);
      console.log("SKU:", device.sku);
      console.log("Device ID:", device.device);

      const state = await client.getDeviceState(device.device, device.sku);
      const formattedState = formatDeviceState(state);
      deviceStates[deviceKey] = formattedState;
    }

    await saveCurrentStates(deviceStates);
  } catch (error) {
    console.error("Error identifying devices:", error);
    if (error instanceof Error) {
      console.error("- Message:", error.message);
      console.error("- Stack:", error.stack);
    } else {
      console.error("- Unknown error:", error);
    }
    process.exit(1);
  }
}

// Run identification if this file is executed directly
if (
  import.meta.url.endsWith(process.argv[1]) ||
  process.argv[1].endsWith("tsx")
) {
  console.log("Running in direct execution mode");
  identifyDevices().catch((error) => {
    console.error("Top level error:", error);
    process.exit(1);
  });
}

export { identifyDevices };
