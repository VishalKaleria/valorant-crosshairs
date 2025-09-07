import { colorPalette } from "./crosshair-data";
import { CrosshairProfile } from "./crosshair-types";

interface BackgroundOption {
  name: string;
  colors: string[];
  luminance: 'dark' | 'medium' | 'bright';
  priority: number;
}

const AVAILABLE_BACKGROUNDS: BackgroundOption[] = [
  { name: 'blaugelb.webp', colors: ['blue', 'yellow'], luminance: 'medium', priority: 0 },
  { name: 'blue.webp', colors: ['blue'], luminance: 'dark', priority: 1 },
  { name: 'grass.webp', colors: ['green'], luminance: 'medium', priority: 2 },
  { name: 'green.webp', colors: ['green'], luminance: 'dark', priority: 3 },
  { name: 'metall.webp', colors: ['gray', 'silver'], luminance: 'medium', priority: 4 },
  { name: 'orange.webp', colors: ['orange'], luminance: 'bright', priority: 5 },
  { name: 'sky.webp', colors: ['cyan', 'blue'], luminance: 'bright', priority: 6 },
  { name: 'yellow.webp', colors: ['yellow'], luminance: 'bright', priority: 7 }
];

const COLOR_BACKGROUND_MAP: { [key: string]: string[] } = {
  'white': ['metall.webp', 'grass.webp', 'blue.webp'],
  'green': ['metall.webp', 'blaugelb.webp', 'sky.webp'],
  'yellow': ['metall.webp', 'blue.webp', 'grass.webp'],
  'cyan': ['metall.webp', 'grass.webp', 'orange.webp'],
  'pink': ['metall.webp', 'grass.webp', 'blue.webp'],
  'purple': ['metall.webp', 'grass.webp', 'sky.webp'],
  'red': ['metall.webp', 'grass.webp', 'blaugelb.webp'],
  'orange': ['metall.webp', 'blue.webp', 'grass.webp'],
  'blue': ['metall.webp', 'grass.webp', 'orange.webp']
};

const COLOR_MAP: { [key: number]: string } = {
  0: 'white',
  1: 'green',
  2: 'yellow',
  3: 'cyan',
  4: 'pink',
  5: 'purple',
  6: 'white',
  7: 'yellow'
};

interface CrosshairColorInfo {
  colorName: string;
  luminance: 'dark' | 'medium' | 'bright';
  colorValue: number;
}

/**
 * Analyzes a crosshair profile to extract color information
 */
export function analyzeCrosshairColor(profile: CrosshairProfile): CrosshairColorInfo {
  const primaryColor = profile?.primary?.color;
  
  if (primaryColor === undefined || primaryColor === null) {
    return { colorName: 'white', luminance: 'medium', colorValue: 0 };
  }

  let crosshairLuminance: 'dark' | 'medium' | 'bright' = 'medium';
  let crosshairColorName = 'white';
  let colorValue = primaryColor;

  // If using custom hex color (color index 8)
  if (primaryColor === 8 && profile?.primary?.hexColor?.value) {
    const hex = profile.primary.hexColor.value.substring(0, 6);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    crosshairLuminance = luminance > 0.6 ? 'bright' : luminance < 0.3 ? 'dark' : 'medium';
    colorValue = (r + g + b) % 255; // Create deterministic value from hex color
    
    // Determine dominant color from hex
    if (r > g && r > b) crosshairColorName = 'red';
    else if (g > r && g > b) crosshairColorName = 'green';
    else if (b > r && b > g) crosshairColorName = 'blue';
    else if (r > 200 && g > 200) crosshairColorName = 'yellow';
    else if (r > 200 && b < 100) crosshairColorName = 'orange';
    else if (b > 200 && g > 200) crosshairColorName = 'cyan';
  } else {
    // Use color palette for standard colors
    crosshairColorName = COLOR_MAP[primaryColor] || 'white';
    
    const colorHex = colorPalette[primaryColor];
    if (colorHex) {
      const r = parseInt(colorHex.substring(1, 3), 16);
      const g = parseInt(colorHex.substring(3, 5), 16);
      const b = parseInt(colorHex.substring(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      crosshairLuminance = luminance > 0.6 ? 'bright' : luminance < 0.3 ? 'dark' : 'medium';
    }
  }

  return { colorName: crosshairColorName, luminance: crosshairLuminance, colorValue };
}

/**
 * Creates a deterministic hash from a string
 */
function getHashFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

/**
 * Gets optimal background options for a specific color
 */
function getOptimalBackgroundsForColor(colorName: string): string[] {
  return COLOR_BACKGROUND_MAP[colorName] || ['metall.webp'];
}

/**
 * Selects the best background image for a crosshair deterministically.
 * 
 * Strategy:
 * 1. Uses metall.webp (neutral) as primary choice for most colors
 * 2. Adds variety with grass.webp and blaugelb.webp (mixed colors)
 * 3. Avoids high-contrast combinations that make crosshairs hard to see
 * 4. Reduces overuse of solid green backgrounds
 * 5. Creates deterministic selection based on crosshair ID and color properties
 */
export function selectBackgroundForCrosshair(
  crosshairId: number,
  profile: CrosshairProfile
): string {
  const { colorName, luminance, colorValue } = analyzeCrosshairColor(profile);
  
  // Generate deterministic seed from crosshair ID and color properties
  const seed = crosshairId + colorValue + getHashFromString(colorName + luminance);
  
  // First try color-specific optimal backgrounds
  const optimalBackgroundNames = getOptimalBackgroundsForColor(colorName);
  const availableOptimalBackgrounds = AVAILABLE_BACKGROUNDS.filter(bg => 
    optimalBackgroundNames.includes(bg.name)
  );
  
  if (availableOptimalBackgrounds.length > 0) {
    const selected = availableOptimalBackgrounds[seed % availableOptimalBackgrounds.length];
    return `/assets/vcrdb-backgrounds/${selected.name}`;
  }
  
  // Fallback to luminance-based selection with gentler contrast
  let candidateBackgrounds: BackgroundOption[] = [];
  
  if (luminance === 'bright') {
    // For bright crosshairs, prefer medium and dark backgrounds (less harsh contrast)
    candidateBackgrounds = AVAILABLE_BACKGROUNDS.filter(bg => 
      bg.luminance === 'medium' || bg.luminance === 'dark'
    );
    // Prioritize neutral backgrounds first
    const neutralBackgrounds = candidateBackgrounds.filter(bg => 
      bg.name === 'metall.webp' || bg.name === 'grass.webp' || bg.name === 'blaugelb.webp'
    );
    if (neutralBackgrounds.length > 0) {
      candidateBackgrounds = neutralBackgrounds;
    }
    if (candidateBackgrounds.length === 0) {
      candidateBackgrounds = [AVAILABLE_BACKGROUNDS.find(bg => bg.name === 'metall.webp')!];
    }
  } else if (luminance === 'dark') {
    // For dark crosshairs, prefer medium and bright backgrounds
    candidateBackgrounds = AVAILABLE_BACKGROUNDS.filter(bg => 
      bg.luminance === 'medium' || bg.luminance === 'bright'
    );
    // Prioritize neutral backgrounds first
    const neutralBackgrounds = candidateBackgrounds.filter(bg => 
      bg.name === 'metall.webp' || bg.name === 'grass.webp' || bg.name === 'sky.webp'
    );
    if (neutralBackgrounds.length > 0) {
      candidateBackgrounds = neutralBackgrounds;
    }
    if (candidateBackgrounds.length === 0) {
      candidateBackgrounds = [AVAILABLE_BACKGROUNDS.find(bg => bg.name === 'metall.webp')!];
    }
  } else {
    // For medium luminance, use varied backgrounds but avoid exact color matches
    candidateBackgrounds = AVAILABLE_BACKGROUNDS.filter(bg => 
      !bg.colors.includes(colorName.toLowerCase())
    );
    // Prioritize neutral and varied backgrounds
    const preferredBackgrounds = candidateBackgrounds.filter(bg => 
      bg.name === 'metall.webp' || bg.name === 'grass.webp' || bg.name === 'blaugelb.webp'
    );
    if (preferredBackgrounds.length > 0) {
      candidateBackgrounds = [...preferredBackgrounds, ...candidateBackgrounds.slice(0, 2)];
    }
    if (candidateBackgrounds.length === 0) {
      candidateBackgrounds = [AVAILABLE_BACKGROUNDS.find(bg => bg.name === 'metall.webp')!];
    }
  }
  
  const selectedBackground = candidateBackgrounds[seed % candidateBackgrounds.length];
  return `/assets/vcrdb-backgrounds/${selectedBackground.name}`;
}

/**
 * Default fallback background
 */
export const DEFAULT_BACKGROUND = '/assets/vcrdb-backgrounds/metall.webp';
