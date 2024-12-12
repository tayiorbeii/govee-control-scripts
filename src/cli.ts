import { Command } from 'commander';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const inquirer = require('inquirer');
import { devices } from './devices.js';
import { turnOn, turnOff, setBrightness, setColorTemperature, setColor, workMode } from './goveeControl.js';
import colorPicker from './prompts/colorPicker.js';

const program = new Command();

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

program
  .name('govee-control')
  .description('CLI to control Govee devices')
  .version('1.0.0');

async function promptForValue(operation: string): Promise<number> {
  const { value } = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: operation === 'brightness' 
        ? 'Enter brightness level (0-100):' 
        : 'Enter color temperature in Kelvin:',
      validate: (input: string) => {
        const num = parseInt(input);
        if (isNaN(num)) {
          return 'Please enter a valid number';
        }
        if (operation === 'brightness' && (num < 0 || num > 100)) {
          return 'Brightness must be between 0 and 100';
        }
        return true;
      }
    }
  ]);
  return parseInt(value);
}

async function interactiveControl() {
  try {
    // First, select a device
    const { deviceName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deviceName',
        message: 'Select a device:',
        choices: Object.entries(devices).map(([name, device]) => ({
          name: `${name} (${device.deviceName})`,
          value: name
        }))
      }
    ]);

    // Then, select an operation
    const { operation } = await inquirer.prompt([
      {
        type: 'list',
        name: 'operation',
        message: 'Select an operation:',
        choices: [
          { name: 'Turn On', value: 'on' },
          { name: 'Turn Off', value: 'off' },
          { name: 'Set Brightness', value: 'brightness' },
          { name: 'Set Color', value: 'color' },
          { name: 'Set Color Temperature', value: 'temperature' },
          { name: 'Work Mode', value: 'work' }
        ]
      }
    ]);

    // Handle the selected operation
    switch (operation) {
      case 'on':
        await turnOn(deviceName);
        console.log(`Turned on ${deviceName}`);
        break;
      case 'off':
        await turnOff(deviceName);
        console.log(`Turned off ${deviceName}`);
        break;
      case 'brightness':
        const brightness = await promptForValue('brightness');
        await setBrightness(deviceName, brightness);
        console.log(`Set ${deviceName} brightness to ${brightness}`);
        break;
      case 'color':
        const selectedColor = await colorPicker({ 
          message: 'Choose a color for the device:',
          deviceName 
        });
        if (selectedColor !== 'CURRENT_COLOR') {
          await setColor(deviceName, selectedColor);
        }
        break;
      case 'temperature':
        const temperature = await promptForValue('temperature');
        await setColorTemperature(deviceName, temperature);
        console.log(`Set ${deviceName} color temperature to ${temperature}K`);
        break;
      case 'work':
        await workMode();
        console.log('Work mode activated');
        break;
    }

    // Ask if user wants to perform another operation
    const { again } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'again',
        message: 'Would you like to perform another operation?',
        default: true
      }
    ]);

    if (again) {
      await interactiveControl();
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

program
  .command('interactive')
  .description('Interactive mode to control devices')
  .action(interactiveControl);

program
  .command('list')
  .description('List all available devices')
  .action(async () => {
    try {
      console.log('Available devices:');
      Object.entries(devices).forEach(([name, device]) => {
        console.log(`- ${name} (${device.deviceName})`);
      });
    } catch (error) {
      console.error('Error listing devices:', error);
      process.exit(1);
    }
  });

program
  .command('control')
  .description('Control a specific device')
  .argument('<device>', 'Device name')
  .option('-o, --operation <operation>', 'Operation to perform (on/off/brightness/temperature/work)')
  .option('-v, --value <value>', 'Value for the operation (brightness level or color temperature)')
  .action(async (deviceName, options) => {
    try {
      if (!devices[deviceName]) {
        console.error(`Device "${deviceName}" not found. Available devices: ${Object.keys(devices).join(', ')}`);
        process.exit(1);
      }

      switch (options.operation) {
        case 'on':
          await turnOn(deviceName);
          console.log(`Turned on ${deviceName}`);
          break;
        case 'off':
          await turnOff(deviceName);
          console.log(`Turned off ${deviceName}`);
          break;
        case 'brightness':
          if (!options.value) {
            console.error('Brightness value is required (0-100)');
            process.exit(1);
          }
          const brightness = parseInt(options.value);
          if (isNaN(brightness) || brightness < 0 || brightness > 100) {
            console.error('Brightness must be between 0 and 100');
            process.exit(1);
          }
          await setBrightness(deviceName, brightness);
          console.log(`Set ${deviceName} brightness to ${brightness}`);
          break;
        case 'temperature':
          if (!options.value) {
            console.error('Color temperature value is required (in Kelvin)');
            process.exit(1);
          }
          const temperature = parseInt(options.value);
          if (isNaN(temperature)) {
            console.error('Invalid temperature value');
            process.exit(1);
          }
          await setColorTemperature(deviceName, temperature);
          console.log(`Set ${deviceName} color temperature to ${temperature}K`);
          break;
        case 'work':
          await workMode();
          console.log('Work mode activated');
          break;
        default:
          console.log('Available operations:');
          console.log('- on: Turn device on');
          console.log('- off: Turn device off');
          console.log('- brightness: Set brightness (0-100)');
          console.log('- temperature: Set color temperature (in Kelvin)');
          console.log('- work: Activate work mode');
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

await program.parseAsync(); 