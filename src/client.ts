import {
  GoveeDevice,
  GoveeResponse,
  DeviceStateResponse,
  CommandRequest,
} from "./types.js";

export class GoveeClient {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openapi.api.govee.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Govee-API-Key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
    }

    const data = (await response.json()) as T;
    return data;
  }

  async getDevices(): Promise<GoveeDevice[]> {
    try {
      const response = await this.request<GoveeResponse>(
        "/v2/devices"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching devices:", error);
      throw error;
    }
  }

  async getDeviceState(
    device: string,
    sku: string
  ): Promise<DeviceStateResponse> {
    try {
      const response = await this.request<DeviceStateResponse>(
        `/v2/devices/state`,
        {
          method: "GET",
          headers: {
            device,
            model: sku,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error getting device state:", error);
      throw error;
    }
  }

  async controlDevice(
    device: string,
    sku: string,
    command: {
      type: string;
      instance: string;
      value: number | boolean | string | object;
    }
  ): Promise<void> {
    try {
      interface ControlResponse {
        code: number;
        message: string;
        requestId: string;
      }

      const response = await this.request<ControlResponse>(
        "/router/api/v1/device/control",
        {
          method: "POST",
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            payload: {
              sku,
              device,
              capability: {
                type: command.type,
                instance: command.instance,
                value: command.value
              }
            }
          }),
        }
      );

      if (response.code !== 200) {
        throw new Error(`Failed to control device: ${response.message}`);
      }
    } catch (error) {
      console.error("Error controlling device:", error);
      throw error;
    }
  }

  // Helper methods
  async turnDevice(device: string, sku: string, power: boolean): Promise<void> {
    return this.controlDevice(device, sku, {
      type: "devices.capabilities.on_off",
      instance: "powerSwitch",
      value: power ? 1 : 0,
    });
  }

  async setBrightness(
    device: string,
    sku: string,
    brightness: number
  ): Promise<void> {
    if (brightness < 1 || brightness > 100) {
      throw new Error("Brightness must be between 1 and 100");
    }
    return this.controlDevice(device, sku, {
      type: "devices.capabilities.range",
      instance: "brightness",
      value: brightness,
    });
  }

  async setColor(
    device: string,
    sku: string,
    r: number,
    g: number,
    b: number
  ): Promise<void> {
    if ([r, g, b].some((v) => v < 0 || v > 255)) {
      throw new Error("RGB values must be between 0 and 255");
    }
    const rgb = (r << 16) | (g << 8) | b;
    return this.controlDevice(device, sku, {
      type: "devices.capabilities.color_setting",
      instance: "colorRgb",
      value: rgb,
    });
  }

  async setColorTemperature(
    device: string,
    sku: string,
    temperature: number
  ): Promise<void> {
    return this.controlDevice(device, sku, {
      type: "devices.capabilities.color_setting",
      instance: "colorTemperatureK",
      value: temperature,
    });
  }
}
