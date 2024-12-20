import { config } from 'dotenv';
import type { GoveeDevice, DeviceStateResponse, CommandResponse } from '../types';
import { randomUUID } from 'crypto';

config();

interface GoveeResponse {
  code: number;
  message: string;
  data: GoveeDevice[];
}

export class GoveeApiService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://openapi.api.govee.com';

  constructor() {
    const apiKey = process.env.GOVEE_API_KEY;
    if (!apiKey) {
      throw new Error('GOVEE_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Govee-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`
      );
    }

    return response.json() as Promise<T>;
  }

  async getDevices(): Promise<GoveeDevice[]> {
    try {
      const response = await this.request<GoveeResponse>(
        '/router/api/v1/user/devices'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  }

  async getDeviceState(device: string, model: string): Promise<DeviceStateResponse> {
    try {
      return await this.request<DeviceStateResponse>(
        '/router/api/v1/device/state',
        {
          method: 'POST',
          body: JSON.stringify({
            requestId: randomUUID(),
            payload: {
              device,
              sku: model,
            },
          }),
        }
      );
    } catch (error) {
      console.error('Error getting device state:', error);
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
      const response = await this.request<CommandResponse>(
        '/router/api/v1/device/control',
        {
          method: 'POST',
          body: JSON.stringify({
            requestId: randomUUID(),
            payload: {
              sku,
              device,
              capability: {
                type: command.type,
                instance: command.instance,
                value: command.value,
              },
            },
          }),
        }
      );

      if (response.code !== 200) {
        console.log('API Response:', JSON.stringify(response, null, 2));
        throw new Error(
          `Failed to control device: ${response.message || JSON.stringify(response)}`
        );
      }
    } catch (error) {
      console.error('Error controlling device:', error);
      throw error;
    }
  }

  // Helper methods with correct capability types
  async turnDevice(device: string, sku: string, power: boolean): Promise<void> {
    return this.controlDevice(device, sku, {
      type: 'devices.capabilities.on_off',
      instance: 'powerSwitch',
      value: power ? 1 : 0,
    });
  }

  async setBrightness(device: string, sku: string, brightness: number): Promise<void> {
    if (brightness < 1 || brightness > 100) {
      throw new Error('Brightness must be between 1 and 100');
    }
    return this.controlDevice(device, sku, {
      type: 'devices.capabilities.range',
      instance: 'brightness',
      value: brightness,
    });
  }

  async setColor(
    device: string,
    sku: string,
    color: { r: number; g: number; b: number }
  ): Promise<void> {
    // Convert RGB to a single number value as expected by the API
    const colorValue = (color.r << 16) | (color.g << 8) | color.b;

    await this.controlDevice(device, sku, {
      type: 'devices.capabilities.color_setting',
      instance: 'colorRgb',
      value: colorValue,
    });
  }

  async setColorTemperature(
    device: string,
    sku: string,
    temperature: number
  ): Promise<void> {
    return this.controlDevice(device, sku, {
      type: 'devices.capabilities.color_setting',
      instance: 'colorTemperatureK',
      value: temperature,
    });
  }
}
