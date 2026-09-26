import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';

// Pause loops while another route is visible; always release them on unmount.
export function useAmbientMotion(duration = 3600) {
  const value = useRef(new Animated.Value(0)).current;
  useFocusEffect(useCallback(() => {
    value.setValue(0);
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [duration, value]));
  return value;
}

export function Entrance({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(value, { toValue: 1, duration: 420, delay, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [delay, value]);
  return <Animated.View style={[style, { opacity: value, transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>{children}</Animated.View>;
}

export function FloatingPokemon({ children }: { children: ReactNode }) {
  const motion = useAmbientMotion(1600);
  return <Animated.View style={{ transform: [{ translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) }, { scale: motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }] }}>{children}</Animated.View>;
}
