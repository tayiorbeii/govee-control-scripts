# govee-control-scripts

CLI tool for controlling Govee devices.

## Project Structure

```
src/
├── cli/              # CLI-related code
│   ├── commands/     # Individual CLI commands
│   └── index.ts      # CLI entry point
├── config/           # Configuration files
├── services/         # Core services
│   ├── GoveeApiService.ts
│   ├── GoveeControlService.ts
│   └── ColorService.ts
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and constants
└── index.ts         # Main entry point
```

## Installation

To install the package globally:

```bash
npm install -g .
```

This will make the `govee` command available system-wide.

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Build the project
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

## Configuration

Create a `.env` file in your project root with your Govee API key:

```
GOVEE_API_KEY=your_api_key_here
```

### Setting Up Your Devices

1. First, identify your devices by running:
```bash
govee identify
```

This will:
- Query your Govee account for all available devices
- Save the device list to `src/config/devices.json`
- Save current device states to `src/config/saved-states.json`

2. Update `src/config/devices.ts` with your device configurations:
```typescript
export const devices = {
  "livingRoomLamp": {  // This is your custom device name
    device: "XX:XX:XX:XX:XX:XX:XX:XX",  // From devices.json
    deviceName: "Living Room Lamp",      // Your friendly name
    sku: "H6159",                        // From devices.json
  },
  // Add more devices as needed
};
```

## Usage

Once installed, you can run the following commands from any directory:

```bash
# List devices
govee list

# Start interactive mode
govee interactive

# Turn devices on/off
govee on <device-name>
govee off <device-name>

# Set brightness (0-100)
govee brightness <device-name> <level>

# Set color temperature (2000-9000K)
govee temperature <device-name> <temp>

# Set color (hex)
govee color <device-name> <hex-color>

# Save current states of all devices
govee save
```

Device names and their configurations are stored in `src/config/devices.json`. Preset configurations can be found in `src/config/presets.json`.
