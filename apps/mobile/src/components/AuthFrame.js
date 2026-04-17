import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { colors, radius } from '../theme';
import ScreenShell from './ScreenShell';

export default function AuthFrame({
  children,
  title,
  subtitle,
  backLabel,
  onBack,
  contentContainerStyle,
  cardStyle,
  bodyStyle,
  centerContent = false,
}) {
  const { width } = useWindowDimensions();
  const isCompactLayout = width < 720;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    cardOpacity.stopAnimation();
    cardTranslate.stopAnimation();
    cardOpacity.setValue(0);
    cardTranslate.setValue(20);

    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslate]);

  return (
    <ScreenShell
      contentContainerStyle={[
        styles.content,
        centerContent && styles.contentCentered,
        isCompactLayout && styles.contentCompact,
        contentContainerStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.cardWrap,
          isCompactLayout && styles.cardWrapCompact,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslate }],
          },
        ]}
      >
        <View style={[styles.shellFill, isCompactLayout && styles.shellFillCompact]} />
        <View style={[styles.orbTopRight, isCompactLayout && styles.orbTopRightCompact]} />
        <View style={[styles.orbTopLeft, isCompactLayout && styles.orbTopLeftCompact]} />
        <View style={[styles.orbCenterRight, isCompactLayout && styles.orbCenterRightCompact]} />
        <View style={[styles.orbBottomLeft, isCompactLayout && styles.orbBottomLeftCompact]} />

        <View style={[styles.card, isCompactLayout && styles.cardCompact, cardStyle]}>
          {backLabel && onBack ? (
            <TouchableOpacity
              testID="auth-frame-back-link"
              style={styles.backLink}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={backLabel}
            >
              <MaterialCommunityIcons name="arrow-left" size={18} color={colors.mutedText} />
              <Text style={styles.backLinkText}>{backLabel}</Text>
            </TouchableOpacity>
          ) : null}

          <View testID="auth-frame-hero" style={styles.heroBlock}>
            <View style={styles.brandRow}>
              <View style={styles.brandBadgeWrap}>
                <View style={styles.brandBadgeGlow} />
                <View style={styles.brandBadge}>
                  <MaterialCommunityIcons name="wrench-outline" size={22} color={colors.onPrimary} />
                </View>
              </View>

              <View>
                <Text style={styles.brandEyebrow}>Cruisers Crib</Text>
                <Text style={styles.brandTitle}>AUTOCARE</Text>
              </View>
            </View>

            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          <View style={styles.divider} />

          <View style={[styles.body, bodyStyle]}>{children}</View>
        </View>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  contentCentered: {
    justifyContent: 'center',
  },
  contentCompact: {
    justifyContent: 'flex-start',
    paddingBottom: 28,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    position: 'relative',
    minHeight: '100%',
    overflow: 'hidden',
  },
  cardWrapCompact: {
    maxWidth: '100%',
  },
  shellFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.authShell,
    borderRadius: radius.large,
  },
  shellFillCompact: {
    borderRadius: 0,
  },
  orbTopRight: {
    position: 'absolute',
    top: -18,
    right: -36,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.authOrbOrange,
  },
  orbTopRightCompact: {
    top: -24,
    right: -54,
  },
  orbTopLeft: {
    position: 'absolute',
    top: 86,
    left: -38,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.authOrbBlueSoft,
  },
  orbTopLeftCompact: {
    top: 74,
    left: -48,
  },
  orbCenterRight: {
    position: 'absolute',
    top: 240,
    right: -26,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.authOrbBlue,
  },
  orbCenterRightCompact: {
    top: 260,
    right: -30,
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: 26,
    left: -28,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.authOrbOrangeSoft,
  },
  orbBottomLeftCompact: {
    bottom: 68,
    left: -34,
  },
  card: {
    backgroundColor: colors.authShellElevated,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.authShellBorder,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.46,
    shadowRadius: 36,
    elevation: 16,
    minHeight: '100%',
  },
  cardCompact: {
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 10,
  },
  backLinkText: {
    color: colors.authSecondaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  heroBlock: {
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  brandBadgeWrap: {
    width: 54,
    height: 54,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeGlow: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.authBadgeGlow,
    transform: [{ scale: 1.15 }],
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.authBadgeEdge,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.52,
    shadowRadius: 24,
    elevation: 8,
  },
  brandEyebrow: {
    color: colors.authSecondaryText,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.3,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  brandTitle: {
    color: colors.authHeroText,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  title: {
    color: colors.authHeroText,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 33,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.authSecondaryText,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 420,
  },
  divider: {
    height: 1,
    backgroundColor: colors.authShellBorder,
  },
  body: {
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 24,
  },
});
