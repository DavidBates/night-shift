export type ViewType = 'start' | 'custom_setup' | 'night_intro' | 'game' | 'jumpscare' | 'win' | 'gameover' | 'ending' | 'keypad' | 'battle_mode';

export type AnimatronicName = 'blue' | 'red' | 'yellow';

export interface Animatronic {
  location: number; // 0-7, where 0 is stage, 7 is door
  path: number[];
  name: string;
}

export interface AnimatronicsState {
  blue: Animatronic;
  red: Animatronic;
  yellow: Animatronic;
}

export interface GameSettings {
  night: number;
  blueAI: number;
  redAI: number;
  yellowAI: number;
  startingPower: number;
  hourLengthMs: number;
  isNightmareMode?: boolean;
}

export interface GameStateRef {
  leftDoorClosed: boolean;
  rightDoorClosed: boolean;
  leftLightOn: boolean;
  rightLightOn: boolean;
  cameraOpen: boolean;
  isSettingsOpen: boolean;
  view: ViewType;
  power: number;
  time: number;
  animatronics: AnimatronicsState;
}

export type PlaySoundFunction = (type: 'switch' | 'scare' | 'blip' | 'door' | 'keys' | 'flashlight') => void;