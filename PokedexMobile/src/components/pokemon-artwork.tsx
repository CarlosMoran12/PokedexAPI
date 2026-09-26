import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { pokemonImageSources } from '@/data/pokemon-images';
import { palette } from '@/constants/visual-system';

export const PokemonArtwork = memo(function PokemonArtwork({ number, current, name, style }: {
  number: number; current?: string | null; name: string; style?: StyleProp<Pick<ViewStyle, 'width' | 'height'>>;
}) {
  const sources = pokemonImageSources(number, current);
  return <ArtworkSource key={sources.join('|')} sources={sources} name={name} style={style} />;
});

function ArtworkSource({ sources, name, style }: { sources: string[]; name: string; style?: StyleProp<Pick<ViewStyle, 'width' | 'height'>> }) {
  const [index, setIndex] = useState(0);
  return sources[index] ? <Image
    source={{ uri: sources[index] }} accessibilityLabel={name} style={style}
    contentFit="contain" cachePolicy="memory-disk" transition={120}
    recyclingKey={sources[index]} onError={() => setIndex((value) => value + 1)}
  /> : <View style={[style, { alignItems: 'center', justifyContent: 'center' }]}>
    <Text accessibilityLabel={`${name}: imagen no disponible`} style={{ color: palette.muted, fontSize: 24 }}>?</Text>
  </View>;
}
