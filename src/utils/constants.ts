export const DEFAULT_BRIGHTNESS = 100;
export const MIN_BRIGHTNESS = 0;
export const MAX_BRIGHTNESS = 100;

export const MIN_COLOR_TEMP = 2000;
export const MAX_COLOR_TEMP = 9000;
export const DEFAULT_COLOR_TEMP = 4000;

export const CONFIG_FILES = {
  DEVICES: 'src/config/devices.json',
  SAVED_STATES: 'src/config/saved-states.json',
  PRESETS: 'src/config/presets.json'
} as const;

export const API_ENDPOINTS = {
  BASE_URL: 'https://developer-api.govee.com/v1',
  DEVICES: '/devices',
  CONTROL: '/devices/control',
  STATE: '/devices/state'
} as const; 