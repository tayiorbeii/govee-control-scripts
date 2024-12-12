# govee-control-scripts

CLI tool for controlling Govee devices.

## Project Structure

```
.
├── src/             # Source code
│   ├── cli/         # CLI-related code
│   │   └── commands/# Individual CLI commands
│   ├── config/      # Configuration files
│   ├── services/    # Core services
│   ├── types/       # TypeScript type definitions
│   ├── utils/       # Utility functions
│   └── index.ts     # Main entry point
├── dist/            # Compiled JavaScript output
├── colors.json      # Color presets configuration
├── package.json     # Project dependencies and scripts
└── tsconfig.json    # TypeScript configuration
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Install globally:
```bash
npm install -g .
```

This will make the `govee` command available system-wide.

## Configuration

1. Create a `.env` file in your project root and add your Govee API key:
```
GOVEE_API_KEY=your_api_key_here
```

2. Set up your devices:
```bash
govee identify
```

This will:
- Query your Govee account for all available devices
- Save the device list to `src/config/devices.json`
- Save current device states to `src/config/saved-states.json`

3. Update your device configurations in `src/config/devices.ts`:
```typescript
export const devices = {
  "livingRoomLamp": {  // Your custom device name
    device: "XX:XX:XX:XX:XX:XX:XX:XX",  // MAC address from devices.json
    deviceName: "Living Room Lamp",      // Friendly name
    sku: "H6159",                        // Model number from devices.json
  },
  // Add more devices as needed
};
```

## Usage

After 

```bash
# List devices
govee list

# Save current states of all devices
govee save

# Start interactive mode
govee interactive

# State Management
govee save                               # Save current states of all devices
govee interactive                        # Start interactive control mode
```

# Set brightness (0-100)
govee brightness <device-name> <level>

# Set color temperature (2000-9000K)
govee temperature <device-name> <temp>

# Set color (hex)
govee color <device-name> <hex-color>
```

