import { dark, radius as sharedRadius } from '@autocare/shared';

export const colors = {
  ...dark,
  authShell: dark.pageBackground,
  authShellElevated: dark.surface,
  authShellBorder: dark.border,
  authShellInset: 'rgba(255, 255, 255, 0.04)',
  authHeroText: '#F8FBFF',
  authSecondaryText: dark.labelText,
  authInput: dark.input,
  authInputFocus: '#152233',
  authInputBorder: dark.border,
  authInputBorderStrong: dark.borderStrong,
  authInputReadonly: dark.readonly,
  authPanel: dark.surfaceStrong,
  authPanelBorder: dark.border,
  authPanelInset: dark.surfaceMuted,
  authBadgeGlow: 'rgba(255, 122, 0, 0.44)',
  authBadgeEdge: '#FFD0A1',
  authOrbOrange: 'rgba(255, 122, 0, 0.2)',
  authOrbOrangeSoft: 'rgba(255, 122, 0, 0.08)',
  authOrbBlue: 'rgba(90, 126, 255, 0.16)',
  authOrbBlueSoft: 'rgba(90, 126, 255, 0.08)',
  authCtaGlow: 'rgba(255, 122, 0, 0.38)',
  authCtaEdge: '#FFC183',
};

export const radius = sharedRadius;
