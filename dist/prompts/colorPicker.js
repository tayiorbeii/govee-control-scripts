import chalk from 'chalk';
import { colorManager } from '../colorManager.js';
import { createPrompt, useState, useKeypress } from '@inquirer/core';
const interactiveColorPicker = createPrompt((config, done) => {
    const [state, setState] = useState({
        hue: 0,
        saturation: 100,
        value: 100,
        currentRgb: [255, 0, 0],
        status: 'pending'
    });
    useKeypress((key) => {
        if (key.name === 'return') {
            const hexColor = rgbToHex(...state.currentRgb);
            setState({ ...state, status: 'done' });
            done(hexColor);
            return;
        }
        if (key.name === 'escape') {
            setState({ ...state, status: 'done' });
            done('');
            return;
        }
        if (key.name === 'left') {
            const newHue = (state.hue - 10 + 360) % 360;
            const newRgb = hsvToRgb(newHue, state.saturation, state.value);
            setState({ ...state, hue: newHue, currentRgb: newRgb });
        }
        if (key.name === 'right') {
            const newHue = (state.hue + 10) % 360;
            const newRgb = hsvToRgb(newHue, state.saturation, state.value);
            setState({ ...state, hue: newHue, currentRgb: newRgb });
        }
        if (key.name === 'up') {
            const newValue = Math.min(100, state.value + 5);
            const newRgb = hsvToRgb(state.hue, state.saturation, newValue);
            setState({ ...state, value: newValue, currentRgb: newRgb });
        }
        if (key.name === 'down') {
            const newValue = Math.max(0, state.value - 5);
            const newRgb = hsvToRgb(state.hue, state.saturation, newValue);
            setState({ ...state, value: newValue, currentRgb: newRgb });
        }
    });
    const colorPreview = '██████';
    const hexColor = rgbToHex(...state.currentRgb);
    const coloredPreview = chalk.rgb(...state.currentRgb)(colorPreview);
    const message_prefix = state.status === 'done' ? '✔' : '?';
    return `${message_prefix} ${config.message}
  Current color: ${coloredPreview} (${hexColor})
  
  Use ← → to adjust hue
  Use ↑ ↓ to adjust brightness
  Press Enter to confirm`;
});
export default async function colorPicker({ message, deviceName }) {
    try {
        const inquirer = (await import('inquirer')).default;
        await colorManager.init();
        const currentColor = deviceName ? await colorManager.getCurrentColor(deviceName) : undefined;
        const favoriteColors = colorManager.getFavoriteColors();
        const mainMenuChoices = [
            { name: 'Interactive Color Picker', value: 'interactive' },
            { name: 'Choose from List', value: 'list' },
            { name: 'Enter Hex Code', value: 'hex' },
            new inquirer.Separator(),
            { name: 'Exit', value: 'exit' }
        ];
        const { selectionType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectionType',
                message: 'How would you like to select a color?',
                choices: mainMenuChoices
            }
        ]);
        if (selectionType === 'exit') {
            return 'CURRENT_COLOR';
        }
        if (selectionType === 'interactive') {
            const color = await interactiveColorPicker({
                message: `${message}\nPress Esc to go back`
            });
            if (color === '')
                return colorPicker({ message, deviceName });
            return color;
        }
        if (selectionType === 'hex') {
            const { customColor } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'customColor',
                    message: 'Enter hex color (e.g. #FF0000) or press Enter to go back:',
                    validate: (input) => {
                        if (input === '')
                            return true;
                        return /^#[0-9A-Fa-f]{6}$/.test(input) || 'Please enter a valid hex color (e.g. #FF0000)';
                    }
                }
            ]);
            if (customColor === '')
                return colorPicker({ message, deviceName });
            return customColor;
        }
        // List selection logic
        const { colorChoice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'colorChoice',
                message,
                choices: [
                    ...(currentColor ? [
                        new inquirer.Separator('= Current Color ='),
                        {
                            name: `Current: ${chalk.hex(currentColor)('■■■■')} ${currentColor}`,
                            value: currentColor
                        }
                    ] : []),
                    new inquirer.Separator('= Favorite Colors ='),
                    ...favoriteColors.map((c) => ({
                        name: `${chalk.hex(c.hex)('■■■■')} ${c.name} (${c.hex})`,
                        value: c.hex
                    })),
                    new inquirer.Separator(),
                    { name: 'Go Back', value: 'back' }
                ]
            }
        ]);
        if (colorChoice === 'back')
            return colorPicker({ message, deviceName });
        return colorChoice;
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\nExiting color picker...');
            return 'CURRENT_COLOR';
        }
        console.error('Error in color picker:', error);
        throw error;
    }
}
// Helper function to convert HSV to RGB
function hsvToRgb(h, s, v) {
    s = s / 100;
    v = v / 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else if (h >= 300 && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
}
// Helper function to convert RGB to Hex
function rgbToHex(r, g, b) {
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
