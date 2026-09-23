import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  ActionButton,
  DemoNotice,
  ErrorState,
  LoadingState,
  PokemonImage,
  ScreenHeader,
  ScreenShell,
  SearchBox,
  palette,
} from "@/components/pokedex-ui";
import { usePokedexStore } from "@/data/pokedex-store";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const store = usePokedexStore();
  const { pokemon, regiones, tipos, generaciones } = store;
  const [query, setQuery] = useState("");
  const featured = useMemo(
    () => pokemon.find((item) => item.NumeroPokedex === 384) ?? pokemon[0],
    [pokemon],
  );
  const featuredGeneration = store.generaciones.find(
    (item) => item.IdGeneracion === featured?.IdGeneracion,
  );
  const featuredRegion = store.regiones.find(
    (item) => item.IdRegion === featuredGeneration?.IdRegion,
  );
  const featuredTypes = featured
    ? (store.pokemonTipos
        .filter((relation) => relation.IdPokemon === featured.IdPokemon)
        .map(
          (relation) =>
            store.tipos.find((type) => type.IdTipo === relation.IdTipo)?.Nombre,
        )
        .filter(Boolean) as string[])
    : [];
  if (store.loading && pokemon.length === 0)
    return (
      <ScreenShell>
        <ScreenHeader title="Inicio" />
        <LoadingState />
      </ScreenShell>
    );
  if (store.error && pokemon.length === 0)
    return (
      <ScreenShell>
        <ScreenHeader title="Inicio" />
        <ErrorState
          message={store.error}
          onRetry={() => {
            void store.reload();
          }}
        />
      </ScreenShell>
    );

  return (
    <ScreenShell>
      <ScreenHeader
        title="Explora el mundo Pokémon"
        subtitle="Consulta Pokémon, tipos, regiones y generaciones."
      />
      <DemoNotice mode={store.mode} />
      <View style={styles.searchRow}>
        <SearchBox
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre o número..."
        />
        <Link
          href={{ pathname: "/pokemon", params: query.trim() ? { query } : {} }}
          asChild
        >
          <ActionButton label="Explorar Pokédex" onPress={() => undefined} />
        </Link>
      </View>
      {featured ? (
        <View
          style={[
            styles.hero,
            width < 500 && { flexDirection: "column", gap: 14 },
          ]}
        >
          <View style={styles.heroCopy}>
            <TextLabel small>
              DESTACADO · {featuredRegion?.Nombre ?? "REGIÓN NO DISPONIBLE"}
            </TextLabel>
            <TextLabel big>{featured.Nombre}</TextLabel>
            <TextLabel muted>
              Pokémon nacional #
              {String(featured.NumeroPokedex).padStart(3, "0")}.
            </TextLabel>
            <View style={styles.typeRow}>
              {featuredTypes.map((type) => (
                <Badge key={type} label={type} />
              ))}
            </View>
          </View>
          <PokemonImage pokemon={featured} size="hero" />
          <ActionButton
            label="Ver detalle"
            onPress={() =>
              router.push({
                pathname: "/pokemon/[id]",
                params: { id: String(featured.IdPokemon) },
              })
            }
          />
        </View>
      ) : null}
      {pokemon.length ? (
        <>
          <TextLabel bigSection>Pokémon destacados</TextLabel>
          <View style={styles.accessGrid}>
            {pokemon.slice(0, 4).map((item) => (
              <Pressable
                key={item.IdPokemon}
                style={styles.accessCard}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/pokemon/[id]",
                    params: { id: String(item.IdPokemon) },
                  })
                }
              >
                <PokemonImage pokemon={item} />
                <TextLabel section>{item.Nombre}</TextLabel>
                <TextLabel muted>
                  #{String(item.NumeroPokedex).padStart(3, "0")}
                </TextLabel>
                <TextLabel link>Ver detalle →</TextLabel>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
      <View style={styles.sectionHeading}>
        <TextLabel bigSection>Accesos rápidos</TextLabel>
        <TextLabel muted>Consulta los catálogos disponibles.</TextLabel>
      </View>
      <View style={styles.accessGrid}>
        <AccessCard
          href="/pokemon"
          title="Pokédex"
          count={pokemon.length}
          description="Consulta, filtra y administra Pokémon."
        />
        <AccessCard
          href="/tipos"
          title="Tipos"
          count={tipos.length}
          description="Catálogo y relaciones Pokémon–Tipo."
        />
        <AccessCard
          href="/regiones"
          title="Regiones"
          count={regiones.length}
          description="Organiza las regiones del mundo Pokémon."
        />
        <AccessCard
          href="/generaciones"
          title="Generaciones"
          count={generaciones.length}
          description="Relaciona generaciones con regiones."
        />
      </View>
    </ScreenShell>
  );
}

function AccessCard({
  href,
  title,
  count,
  description,
}: {
  href: "/pokemon" | "/tipos" | "/regiones" | "/generaciones";
  title: string;
  count: number;
  description: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => [styles.accessCard, pressed && styles.pressed]}
      >
        <View style={styles.cardTop}>
          <TextLabel section>{title}</TextLabel>
          <View style={styles.count}>
            <TextLabel>{count}</TextLabel>
          </View>
        </View>
        <TextLabel muted>{description}</TextLabel>
        <TextLabel link>Explorar →</TextLabel>
      </Pressable>
    </Link>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={{ color: "#fff" }}>{label}</Text>
    </View>
  );
}
function TextLabel({
  children,
  muted,
  big,
  bigSection,
  section,
  link,
  small,
}: {
  children: React.ReactNode;
  muted?: boolean;
  big?: boolean;
  bigSection?: boolean;
  section?: boolean;
  link?: boolean;
  small?: boolean;
}) {
  return (
    <Text
      style={[
        styles.text,
        muted && styles.muted,
        big && styles.heroTitle,
        bigSection && styles.sectionTitle,
        section && styles.cardTitle,
        link && styles.link,
        small && styles.heroLabel,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { color: palette.ink, fontSize: 14, lineHeight: 20 },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  hero: {
    minHeight: 190,
    borderRadius: 10,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: "#b9d8f3",
    padding: 20,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
  },
  heroCopy: { flex: 1, gap: 10 },
  searchRow: { gap: 10 },
  heroLabel: {
    color: palette.blue,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    color: palette.dark,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    backgroundColor: palette.blue,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sectionHeading: { gap: 2 },
  sectionTitle: {
    color: palette.ink,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "700",
  },
  accessGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  accessCard: {
    width: "47%",
    flexGrow: 1,
    minWidth: 145,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 7,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  count: {
    backgroundColor: "#e7f2fc",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  link: { color: palette.blue, fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
