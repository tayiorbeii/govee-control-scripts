export class GoveeClient {
    apiKey;
    baseUrl = "https://openapi.api.govee.com";
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async request(endpoint, options = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                "Govee-API-Key": this.apiKey,
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
        }
        const data = (await response.json());
        return data;
    }
    async getDevices() {
        try {
            const response = await this.request("/router/api/v1/user/devices");
            return response.data;
        }
        catch (error) {
            console.error("Error fetching devices:", error);
            throw error;
        }
    }
    async getDeviceState(device, model) {
        try {
            const response = await this.request("/router/api/v1/device/state", {
                method: "POST",
                body: JSON.stringify({
                    requestId: crypto.randomUUID(),
                    payload: {
                        device,
                        sku: model,
                    },
                }),
            });
            return response;
        }
        catch (error) {
            console.error("Error getting device state:", error);
            throw error;
        }
    }
    async controlDevice(device, sku, command) {
        try {
            const response = await this.request("/router/api/v1/device/control", {
                method: "POST",
                body: JSON.stringify({
                    requestId: crypto.randomUUID(),
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
            });
            if (response.code !== 200) {
                console.log("API Response:", JSON.stringify(response, null, 2));
                throw new Error(`Failed to control device: ${response.message || JSON.stringify(response)}`);
            }
        }
        catch (error) {
            console.error("Error controlling device:", error);
            throw error;
        }
    }
    // Helper methods with correct capability types
    async turnDevice(device, sku, power) {
        return this.controlDevice(device, sku, {
            type: "devices.capabilities.on_off",
            instance: "powerSwitch",
            value: power ? 1 : 0,
        });
    }
    async setBrightness(device, sku, brightness) {
        if (brightness < 1 || brightness > 100) {
            throw new Error("Brightness must be between 1 and 100");
        }
        return this.controlDevice(device, sku, {
            type: "devices.capabilities.range",
            instance: "brightness",
            value: brightness,
        });
    }
    async setColor(device, sku, color) {
        // Convert RGB to a single number value as expected by the API
        const colorValue = (color.r << 16) | (color.g << 8) | color.b;
        await this.controlDevice(device, sku, {
            type: "devices.capabilities.color_setting",
            instance: "colorRgb",
            value: colorValue,
        });
    }
    async setColorTemperature(device, sku, temperature) {
        return this.controlDevice(device, sku, {
            type: "devices.capabilities.color_setting",
            instance: "colorTemperatureK",
            value: temperature,
        });
    }
}
