import { config } from "dotenv";
import { GoveeClient } from "./client.js";
import { writeFile } from "fs/promises";
import { join } from "path";
import { GoveeDevice, DeviceStateResponse } from "./types.js";

config();

const API_KEY = process.env.GOVEE_API_KEY;

if (!API_KEY) {
  throw new Error("GOVEE_API_KEY environment variable is required");
}

const client = new GoveeClient(API_KEY);

async function saveDevices(devices: GoveeDevice[]) {
  const filePath = join(process.cwd(), "devices.json");
  await writeFile(filePath, JSON.stringify(devices, null, 2));
  console.log("Devices saved to devices.json");
}

function formatCapabilityState(state: DeviceStateResponse) {
  return state.payload.capabilities.reduce((acc, cap) => {
    acc[cap.type] = cap.state.value;
    return acc;
  }, {} as Record<string, unknown>);
}

async function identifyDevices() {
  try {
    const devices = await client.getDevices();
    console.log("Found devices:", devices.length);

    await saveDevices(devices);

    for (const device of devices) {
      console.log("\nDevice:", device.deviceName);
      console.log("SKU:", device.sku);
      console.log("Device ID:", device.device);
      
      console.log("\nCapabilities:");
      device.capabilities.forEach(cap => {
        console.log(`- ${cap.type}:`);
        if (cap.parameters.dataType === "ENUM") {
          console.log("  Options:", cap.parameters.options?.map(opt => `${opt.name} (${opt.value})`).join(", "));
        } else if (cap.parameters.dataType === "INTEGER") {
          console.log(`  Range: ${cap.parameters.range?.min} to ${cap.parameters.range?.max} (precision: ${cap.parameters.range?.precision})`);
          if (cap.parameters.unit) {
            console.log(`  Unit: ${cap.parameters.unit}`);
          }
        }
      });

      const state = await client.getDeviceState(device.device, device.sku);
      console.log("\nCurrent state:", formatCapabilityState(state));
    }
  } catch (error) {
    console.error("Error identifying devices:", error);
    if (error instanceof Error) {
      console.error("- Message:", error.message);
      console.error("- Stack:", error.stack);
    } else {
      console.error("- Unknown error:", error);
    }
  }
}

// Run identification if this file is executed directly
if (process.argv[1] === import.meta.url) {
  identifyDevices();
} 