// ─────────────────────────────────────────────────────────────────────────────
//  @autocare/shared — Brand color tokens
//  Shared palette consumed by both Web (light) and Mobile (dark) themes.
// ─────────────────────────────────────────────────────────────────────────────

export const brand = {
  orange: '#FF8C00',
  orangeDark: '#C96B00',
  orangeMobile: '#FF7A00',
  gold: '#c9951a',
};

export const semantic = {
  success: '#15803D',
  successLight: '#3FD78F',
  warning: '#B45309',
  info: '#1D4ED8',
  danger: '#DC2626',
  dangerLight: '#FF6B6B',
};

export const light = {
  background: '#FFF8F0',
  surface: '#FFFFFF',
  surfaceMuted: '#FFF1DF',
  surfaceStrong: '#FFE3BD',
  primary: brand.orange,
  primaryDark: brand.orangeDark,
  text: '#1F2937',
  mutedText: '#6B7280',
  border: '#E5D2BB',
  borderStrong: '#FFC47A',
  success: semantic.success,
  warning: semantic.warning,
  info: semantic.info,
  danger: semantic.danger,
  shadow: '#7C3E00',
};

export const dark = {
  background: '#0F121C',
  surface: '#141826',
  surfaceStrong: '#1B2131',
  surfaceMuted: '#20263A',
  primary: brand.orangeMobile,
  primarySoft: 'rgba(255, 122, 0, 0.14)',
  primaryGlow: 'rgba(255, 122, 0, 0.28)',
  accent: '#FFB067',
  text: '#FFFFFF',
  mutedText: '#7F89AE',
  labelText: '#9AA4C9',
  border: '#303855',
  borderSoft: '#252C41',
  input: '#1F2536',
  shadow: '#000000',
  readonly: '#181D2B',
  success: semantic.successLight,
  successSoft: 'rgba(63, 215, 143, 0.14)',
  danger: semantic.dangerLight,
  dangerSoft: 'rgba(255, 107, 107, 0.12)',
  onPrimary: '#FFF8F0',
  overlay: 'rgba(5, 7, 13, 0.76)',
};

export const radius = {
  small: 10,
  medium: 16,
  large: 26,
  pill: 999,
};
