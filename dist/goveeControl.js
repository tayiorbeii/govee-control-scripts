import { GoveeClient } from "./client.js";
import { config } from "dotenv";
import { devices } from "./devices.js";
import { colorManager } from "./colorManager.js";
import * as fs from 'fs';
import * as path from 'path';
config();
const API_KEY = process.env.GOVEE_API_KEY;
if (!API_KEY) {
    throw new Error("GOVEE_API_KEY environment variable is required");
}
const client = new GoveeClient(API_KEY);
export async function turnOff(deviceName) {
    try {
        const device = devices[deviceName];
        if (!device) {
            throw new Error(`Device ${deviceName} not found. Available devices: ${Object.keys(devices).join(", ")}`);
        }
        await client.turnDevice(device.device, device.sku, false);
        console.log(`Successfully turned off ${deviceName}`);
    }
    catch (error) {
        console.error(`Error turning off ${deviceName}:`, error);
        throw error;
    }
}
export async function turnOn(deviceName) {
    try {
        const device = devices[deviceName];
        if (!device) {
            throw new Error(`Device ${deviceName} not found. Available devices: ${Object.keys(devices).join(", ")}`);
        }
        console.log(`Turning on device: ${deviceName} (${device.device}, ${device.sku})`);
        await client.turnDevice(device.device, device.sku, true);
        console.log(`Successfully sent turn on command to ${deviceName}`);
    }
    catch (error) {
        console.error(`Error turning on ${deviceName}:`, error);
        throw error;
    }
}
export async function setBrightness(deviceName, brightness) {
    try {
        const device = devices[deviceName];
        if (!device) {
            throw new Error(`Device ${deviceName} not found. Available devices: ${Object.keys(devices).join(", ")}`);
        }
        await client.setBrightness(device.device, device.sku, brightness);
        console.log(`Successfully set brightness to ${brightness} for ${deviceName}`);
    }
    catch (error) {
        console.error(`Error setting brightness for ${deviceName}:`, error);
        throw error;
    }
}
export async function setColor(deviceName, color) {
    try {
        const device = devices[deviceName];
        if (!device) {
            throw new Error(`Device ${deviceName} not found. Available devices: ${Object.keys(devices).join(", ")}`);
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
        console.log(`Successfully set ${deviceName} color to ${color} (R:${r} G:${g} B:${b})`);
    }
    catch (error) {
        console.error(`Error setting color for ${deviceName}:`, error);
        throw error;
    }
}
export async function setColorTemperature(deviceName, temperature) {
    try {
        const device = devices[deviceName];
        if (!device) {
            throw new Error(`Device ${deviceName} not found. Available devices: ${Object.keys(devices).join(", ")}`);
        }
        const colorTempCap = device.capabilities.find((cap) => cap.type === "colorTemperature" && cap.instance === "1");
        if (colorTempCap?.parameters?.dataType === "INTEGER" &&
            colorTempCap.parameters.range) {
            const { min, max } = colorTempCap.parameters.range;
            if (temperature < min || temperature > max) {
                throw new Error(`Color temperature must be between ${min}K and ${max}K for this device`);
            }
        }
        await client.setColorTemperature(device.device, device.sku, temperature);
        console.log(`Successfully set color temperature to ${temperature}K for ${deviceName}`);
    }
    catch (error) {
        console.error(`Error setting color temperature for ${deviceName}:`, error);
        throw error;
    }
}
export async function workMode() {
    try {
        const workModeSettings = [
            { device: "deskBulb", colorTemp: 3800, brightness: 100 },
            { device: "ceiling1", colorTemp: 3800, brightness: 80 },
            { device: "ceiling2", colorTemp: 3800, brightness: 80 },
            { device: "cylinderFloorLamp", colorTemp: 3800, brightness: 80 },
        ];
        for (const setting of workModeSettings) {
            const deviceName = setting.device;
            await turnOn(deviceName);
            await setBrightness(deviceName, setting.brightness);
            await setColorTemperature(deviceName, setting.colorTemp);
        }
        console.log("Work mode successfully activated for all devices");
    }
    catch (error) {
        console.error("Error activating work mode:", error);
        throw error;
    }
}
export function getDeviceCapabilities(deviceName) {
    try {
        const device = devices[deviceName];
        if (!device) {
            throw new Error(`Device ${deviceName} not found. Available devices: ${Object.keys(devices).join(", ")}`);
        }
        return device.capabilities.reduce((acc, cap) => {
            acc[`${cap.type}.${cap.instance}`] = {
                instance: cap.instance,
                parameters: cap.parameters,
            };
            return acc;
        }, {});
    }
    catch (error) {
        console.error(`Error getting capabilities for ${deviceName}:`, error);
        throw error;
    }
}
export async function getCurrentDeviceStates() {
    console.log("Getting current states for all devices...");
    const states = {};
    for (const [deviceName, device] of Object.entries(devices)) {
        try {
            console.log(`\nGetting state for ${deviceName}...`);
            const state = await client.getDeviceState(device.device, device.sku);
            if (!state?.payload?.capabilities) {
                console.warn(`Invalid state response for ${deviceName}`);
                continue;
            }
            const capabilities = state.payload.capabilities;
            console.log(`Raw capabilities for ${deviceName}:`, JSON.stringify(capabilities, null, 2));
            const powerCap = capabilities.find((cap) => cap.type === "devices.capabilities.on_off" && cap.instance === "powerSwitch");
            const brightnessCap = capabilities.find((cap) => cap.type === "devices.capabilities.range" && cap.instance === "brightness");
            const colorTempCap = capabilities.find((cap) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorTemperatureK");
            const colorCap = capabilities.find((cap) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorRgb");
            console.log(`Found capabilities for ${deviceName}:`, {
                power: powerCap?.state?.value,
                brightness: brightnessCap?.state?.value,
                colorTemp: colorTempCap?.state?.value,
                color: colorCap?.state?.value
            });
            // Get the color value, defaulting to white (0xFFFFFF) if it's 0
            const colorValue = colorCap?.state?.value;
            const color = colorValue !== undefined ? (colorValue === 0 ? 0xFFFFFF : colorValue) : undefined;
            states[deviceName] = {
                power: powerCap?.state?.value === 1,
                brightness: brightnessCap?.state?.value,
                colorTemp: colorTempCap?.state?.value,
                ...(color !== undefined && { color: `#${color.toString(16).padStart(6, '0')}` })
            };
            console.log(`Formatted state for ${deviceName}:`, states[deviceName]);
        }
        catch (error) {
            console.error(`Error getting state for ${deviceName}:`, error);
        }
    }
    console.log("\nAll device states:", states);
    return states;
}
export async function saveCurrentStates() {
    try {
        const states = await Promise.all(Object.entries(devices).map(async ([name, device]) => {
            const state = await client.getDeviceState(device.device, device.sku);
            return { [name]: formatDeviceState(state) };
        }));
        const combinedStates = Object.assign({}, ...states);
        const savePath = path.join(process.cwd(), "src", "config", "saved-states.json");
        fs.writeFileSync(savePath, JSON.stringify(combinedStates, null, 2));
        console.log("Current states saved successfully");
    }
    catch (error) {
        console.error("Error saving states:", error);
        throw error;
    }
}
function formatDeviceState(state) {
    if (!state?.payload?.capabilities) {
        throw new Error("Invalid device state response");
    }
    const capabilities = state.payload.capabilities;
    const color = capabilities.find((cap) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorRgb")?.state?.value;
    return {
        power: capabilities.find((cap) => cap.type === "devices.capabilities.on_off" && cap.instance === "powerSwitch")?.state?.value === 1,
        brightness: capabilities.find((cap) => cap.type === "devices.capabilities.range" && cap.instance === "brightness")?.state?.value,
        colorTemp: capabilities.find((cap) => cap.type === "devices.capabilities.color_setting" && cap.instance === "colorTemperatureK")?.state?.value,
        color: color ? `#${color.toString(16).padStart(6, '0')}` : undefined
    };
}
