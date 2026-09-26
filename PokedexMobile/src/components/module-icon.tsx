import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import { gradient, moduleTones, palette } from '@/constants/visual-system';

type Module = 'red' | 'blue' | 'green' | 'purple';
const symbols = { blue: 'tag-multiple', green: 'map-marker-radius', purple: 'layers-triple' } as const;

export function ModuleIcon({ tone = 'red', size = 58 }: { tone?: Module; size?: number }) {
  const color = moduleTones[tone];
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[
      styles.tile, gradient(`${color.light}, ${color.dark}`),
      { width: size, height: size, borderRadius: size * 0.26, borderColor: color.light,
        boxShadow: `0px 5px 12px ${color.dark}40, inset 0px 1px 2px rgba(255,255,255,0.35)` },
    ]}>
      {tone === 'red' ? <PokedexMark size={size * 0.57} /> :
        <MaterialCommunityIcons name={symbols[tone]} size={size * 0.6} color={palette.white} />}
    </View>
  );
}

export function PokedexMark({ size = 28 }: { size?: number }) {
  return <View style={{ width: size * 0.76, height: size, borderRadius: size * 0.12, borderWidth: 1.5, borderColor: palette.white, padding: size * 0.1, gap: size * 0.08 }}>
    <View style={{ width: size * 0.14, height: size * 0.14, borderRadius: size, backgroundColor: palette.white }} />
    <View style={{ flex: 1, borderRadius: 2, borderWidth: 1.5, borderColor: palette.white, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="pokeball" size={size * 0.31} color={palette.white} />
    </View>
    <View style={{ width: '50%', height: 2, backgroundColor: palette.white }} />
  </View>;
}
const styles = StyleSheet.create({ tile: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 } });
