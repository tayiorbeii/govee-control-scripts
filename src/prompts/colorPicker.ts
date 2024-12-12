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

  const { color } = await inquirer.prompt([
    {
      type: 'list',
      name: 'color',
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
    },
    {
      type: 'input',
      name: 'color',
      message: 'Enter hex color (e.g. #FF0000):',
      when: (answers) => answers.color === 'custom',
      validate: (input) => {
        return /^#[0-9A-Fa-f]{6}$/.test(input) || 'Please enter a valid hex color (e.g. #FF0000)';
      }
    }
  ]);

  return color;
} 