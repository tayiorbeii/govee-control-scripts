// Device definitions
export const rgbicFloorLamp = {
    sku: "H6072",
    device: "47:0F:C7:33:36:31:67:51",
    deviceName: "RGBICWW Floor Lamp",
    capabilities: [
        {
            type: "powerSwitch",
            instance: "1",
            parameters: {
                dataType: "ENUM",
                options: [
                    { name: "on", value: true },
                    { name: "off", value: false }
                ]
            }
        },
        {
            type: "brightness",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 0,
                    max: 100,
                    precision: 1
                }
            }
        },
        {
            type: "colorTemperature",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 2000,
                    max: 9000,
                    precision: 100
                },
                unit: "kelvin"
            }
        }
    ]
};
export const cylinderFloorLamp = {
    sku: "H6078",
    device: "10:32:D3:21:C5:C6:7A:63",
    deviceName: "Cylinder Floor Lamp",
    capabilities: [
        {
            type: "powerSwitch",
            instance: "1",
            parameters: {
                dataType: "ENUM",
                options: [
                    { name: "on", value: true },
                    { name: "off", value: false }
                ]
            }
        },
        {
            type: "brightness",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 0,
                    max: 100,
                    precision: 1
                }
            }
        },
        {
            type: "colorTemperature",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 2200,
                    max: 6500,
                    precision: 100
                },
                unit: "kelvin"
            }
        }
    ]
};
export const deskBulb = {
    sku: "H6008",
    device: "DA:CA:D0:C9:07:E5:7D:1C",
    deviceName: "Desk Bulb",
    capabilities: [
        {
            type: "powerSwitch",
            instance: "1",
            parameters: {
                dataType: "ENUM",
                options: [
                    { name: "on", value: true },
                    { name: "off", value: false }
                ]
            }
        },
        {
            type: "brightness",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 0,
                    max: 100,
                    precision: 1
                }
            }
        },
        {
            type: "colorTemperature",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 2700,
                    max: 6500,
                    precision: 100
                },
                unit: "kelvin"
            }
        },
        {
            type: "colorRgb",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 0,
                    max: 16777215,
                    precision: 1
                }
            }
        }
    ]
};
export const ceiling1 = {
    sku: "H6008",
    device: "5B:E7:D0:C9:07:D5:B6:D2",
    deviceName: "Ceiling 1",
    capabilities: [
        {
            type: "powerSwitch",
            instance: "1",
            parameters: {
                dataType: "ENUM",
                options: [
                    { name: "on", value: true },
                    { name: "off", value: false }
                ]
            }
        },
        {
            type: "brightness",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 0,
                    max: 100,
                    precision: 1
                }
            }
        },
        {
            type: "colorTemperature",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 2700,
                    max: 6500,
                    precision: 100
                },
                unit: "kelvin"
            }
        },
        {
            type: "colorRgb",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 0,
                    max: 16777215,
                    precision: 1
                }
            }
        }
    ]
};
export const ceiling2 = {
    sku: "H6008",
    device: "F2:17:D0:C9:07:D6:00:92",
    deviceName: "Ceiling 2",
    capabilities: [
        {
            type: "powerSwitch",
            instance: "1",
            parameters: {
                dataType: "ENUM",
                options: [
                    { name: "on", value: true },
                    { name: "off", value: false }
                ]
            }
        },
        {
            type: "brightness",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 0,
                    max: 100,
                    precision: 1
                }
            }
        },
        {
            type: "colorTemperature",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 2700,
                    max: 6500,
                    precision: 100
                },
                unit: "kelvin"
            }
        },
        {
            type: "colorRgb",
            instance: "1",
            parameters: {
                dataType: "INTEGER",
                range: {
                    min: 0,
                    max: 16777215,
                    precision: 1
                }
            }
        }
    ]
};
// Device collection for easy access
export const devices = {
    rgbicFloorLamp,
    cylinderFloorLamp,
    deskBulb,
    ceiling1,
    ceiling2
};
