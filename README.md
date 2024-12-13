# govee-control-scripts

CLI tool for controlling Govee lights.

<img width="711" alt="govee-cli" src="https://github.com/user-attachments/assets/10769218-7eea-43cd-b489-d96ae9c6aa8a" />

## Installation

Clone the repository and install dependencies:
```bash
npm install
```

## Configuration

1. Create a `.env` file in your project root and add your Govee API key:
```
GOVEE_API_KEY=your_api_key_here
```

To request an API key:
- Open the Govee app on your mobile device.
- Tap the profile icon in the bottom right corner.
- Click the gear icon (settings) at the top right corner.
- Select "Apply for API key."
- Fill out the form with your name and reason for application.
- For the reason, write: "I want to control my lights programmatically."
- Submit the form.

You should be emailed your API key within a few minutes.

### Identify devices and save to config
```bash
tsx src/cli/commands/identifyDevices.ts
```

This will:
- Query your Govee account for all available devices
- Save the device list to `src/config/devices.json`
- Save current device states to `src/config/saved-states.json`

Create variables for your lights in `src/config/devices.ts` based on `src/config/devices.json` 

### Install CLI tool for global use

```bash
npm install -g .
```

This will make the `govee` command available system-wide:

```bash
govee
```

Running the command will show the help menu:

```bash
Usage: govee [options] [command]

CLI to control Govee devices

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  interactive|i                 Interactive mode to control devices
  list|l                        List all available devices
  control|c [options] <device>  Control a specific device
  preset|p <presetName>         Apply a preset configuration to one or more devices
  help [command]                display help for command
```

The interactive mode includes the ability to set brightness, temperature, and color. There's even an interactive color picker!

## Update presets

Update `src/config/colors.json` with your favorite colors to choose from in interactive mode.

Update `src/config/presets.json` with settings you would like save. You can provide information for multiple lights in the same preset, but note that the Govee API will only process one command at a time.

Example preset:

```json
{
  "nightMode": {
    "cylinderFloorLamp": {
      "color": "#4D0000",
      "brightness": 30
    },
    "deskBulb": {
      "color": "#4D0000",
      "brightness": 13
    }
  }
}
```
