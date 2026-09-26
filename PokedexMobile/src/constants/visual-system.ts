import { Platform } from 'react-native';

export const palette = {
  ink: '#F3F6FB', blue: '#3B82F6', dark: '#0B1220', red: '#FF334F',
  yellow: '#F4C542', muted: '#A9B4C7', line: '#22324A', panel: '#0F1D2E',
  canvas: '#07111F', surface: '#101B2D', surfaceAlt: '#14233A', white: '#FFFFFF',
};

// Native gradients and CSS gradients use the same stops; no extra dependency.
type SurfaceStyle = { boxShadow?: string; experimental_backgroundImage?: string; backgroundImage?: string };

export function gradient(stops: string, angle = 145): SurfaceStyle {
  const value = `linear-gradient(${angle}deg, ${stops})`;
  return Platform.OS === 'web'
    ? ({ backgroundImage: value } as SurfaceStyle)
    : { experimental_backgroundImage: value };
}

export const finish = {
  panel: { ...gradient('#15263C, #0C1829'), boxShadow: '0px 10px 28px rgba(0,0,0,0.24), inset 0px 1px 0px rgba(255,255,255,0.045)' } as SurfaceStyle,
  card: { ...gradient('#182A40, #0F1C2E'), boxShadow: '0px 6px 16px rgba(0,0,0,0.2), inset 0px 1px 0px rgba(255,255,255,0.05)' } as SurfaceStyle,
  input: { ...gradient('#091526, #112037', 180), boxShadow: 'inset 0px 2px 5px rgba(0,0,0,0.24)' } as SurfaceStyle,
  red: { ...gradient('#FF4960, #EA1839, #BA1030'), boxShadow: '0px 5px 14px rgba(216,25,62,0.2), inset 0px 1px 1px rgba(255,255,255,0.28)' } as SurfaceStyle,
  screen: { ...gradient('#03101E, #082039, #03101E'), boxShadow: 'inset 0px 2px 8px rgba(0,0,0,0.8), 0px 0px 0px 4px rgba(70,0,15,0.5)' } as SurfaceStyle,
  shell: { ...gradient('#FF4358, #C81231, #EB2341, #AB0B27', 110), boxShadow: 'inset 0px 2px 2px rgba(255,255,255,0.6), inset 0px -5px 8px rgba(78,0,16,0.6), 0px 16px 24px rgba(0,0,0,0.48)' } as SurfaceStyle,
};

export const moduleTones = {
  red: { light: '#FF4762', dark: '#B50930' },
  blue: { light: '#18B8FF', dark: '#0650C6' },
  green: { light: '#15D5AB', dark: '#047355' },
  purple: { light: '#B44CFA', dark: '#5318A0' },
};
