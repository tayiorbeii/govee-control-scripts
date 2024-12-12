import { GoveeDevice, DeviceCapability } from "../types";
import {
  MIN_COLOR_TEMP,
  MAX_COLOR_TEMP,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
} from "../utils/constants.js";

// Common capability configurations
const powerSwitchCapability: DeviceCapability = {
  type: "powerSwitch",
  instance: "1",
  parameters: {
    dataType: "ENUM",
    options: [
      { name: "on", value: true },
      { name: "off", value: false },
    ],
  },
};

const brightnessCapability: DeviceCapability = {
  type: "brightness",
  instance: "1",
  parameters: {
    dataType: "INTEGER",
    range: {
      min: MIN_BRIGHTNESS,
      max: MAX_BRIGHTNESS,
      precision: 1,
    },
  },
};

const colorRgbCapability: DeviceCapability = {
  type: "colorRgb",
  instance: "1",
  parameters: {
    dataType: "INTEGER",
    range: {
      min: 0,
      max: 16777215, // 0xFFFFFF in decimal
      precision: 1,
    },
  },
};

// Device definitions
export const rgbicFloorLamp: GoveeDevice = {
  sku: "H6072",
  device: "47:0F:C7:33:36:31:67:51",
  deviceName: "RGBICWW Floor Lamp",
  capabilities: [
    powerSwitchCapability,
    brightnessCapability,
    {
      type: "colorTemperature",
      instance: "1",
      parameters: {
        dataType: "INTEGER",
        range: {
          min: MIN_COLOR_TEMP,
          max: MAX_COLOR_TEMP,
          precision: 100,
        },
        unit: "kelvin",
      },
    },
  ],
};

export const cylinderFloorLamp: GoveeDevice = {
  sku: "H6078",
  device: "10:32:D3:21:C5:C6:7A:63",
  deviceName: "Cylinder Floor Lamp",
  capabilities: [
    powerSwitchCapability,
    brightnessCapability,
    {
      type: "colorTemperature",
      instance: "1",
      parameters: {
        dataType: "INTEGER",
        range: {
          min: 2200,
          max: 6500,
          precision: 100,
        },
        unit: "kelvin",
      },
    },
  ],
};

const rgbBulbCapabilities: DeviceCapability[] = [
  powerSwitchCapability,
  brightnessCapability,
  {
    type: "colorTemperature",
    instance: "1",
    parameters: {
      dataType: "INTEGER",
      range: {
        min: 2700,
        max: 6500,
        precision: 100,
      },
      unit: "kelvin",
    },
  },
  colorRgbCapability,
];

export const deskBulb: GoveeDevice = {
  sku: "H6008",
  device: "DA:CA:D0:C9:07:E5:7D:1C",
  deviceName: "Desk Bulb",
  capabilities: rgbBulbCapabilities,
};

export const ceiling1: GoveeDevice = {
  sku: "H6008",
  device: "5B:E7:D0:C9:07:D5:B6:D2",
  deviceName: "Ceiling 1",
  capabilities: rgbBulbCapabilities,
};

export const ceiling2: GoveeDevice = {
  sku: "H6008",
  device: "F2:17:D0:C9:07:D6:00:92",
  deviceName: "Ceiling 2",
  capabilities: rgbBulbCapabilities,
};

// Device collection for easy access
export const devices: Record<string, GoveeDevice> = {
  rgbicFloorLamp,
  cylinderFloorLamp,
  deskBulb,
  ceiling1,
  ceiling2,
};

// Validation function to ensure device configurations are correct
export function validateDevice(device: GoveeDevice): void {
  if (!device.sku || !device.device || !device.deviceName) {
    throw new Error(
      `Device ${device.deviceName || "unknown"} is missing required fields`
    );
  }

  if (!device.capabilities || device.capabilities.length === 0) {
    throw new Error(`Device ${device.deviceName} has no capabilities`);
  }

  device.capabilities.forEach((capability) => {
    if (!capability.type || !capability.instance) {
      throw new Error(
        `Device ${device.deviceName} has invalid capability configuration`
      );
    }
  });
}

// Validate all devices on import
Object.values(devices).forEach(validateDevice);
