export type ViewType = 'start' | 'custom_setup' | 'night_intro' | 'game' | 'jumpscare' | 'win' | 'gameover' | 'ending';

export type AnimatronicName = 'blue' | 'red';

export interface Animatronic {
  location: number; // 0-7, where 0 is stage, 7 is door
  path: number[];
  name: string;
}

export interface AnimatronicsState {
  blue: Animatronic;
  red: Animatronic;
}

export interface GameSettings {
  night: number;
  blueAI: number;
  redAI: number;
  startingPower: number;
  hourLengthMs: number;
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