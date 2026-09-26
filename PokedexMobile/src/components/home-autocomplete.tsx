import { PokemonArtwork } from './pokemon-artwork';
import { finish } from '@/constants/visual-system';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './animated-pressable';
import { palette, SearchBox } from './pokedex-ui';
import { filterPokemonReference, listPokemonReference, referenceDestination, type PokemonReferenceListItem } from '@/data/pokemon-reference';
import type { Pokemon } from '@/data/pokedex-store';

export function HomeAutocomplete({ value, onChangeText, placeholder, pokemon }: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  pokemon: Pokemon[];
}) {
  const [items, setItems] = useState<PokemonReferenceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const selected = useRef(false);
  const hasQuery = Boolean(value.trim());

  useEffect(() => {
    if (!hasQuery) return;
    let active = true;
    setLoading(true);
    setError('');
    void listPokemonReference().then((catalog) => {
      if (active) setItems(catalog);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [hasQuery, retry]);

  const matches = useMemo(() => filterPokemonReference(items, value).slice(0, 8), [items, value]);
  const existingNumbers = useMemo(() => new Set(pokemon.map((item) => item.NumeroPokedex)), [pokemon]);

  return (
    <View>
      <SearchBox value={value} placeholder={placeholder} onChangeText={(text) => {
        selected.current = false;
        onChangeText(text);
      }} />
      {hasQuery && (
        <View style={styles.suggestions}>
          {loading ? <Text accessibilityLiveRegion="polite" style={styles.message}>Cargando catálogo…</Text> : error ? (
            <View style={styles.messageBox}>
              <Text style={styles.message}>{error}</Text>
              <AnimatedPressable accessibilityRole="button" onPress={() => setRetry((count) => count + 1)}>
                <Text style={styles.retry}>Reintentar</Text>
              </AnimatedPressable>
            </View>
          ) : matches.length ? matches.map((item) => {
            const added = existingNumbers.has(item.id);
            const status = added ? 'En tu Pokédex' : 'No está en tu Pokédex';
            return (
              <AnimatedPressable key={item.id} accessibilityRole="button"
                accessibilityLabel={`${item.name}, número ${item.id}, ${status}`}
                style={styles.row} onPress={() => {
                  if (selected.current) return;
                  selected.current = true;
                  const destination = referenceDestination(item, pokemon);
                  onChangeText('');
                  router.push(destination);
                }}>
                <PokemonArtwork number={item.id} current={item.image} name={item.name} style={styles.image} />
                <View style={styles.copy}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.number}>#{String(item.id).padStart(3, '0')}</Text>
                  <Text style={[styles.status, added && styles.added]}>{status}</Text>
                </View>
              </AnimatedPressable>
            );
          }) : <Text accessibilityLiveRegion="polite" style={styles.message}>Sin especies coincidentes.</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestions: { ...finish.panel, marginTop: 6, borderRadius: 14, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  image: { width: 44, height: 44 },
  copy: { flex: 1, gap: 2 },
  name: { color: palette.ink, fontWeight: '700', fontSize: 14 },
  number: { color: palette.muted, fontSize: 12 },
  status: { alignSelf: 'flex-start', backgroundColor: palette.surfaceAlt, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3, color: palette.muted, fontSize: 11 },
  added: { color: palette.blue },
  message: { color: palette.muted, padding: 10, fontSize: 12 },
  messageBox: { paddingBottom: 10 },
  retry: { color: palette.blue, paddingHorizontal: 10, fontSize: 13 },
});
