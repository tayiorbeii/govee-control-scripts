export interface GoveeResponse {
  code: number;
  message: string;
  data: GoveeDevice[];
}

export interface DeviceStateResponse {
  code: number;
  message: string;
  payload: {
    capabilities: Array<{
      type: string;
      instance: string;
      state: {
        value: any;
      };
    }>;
  };
}

export interface CommandRequest {
  requestId: string;
  payload: {
    device: string;
    sku: string;
    capability: string;
    instance: string;
    value: number | boolean | string | object;
  };
}

export interface GoveeDevice {
  device: string;
  sku: string;
  deviceName: string;
  capabilities: Array<{
    type: string;
    instance: string;
    parameters: {
      dataType: "INTEGER" | "ENUM" | "STRING";
      range?: {
        min: number;
        max: number;
        precision: number;
      };
      unit?: string;
      options?: Array<{
        name: string;
        value: number | string | boolean;
      }>;
    };
  }>;
}

export const myDevices: Record<string, GoveeDevice> = {
  "RGBICWW Floor Lamp": {
    device: "47:0F:C7:33:36:31:67:51",
    sku: "H6072",
    deviceName: "RGBICWW Floor Lamp",
    capabilities: [
      {
        type: "powerSwitch",
        instance: "1",
        parameters: {
          dataType: "ENUM",
          options: [
            { name: "on", value: true },
            { name: "off", value: false },
          ],
        },
      },
      {
        type: "brightness",
        instance: "1",
        parameters: {
          dataType: "INTEGER",
          range: {
            min: 0,
            max: 100,
            precision: 1,
          },
        },
      },
      {
        type: "colorTemperature",
        instance: "1",
        parameters: {
          dataType: "INTEGER",
          range: {
            min: 2000,
            max: 9000,
            precision: 100,
          },
          unit: "kelvin",
        },
      },
    ],
  },
  "Cylinder Floor Lamp": {
    device: "10:32:D3:21:C5:C6:7A:63",
    sku: "H6078",
    deviceName: "Cylinder Floor Lamp",
    capabilities: [
      {
        type: "powerSwitch",
        instance: "1",
        parameters: {
          dataType: "ENUM",
          options: [
            { name: "on", value: true },
            { name: "off", value: false },
          ],
        },
      },
      {
        type: "brightness",
        instance: "1",
        parameters: {
          dataType: "INTEGER",
          range: {
            min: 0,
            max: 100,
            precision: 1,
          },
        },
      },
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
  },
  "Desk Bulb": {
    device: "DA:CA:D0:C9:07:E5:7D:1C",
    sku: "H6008",
    deviceName: "Desk Bulb",
    capabilities: [
      {
        type: "powerSwitch",
        instance: "1",
        parameters: {
          dataType: "ENUM",
          options: [
            { name: "on", value: true },
            { name: "off", value: false },
          ],
        },
      },
      {
        type: "brightness",
        instance: "1",
        parameters: {
          dataType: "INTEGER",
          range: {
            min: 0,
            max: 100,
            precision: 1,
          },
        },
      },
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
    ],
  },
  "Ceiling 1": {
    device: "5B:E7:D0:C9:07:D5:B6:D2",
    sku: "H6008",
    deviceName: "Ceiling 1",
    capabilities: [
      {
        type: "powerSwitch",
        instance: "1",
        parameters: {
          dataType: "ENUM",
          options: [
            { name: "on", value: true },
            { name: "off", value: false },
          ],
        },
      },
      {
        type: "brightness",
        instance: "1",
        parameters: {
          dataType: "INTEGER",
          range: {
            min: 0,
            max: 100,
            precision: 1,
          },
        },
      },
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
    ],
  },
  "Ceiling 2": {
    device: "F2:17:D0:C9:07:D6:00:92",
    sku: "H6008",
    deviceName: "Ceiling 2",
    capabilities: [
      {
        type: "powerSwitch",
        instance: "1",
        parameters: {
          dataType: "ENUM",
          options: [
            { name: "on", value: true },
            { name: "off", value: false },
          ],
        },
      },
      {
        type: "brightness",
        instance: "1",
        parameters: {
          dataType: "INTEGER",
          range: {
            min: 0,
            max: 100,
            precision: 1,
          },
        },
      },
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
    ],
  },
};
