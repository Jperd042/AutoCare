import { light, radius as sharedRadius } from '@autocare/shared';

export const colors = light;

export const radius = {
  ...sharedRadius,
  large: 28, // web uses a slightly larger large radius
};
