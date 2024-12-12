import { createPrompt, useState, useKeypress } from '@inquirer/core';
import chalk from 'chalk';

interface ColorPickerConfig {
  message: string;
  defaultColor?: string;
}

interface ColorState {
  hue: number;
  saturation: number;
  value: number;
  currentRgb: [number, number, number];
  status: 'pending' | 'done';
}

const colorPicker = createPrompt<string, ColorPickerConfig>((config, done) => {
  const message = config.message;
  const [state, setState] = useState<ColorState>({
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

    if (key.name === 'left') {
      const newHue = (state.hue - 10 + 360) % 360;
      const newRgb = hsvToRgb(newHue, state.saturation, state.value);
      setState({
        ...state,
        hue: newHue,
        currentRgb: newRgb
      });
    }

    if (key.name === 'right') {
      const newHue = (state.hue + 10) % 360;
      const newRgb = hsvToRgb(newHue, state.saturation, state.value);
      setState({
        ...state,
        hue: newHue,
        currentRgb: newRgb
      });
    }

    if (key.name === 'up') {
      const newValue = Math.min(100, state.value + 5);
      const newRgb = hsvToRgb(state.hue, state.saturation, newValue);
      setState({
        ...state,
        value: newValue,
        currentRgb: newRgb
      });
    }

    if (key.name === 'down') {
      const newValue = Math.max(0, state.value - 5);
      const newRgb = hsvToRgb(state.hue, state.saturation, newValue);
      setState({
        ...state,
        value: newValue,
        currentRgb: newRgb
      });
    }
  });

  const colorPreview = '██████';
  const hexColor = rgbToHex(...state.currentRgb);
  const coloredPreview = chalk.rgb(...state.currentRgb)(colorPreview);

  const message_prefix = state.status === 'done' ? '✔' : '?';

  return `${message_prefix} ${message}
  Current color: ${coloredPreview} (${hexColor})
  
  Use ← → to adjust hue
  Use ↑ ↓ to adjust brightness
  Press Enter to confirm`;
});

// Helper function to convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  s = s / 100;
  v = v / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// Helper function to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default colorPicker; 