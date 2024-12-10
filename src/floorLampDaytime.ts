import { config } from "dotenv";
import { GoveeClient } from "./client.js";
import { devices } from "./devices.js";

config();

const API_KEY = process.env.GOVEE_API_KEY;

if (!API_KEY) {
  throw new Error("GOVEE_API_KEY environment variable is required");
}

const client = new GoveeClient(API_KEY);

function formatDeviceState(state: any) {
  if (!state?.payload?.capabilities) {
    throw new Error("Invalid device state response");
  }

  const capabilities = state.payload.capabilities;

  const powerState = capabilities.find(
    (cap: any) =>
      cap.type === "devices.capabilities.on_off" &&
      cap.instance === "powerSwitch"
  );
  const brightness = capabilities.find(
    (cap: any) =>
      cap.type === "devices.capabilities.range" && cap.instance === "brightness"
  );
  const colorTemp = capabilities.find(
    (cap: any) =>
      cap.type === "devices.capabilities.color_setting" &&
      cap.instance === "colorTemperatureK"
  );
  const color = capabilities.find(
    (cap: any) =>
      cap.type === "devices.capabilities.color_setting" &&
      cap.instance === "colorRgb"
  );
  const online = capabilities.find(
    (cap: any) =>
      cap.type === "devices.capabilities.online" && cap.instance === "online"
  );

  return {
    power: powerState?.state?.value === 1,
    brightness: brightness?.state?.value,
    colorTemp: colorTemp?.state?.value,
    color: color?.state?.value,
    online: online?.state?.value ?? false,
  };
}

async function setDaytimeMode() {
  try {
    const deviceName = "cylinderFloorLamp";
    const device = devices[deviceName];

    if (!device) {
      throw new Error(`Device ${deviceName} not found`);
    }

    console.log(`Setting ${deviceName} to daytime mode...`);

    // Turn on the device
    await client.turnDevice(device.device, device.sku, true);

    // Set brightness
    await client.setBrightness(device.device, device.sku, 18);

    // Set color temperature
    await client.setColorTemperature(device.device, device.sku, 3800);

    console.log("Waiting 2 seconds for device to update...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify final state
    const state = await client.getDeviceState(device.device, device.sku);
    const formattedState = formatDeviceState(state);

    console.log("Current state:", formattedState);

    if (
      formattedState.power &&
      formattedState.brightness === 18 &&
      formattedState.colorTemp === 3800
    ) {
      console.log("Successfully set daytime mode");
    } else {
      console.log(
        "Warning: Some settings might not have been applied correctly"
      );
      console.log("Expected: power=true, brightness=18, colorTemp=3800");
      console.log("Actual:", formattedState);
    }
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

await setDaytimeMode();

export { setDaytimeMode };
