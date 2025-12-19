
export interface ColorInfo {
  hex: string;
  name: string;
  description: string;
  isGradient?: boolean;
  gradientEndHex?: string;
  secondaryHex?: string;
  tertiaryHex?: string;
}

export interface Recommendation {
  category: string;
  colors: ColorInfo[];
  why: string;
}

export interface AnalysisResult {
  skinTone: ColorInfo;
  hairColor: ColorInfo;
  eyeColor: ColorInfo;
  seasonalPalette: string;
  description: string;
  recommendations: Recommendation[];
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  CROP = 'CROP',
  ANALYZE = 'ANALYZE',
  RESULT = 'RESULT'
}
