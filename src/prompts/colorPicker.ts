import chalk from 'chalk';
import { colorManager } from '../colorManager.js';

interface ColorPickerOptions {
  message: string;
  deviceName?: string;
}

export default async function colorPicker({ message, deviceName }: ColorPickerOptions): Promise<string> {
  const inquirer = (await import('inquirer')).default;

  await colorManager.init();
  const currentColor = deviceName ? await colorManager.getCurrentColor(deviceName) : undefined;
  const favoriteColors = colorManager.getFavoriteColors();

  // First prompt to choose from list or custom
  const { colorChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'colorChoice',
      message,
      choices: [
        new inquirer.Separator('= Current Color ='),
        ...(currentColor ? [{
          name: `Current: ${chalk.hex(currentColor)('■■■■')} ${currentColor}`,
          value: currentColor
        }] : []),
        new inquirer.Separator('= Favorite Colors ='),
        ...favoriteColors.map(c => ({
          name: `${chalk.hex(c.hex)('■■■■')} ${c.name} (${c.hex})`,
          value: c.hex
        })),
        new inquirer.Separator('= Custom Color ='),
        {
          name: 'Enter custom hex color...',
          value: 'custom'
        }
      ]
    }
  ]);

  // If custom was selected, prompt for hex color
  if (colorChoice === 'custom') {
    const { customColor } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customColor',
        message: 'Enter hex color (e.g. #FF0000):',
        validate: (input) => {
          return /^#[0-9A-Fa-f]{6}$/.test(input) || 'Please enter a valid hex color (e.g. #FF0000)';
        }
      }
    ]);
    return customColor;
  }

  return colorChoice;
} 