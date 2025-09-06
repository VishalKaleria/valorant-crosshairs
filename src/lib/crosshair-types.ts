
export interface CrosshairProfile {
  general: GeneralSettings;
  primary: PrimaryCrosshair;
  ads: ADSCrosshair;
  sniper: SniperCrosshair;
}

export interface GeneralSettings {
  advancedOptions: boolean;
  adsUsePrimary: boolean;
  overwriteAllPrimary: boolean;
  hideOnFire: boolean;
  followSpectating: boolean;
}

export interface LineSettings {
  enabled: boolean;
  width: number;
  length: number;
  vertical: {
    enabled: boolean;
    length: number;
  };
  offset: number;
  alpha: number;
  moveMul: {
    enabled: boolean;
    mul: number;
  };
  fireMul: {
    enabled: boolean;
    mul: number;
  };
}

export interface DotSettings {
  enabled: boolean;
  width: number;
  alpha: number;
}

export interface OutlineSettings {
  enabled: boolean;
  width: number;
  alpha: number;
}

export interface HexColor {
  enabled: boolean;
  value: string;
}

export interface CrosshairBase {
  color: number;
  useCustomColor: boolean;
  hexColor: HexColor;
  outlines: OutlineSettings;
  dot: DotSettings;
  overwriteFireMul: boolean;
}

export interface PrimaryCrosshair extends CrosshairBase {
  inner: LineSettings;
  outer: LineSettings;
}

export interface ADSCrosshair extends CrosshairBase {
  inner: LineSettings;
  outer: LineSettings;
}

export interface SniperCrosshair {
  color: number;
  useCustomColor: boolean;
  hexColor: HexColor;
  dot: {
    enabled: boolean;
    width: number;
    alpha: number;
  };
}

export type ViewMode = 'primary' | 'ads' | 'sniper';
