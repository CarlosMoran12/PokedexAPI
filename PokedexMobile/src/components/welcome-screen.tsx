import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, finish, gradient } from '@/constants/visual-system';

// Session state survives route changes, without persisting across app launches.
export function WelcomeGate({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  return started ? children : <WelcomeScreen onStart={() => setStarted(true)} />;
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const consoleWidth = Math.min(width - 40, 680, Math.max(240, (height - insets.top - insets.bottom - 230) * 0.93));
  const pulse = useRef(new Animated.Value(0)).current;
  const ambient = useRef(new Animated.Value(0)).current;
  const screenScale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const entering = useRef(false);

  useEffect(() => {
    const breathe = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    const atmosphere = Animated.loop(Animated.sequence([
      Animated.timing(ambient, { toValue: 1, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(ambient, { toValue: 0, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    breathe.start();
    atmosphere.start();
    return () => {
      breathe.stop();
      atmosphere.stop();
      screenScale.stopAnimation();
      opacity.stopAnimation();
    };
  }, [ambient, opacity, pulse, screenScale]);

  const start = () => {
    if (entering.current) return;
    entering.current = true;
    Animated.sequence([
      Animated.timing(screenScale, { toValue: 0.97, duration: 90, useNativeDriver: true }),
      Animated.timing(screenScale, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onStart(); });
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Animated.View style={[styles.stage, { width: consoleWidth, opacity }]}>
        <Text style={styles.kicker}>— EXPLORA. DESCUBRE. COMPLETA.</Text>
        <View style={styles.console}>
          <Animated.View pointerEvents="none" style={[styles.ambient, {
            opacity: ambient.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.5] }),
            transform: [
              { rotate: ambient.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) },
              { scale: ambient.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) },
            ],
          }]}>
            <View style={[styles.ambientRing, { width: '100%', borderStyle: 'dashed' }]} />
            <View style={[styles.orbitLight, { left: '6%', top: '30%' }]} />
            <View style={[styles.orbitLight, { right: '7%', bottom: '28%', backgroundColor: palette.red }]} />
            <View style={[styles.orbitLight, { right: '14%', top: '15%' }]} />
            <View style={[styles.ambientRing, { width: '87%' }]} />
            <View style={[styles.ambientRing, { width: '74%' }]} />
          </Animated.View>
          <View style={styles.upperShell}>
            <View style={styles.camera} />
            <View style={styles.upperScreen}>
              <View pointerEvents="none" style={styles.screenRing} />
              <View pointerEvents="none" style={[styles.screenRing, { width: '48%', opacity: 0.1 }]} />
              <Text style={[styles.title, { fontSize: consoleWidth * 0.077 }]}>Pokédex</Text>
              <Text style={[styles.title, styles.mobile, { fontSize: consoleWidth * 0.067 }]}>Mobile</Text>
            </View>
            <View pointerEvents="none" style={styles.speakerLeft}><Speaker /></View>
            <View pointerEvents="none" style={styles.speakerRight}><Speaker /></View>
          </View>
          <View style={styles.hinge}>
            <View style={styles.hingeCapLeft} /><View style={styles.hingeCapRight} />
            <View style={styles.hingeCamera} /><View style={styles.hingeLight} />
          </View>
          <View style={styles.lowerShell}>
            <View pointerEvents="none" style={styles.controls}>
              <View style={styles.dpad}><View style={styles.dpadHorizontal} /><View style={styles.dpadVertical} /><Text style={styles.crossMark}>+</Text></View>
            </View>
            <Animated.View style={[styles.touchFrame, { transform: [{ scale: screenScale }] }]}>
              {/* The sole hit target is exactly the lower display, with no hitSlop. */}
              <Pressable accessibilityRole="button" accessibilityLabel="Toca para iniciar" onPress={start} style={styles.lowerScreen}>
                <Animated.View pointerEvents="none" style={[styles.ballGlow, { width: consoleWidth * 0.17, height: consoleWidth * 0.17, transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }] }]}>
                  <View style={styles.ball}>
                    <View style={styles.ballBottom} />
                    <View style={styles.band} />
                    <View style={styles.ballCenter} />
                  </View>
                </Animated.View>
                <Animated.Text style={[styles.startText, { fontSize: Math.max(12, consoleWidth * 0.028), opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) }]}>Toca para iniciar</Animated.Text>
              </Pressable>
            </Animated.View>
            <View pointerEvents="none" style={styles.controls}>
              <View style={styles.buttons}>
                <View style={[styles.button, { top: 0, left: '35%' }]}><Text style={[styles.buttonLetter, { fontSize: Math.max(8, consoleWidth * 0.023) }]}>X</Text></View>
                <View style={[styles.button, { bottom: 0, left: '35%' }]}><Text style={[styles.buttonLetter, { fontSize: Math.max(8, consoleWidth * 0.023) }]}>B</Text></View>
                <View style={[styles.button, { left: 0, top: '35%' }]}><Text style={[styles.buttonLetter, { fontSize: Math.max(8, consoleWidth * 0.023) }]}>Y</Text></View>
                <View style={[styles.button, { right: 0, top: '35%' }]}><Text style={[styles.buttonLetter, { fontSize: Math.max(8, consoleWidth * 0.023) }]}>A</Text></View>
              </View>
              <View style={styles.systemKeys}><View style={styles.systemKey} /><Text style={styles.systemLabel}>START</Text></View>
              <View style={styles.systemKeys}><View style={styles.systemKey} /><Text style={styles.systemLabel}>SELECT</Text></View>
            </View>
          </View>
          <View pointerEvents="none" style={styles.groundRing} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function Speaker() {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, width: 18 }}>
    {Array.from({ length: 9 }, (_, index) => <View key={index} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: palette.canvas }} />)}
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.canvas },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, overflow: 'hidden' },
  stage: { gap: 42, alignItems: 'center', paddingHorizontal: 22, paddingVertical: 42, borderRadius: 28, borderWidth: 1, borderColor: '#12395A', ...gradient('#061624, #04101E'), boxShadow: 'inset 0px 0px 45px rgba(10,70,130,0.1)' },
  kicker: { color: palette.red, fontSize: 12, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' },
  console: { width: '100%' },
  ambient: { position: 'absolute', width: '118%', aspectRatio: 1, left: '-9%', top: '-20%', alignItems: 'center', justifyContent: 'center' },
  ambientRing: { position: 'absolute', aspectRatio: 1, borderRadius: 999, borderWidth: 1, borderColor: palette.blue },
  upperShell: { ...finish.shell, width: '100%', aspectRatio: 1.95, backgroundColor: palette.red, borderRadius: 16, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  camera: { position: 'absolute', top: '5%', width: 5, height: 5, borderRadius: 3, backgroundColor: palette.canvas },
  upperScreen: { ...finish.screen, width: '65%', height: '85%', backgroundColor: palette.canvas, borderRadius: 7, borderWidth: 1, borderColor: palette.line, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  screenRing: { position: 'absolute', width: '68%', aspectRatio: 1, borderRadius: 999, borderWidth: 1, borderColor: palette.blue, opacity: 0.18 },
  title: { color: palette.white, fontWeight: '900', textAlign: 'center' },
  mobile: { color: palette.red },
  speakerLeft: { position: 'absolute', left: '6%' },
  speakerRight: { position: 'absolute', right: '6%' },
  hinge: { width: '101%', height: 24, alignSelf: 'center', ...gradient('#FF7580, #F62946, #9B0825', 180), borderWidth: 1, borderColor: '#8D0B22', borderRadius: 9, alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0px 4px 5px rgba(0,0,0,0.55), inset 0px 2px 2px rgba(255,255,255,0.5)' },
  hingeCapLeft: { position: 'absolute', left: '8%', height: '100%', borderLeftWidth: 1, borderColor: '#74061A' },
  hingeCapRight: { position: 'absolute', right: '8%', height: '100%', borderLeftWidth: 1, borderColor: '#74061A' },
  hingeCamera: { width: 12, height: 12, borderRadius: 6, backgroundColor: palette.canvas, borderWidth: 2, borderColor: '#790B20' },
  hingeLight: { position: 'absolute', left: '4%', height: 11, width: 2, borderRadius: 2, backgroundColor: palette.blue },

  lowerShell: { ...finish.shell, width: '100%', aspectRatio: 1.95, backgroundColor: palette.red, borderRadius: 16, borderWidth: 1, borderColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  touchFrame: { width: '59%', height: '82%', borderWidth: 4, borderColor: '#B30E2C', borderRadius: 9 },
  lowerScreen: { ...finish.screen, flex: 1, width: '100%', backgroundColor: palette.canvas, borderRadius: 7, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center', gap: 12, overflow: 'hidden' },
  ballGlow: { boxShadow: '0px 0px 18px rgba(30,140,255,0.25)', padding: 4, borderWidth: 1, borderColor: palette.blue, borderRadius: 999, backgroundColor: palette.panel },
  ball: { ...finish.red, flex: 1, width: '100%', borderRadius: 999, backgroundColor: palette.red, borderWidth: 2, borderColor: palette.ink, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  ballBottom: { position: 'absolute', bottom: 0, height: '50%', width: '100%', backgroundColor: palette.white },
  band: { position: 'absolute', width: '100%', height: '10%', backgroundColor: palette.canvas },
  ballCenter: { width: '30%', aspectRatio: 1, borderRadius: 999, backgroundColor: palette.white, borderWidth: 3, borderColor: palette.canvas },
  startText: { color: palette.white, fontWeight: '700', textAlign: 'center' },
  controls: { width: '20.5%', gap: 8, alignItems: 'center', justifyContent: 'center' },
  dpad: { width: '45%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dpadHorizontal: { position: 'absolute', width: '100%', height: '34%', borderRadius: 2, backgroundColor: '#B80D2D', boxShadow: '0px 2px 3px rgba(0,0,0,0.6), inset 0px 1px 1px rgba(255,255,255,0.35)' },
  dpadVertical: { position: 'absolute', height: '100%', width: '34%', borderRadius: 2, backgroundColor: '#B80D2D', boxShadow: '0px 2px 3px rgba(0,0,0,0.6), inset 0px 1px 1px rgba(255,255,255,0.35)' },
  buttons: { width: '50%', aspectRatio: 1 },
  button: { ...finish.red, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#8D0B22', position: 'absolute', width: '30%', height: '30%', borderRadius: 999, backgroundColor: palette.red },
  buttonLetter: { color: palette.ink, fontWeight: '500' },
  crossMark: { position: 'absolute', color: palette.ink, fontSize: 20 },
  systemKeys: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  systemKey: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#C81935', borderWidth: 1, borderColor: '#830A22' },
  systemLabel: { color: '#F5AFBA', fontSize: 6, fontWeight: '600' },
  orbitLight: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: '#A2DEFF', boxShadow: '0px 0px 10px #168FFF' },
  groundRing: { width: '110%', height: 24, alignSelf: 'center', marginTop: 14, borderRadius: 999, borderWidth: 1, borderColor: '#124D80', boxShadow: '0px 4px 22px rgba(0,115,255,0.2)' },
});
