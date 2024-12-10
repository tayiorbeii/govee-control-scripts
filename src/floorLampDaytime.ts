import { config } from "dotenv";
import { GoveeClient } from "./client.js";
import { cylinderFloorLamp } from "./devices.js";

config();

const API_KEY = process.env.GOVEE_API_KEY;

if (!API_KEY) {
  throw new Error("GOVEE_API_KEY environment variable is required");
}

const client = new GoveeClient(API_KEY);

async function setDaytimeMode() {
  try {
    console.log("Setting Cylinder Floor Lamp to daytime mode...");

    // Turn on the device
    await client.turnDevice(
      cylinderFloorLamp.device,
      cylinderFloorLamp.sku,
      true
    );

    // Set brightness
    await client.setBrightness(
      cylinderFloorLamp.device,
      cylinderFloorLamp.sku,
      18
    );

    // Set color temperature
    await client.setColorTemperature(
      cylinderFloorLamp.device,
      cylinderFloorLamp.sku,
      3800
    );

    // Verify final state
    const stateResponse = await client.getDeviceState(
      cylinderFloorLamp.device,
      cylinderFloorLamp.sku
    );
    
    const powerState = stateResponse.payload.capabilities.find(
      cap => cap.type === "powerSwitch"
    );
    const brightness = stateResponse.payload.capabilities.find(
      cap => cap.type === "brightness"
    );
    const colorTemp = stateResponse.payload.capabilities.find(
      cap => cap.type === "colorTemperature"
    );

    if (
      powerState?.state.value === true &&
      brightness?.state.value === 18 &&
      colorTemp?.state.value === 3800
    ) {
      console.log("Successfully set daytime mode");
    } else {
      console.log("Warning: Some settings might not have been applied correctly");
      console.log("Expected: power=true, brightness=18, colorTemp=3800");
      console.log("Actual:", {
        power: powerState?.state.value,
        brightness: brightness?.state.value,
        colorTemp: colorTemp?.state.value,
      });
    }
  } catch (error) {
    console.error("Error setting daytime mode:", error);
    if (error instanceof Error) {
      console.error("- Message:", error.message);
      console.error("- Stack:", error.stack);
    } else {
      console.error("- Unknown error:", error);
    }
  }
}

export { setDaytimeMode };
