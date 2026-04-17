import { light, radius as sharedRadius } from '@autocare/shared';

export const colors = {
  ...light,
  surfaceBg: light.pageBackground,
  surfaceCard: light.cardBackground,
  surfaceRaised: light.surfaceRaised,
  surfaceInput: light.input,
  surfaceBorder: light.border,
  inkPrimary: light.text,
  inkSecondary: light.labelText,
  inkMuted: light.mutedText,
};

export const radius = {
  ...sharedRadius,
  large: 28, // web uses a slightly larger large radius
};
