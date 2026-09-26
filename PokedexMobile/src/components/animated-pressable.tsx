import { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, type PressableProps, type View } from 'react-native';

const NativeAnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & { pressScale?: number };

// No wrapper, hitSlop or deferred onPress: layout and actions stay with the caller.
export const AnimatedPressable = forwardRef<View, Props>(function AnimatedPressable(
  { style, disabled, pressScale = 0.98, onPressIn, onPressOut, onHoverIn, onHoverOut, ...props }, ref,
) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (disabled) {
      scale.stopAnimation();
      scale.setValue(1);
      setPressed(false);
    }
    return () => scale.stopAnimation();
  }, [disabled, scale]);

  const animate = (toValue: number) => {
    Animated.timing(scale, { toValue, duration: 120, useNativeDriver: true, isInteraction: false }).start();
  };
  const resolvedStyle = typeof style === 'function' ? style({ pressed: !disabled && pressed, hovered }) : style;
  const existingTransform = StyleSheet.flatten(resolvedStyle)?.transform;

  return (
    <NativeAnimatedPressable
      {...props}
      ref={ref}
      disabled={disabled}
      style={[resolvedStyle, !disabled && {
        transform: [...(Array.isArray(existingTransform) ? existingTransform : []), { scale }],
      }]}
      onHoverIn={(event) => { setHovered(true); onHoverIn?.(event); }}
      onHoverOut={(event) => { setHovered(false); onHoverOut?.(event); }}
      onPressIn={(event) => {
        if (disabled) return;
        setPressed(true);
        animate(pressScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (disabled) return;
        setPressed(false);
        animate(1);
        onPressOut?.(event);
      }}
    />
  );
});
