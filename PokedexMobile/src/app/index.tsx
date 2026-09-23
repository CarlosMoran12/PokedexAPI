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
      <View style={styles.brandHero}>
        <View style={styles.brandTop}>
          <View>
            <Text style={styles.brandEyebrow}>POKÉDEXMASTER</Text>
            <Text style={styles.brandTitle}>Tu Pokédex, más visual.</Text>
          </View>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>#</Text>
          </View>
        </View>
        <Text style={styles.brandSubtitle}>
          Busca especies, revisa sus datos y navega por tipos, regiones y generaciones.
        </Text>
        <View style={styles.searchPanel}>
          <SearchBox
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nombre o número..."
          />
          <Link
            href={{ pathname: "/pokemon", params: query.trim() ? { query } : {} }}
            asChild
          >
            <Pressable style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Explorar Pokédex</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <DemoNotice mode={store.mode} />
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

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fuego: { bg: "#FDE8E7", text: "#A83232", border: "#F4B4AE" },
  agua: { bg: "#E4F0FF", text: "#245A9A", border: "#B9D4F8" },
  planta: { bg: "#E6F5E8", text: "#2F6B3B", border: "#BBDDBF" },
  eléctrico: { bg: "#FFF4C7", text: "#806300", border: "#E9D778" },
  electrico: { bg: "#FFF4C7", text: "#806300", border: "#E9D778" },
  fantasma: { bg: "#ECE8F5", text: "#5D4B7A", border: "#CFC4E3" },
  veneno: { bg: "#F2E7F7", text: "#71458B", border: "#D8BCE4" },
  psíquico: { bg: "#FBE8F0", text: "#9A3E64", border: "#EABFD0" },
  psiquico: { bg: "#FBE8F0", text: "#9A3E64", border: "#EABFD0" },
  hada: { bg: "#FBEAF3", text: "#9A4E73", border: "#E8C5D6" },
  lucha: { bg: "#F7E8E4", text: "#874333", border: "#E4C1B8" },
  roca: { bg: "#F1EBD8", text: "#786B32", border: "#D8CCA2" },
  tierra: { bg: "#F5EEDB", text: "#765D28", border: "#DDCF9E" },
  hielo: { bg: "#E7F7FA", text: "#35717C", border: "#B9E0E7" },
  dragón: { bg: "#E8EAFB", text: "#4E57A3", border: "#C4C9ED" },
  dragon: { bg: "#E8EAFB", text: "#4E57A3", border: "#C4C9ED" },
  siniestro: { bg: "#E9EAEC", text: "#444B55", border: "#C8CCD1" },
  acero: { bg: "#E8EEF3", text: "#526878", border: "#C6D2DC" },
  volador: { bg: "#ECEBFA", text: "#5A5791", border: "#CBC9EA" },
  bicho: { bg: "#EEF4D8", text: "#61721F", border: "#D2DEA2" },
  normal: { bg: "#F1F2F4", text: "#5D6670", border: "#D5D8DD" },
};

function Badge({ label }: { label: string }) {
  const tone =
    TYPE_COLORS[label.trim().toLowerCase()] ?? {
      bg: "#EEF4FA",
      text: "#31577E",
      border: "#D7E1EC",
    };
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: tone.bg, borderColor: tone.border },
      ]}
    >
      <Text style={[styles.badgeText, { color: tone.text }]}>{label}</Text>
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

  brandHero: {
    backgroundColor: palette.dark,
    borderRadius: 18,
    padding: 22,
    gap: 14,
    borderTopWidth: 6,
    borderTopColor: palette.red,
  },
  brandTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  brandEyebrow: {
    color: "#9CC7F1",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  brandTitle: {
    color: palette.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 6,
  },
  brandSubtitle: {
    color: "#D6E5F4",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 620,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.red,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    color: palette.white,
    fontSize: 22,
    fontWeight: "900",
  },
  searchPanel: {
    backgroundColor: "#102F50",
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  heroCta: {
    minHeight: 46,
    backgroundColor: palette.red,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  heroCtaText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "900",
  },

  hero: {
    minHeight: 205,
    borderRadius: 16,
    backgroundColor: "#EAF3FB",
    borderWidth: 1,
    borderColor: "#B9D4EC",
    borderLeftWidth: 6,
    borderLeftColor: palette.red,
    padding: 22,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
    gap: 16,
  },
  heroCopy: { flex: 1, gap: 10 },
  searchRow: { gap: 10 },
  heroLabel: {
    color: palette.red,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: palette.dark,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "900",
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: "800" },

  sectionHeading: { gap: 2 },
  sectionTitle: {
    color: palette.ink,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "900",
  },
  accessGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  accessCard: {
    width: "47%",
    flexGrow: 1,
    minWidth: 145,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
    borderTopWidth: 4,
    borderTopColor: palette.blue,
    borderRadius: 14,
    padding: 16,
    gap: 9,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  count: {
    backgroundColor: "#EAF3FB",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  link: { color: palette.red, fontSize: 12, fontWeight: "900" },
  pressed: { opacity: 0.72 },
});
