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
    () => pokemon.find((item) => item.NumeroPokedex === 94) ?? pokemon[0],
    [pokemon],
  );
  const showcasePokemon = useMemo(
    () =>
      pokemon.find((item) => item.NumeroPokedex === 448) ??
      pokemon.find((item) => item.NumeroPokedex === 4) ??
      featured,
    [featured, pokemon],
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
      {width >= 760 ? (
        <View style={styles.navbar}>
          <View style={styles.brand}>
            <View style={styles.brandBall}>
              <Text style={styles.brandBallText}>●</Text>
            </View>
            <Text style={styles.brandName}>
              POKÉDEX<Text style={styles.brandAccent}>MASTER</Text>
            </Text>
          </View>

          <View style={styles.navLinks}>
            <NavLink href="/" label="Inicio" active />
            <NavLink href="/pokemon" label="Pokédex" />
            <NavLink href="/tipos" label="Tipos" />
            <NavLink href="/regiones" label="Regiones" />
            <NavLink href="/generaciones" label="Generaciones" />
          </View>

          <View style={styles.navBadge}>
            <Text style={styles.navBadgeText}>#</Text>
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.showcase,
          width < 760 && { flexDirection: "column" },
        ]}
      >
        <View style={styles.showcaseCopy}>
          <Text style={styles.kicker}>— EXPLORA. DESCUBRE. COMPLETA.</Text>
          <Text style={styles.showcaseTitle}>
            Tu Pokédex,{"\n"}
            <Text style={styles.showcaseTitleAccent}>más visual.</Text>
          </Text>
          <Text style={styles.showcaseSubtitle}>
            Busca especies, revisa sus datos y navega por tipos, regiones y generaciones.
          </Text>

          <View
            style={[
              styles.searchPanel,
              width < 700 && { flexDirection: "column" },
            ]}
          >
            <View style={styles.searchInputWrap}>
              <SearchBox
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nombre o número..."
              />
            </View>
            <Link
              href={{ pathname: "/pokemon", params: query.trim() ? { query } : {} }}
              asChild
            >
              <Pressable style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Explorar Pokédex →</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.statsRow}>
            <Stat value={pokemon.length} label="Pokémon" accent="red" />
            <Stat value={tipos.length} label="Tipos" accent="blue" />
            <Stat value={regiones.length} label="Regiones" accent="green" />
            <Stat value={generaciones.length} label="Generaciones" accent="purple" />
          </View>
        </View>

        {showcasePokemon ? (
          <View style={styles.showcaseArt}>
            <View style={styles.glowRing}>
              <PokemonImage pokemon={showcasePokemon} size="detail" />
            </View>
            <Text style={styles.showcasePokemonName}>{showcasePokemon.Nombre}</Text>
            <Text style={styles.showcasePokemonMeta}>
              #{String(showcasePokemon.NumeroPokedex).padStart(3, "0")}
            </Text>
          </View>
        ) : null}
      </View>

      <DemoNotice mode={store.mode} />

      {featured ? (
        <View
          style={[
            styles.featured,
            width < 700 && { flexDirection: "column", alignItems: "stretch" },
          ]}
        >
          <View style={styles.featuredImage}>
            <PokemonImage pokemon={featured} size="hero" />
          </View>

          <View style={styles.featuredCopy}>
            <Text style={styles.featuredKicker}>
              DESTACADO · {featuredRegion?.Nombre ?? "REGIÓN NO DISPONIBLE"}
            </Text>
            <Text style={styles.featuredTitle}>{featured.Nombre}</Text>
            <Text style={styles.featuredNumber}>
              #{String(featured.NumeroPokedex).padStart(3, "0")}
            </Text>

            <View style={styles.typeRow}>
              {featuredTypes.map((type) => (
                <Badge key={type} label={type} />
              ))}
            </View>

            <Text style={styles.featuredDescription}>
              Consulta sus datos principales, generación, región y relaciones de tipo.
            </Text>
          </View>

          <ActionButton
            label="Ver detalle →"
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
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>🔥 Pokémon destacados</Text>
            <Link href="/pokemon" asChild>
              <Pressable>
                <Text style={styles.sectionLink}>Ver todos →</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.pokemonGrid}>
            {pokemon.slice(0, 4).map((item) => {
              const itemTypes = store.pokemonTipos
                .filter((relation) => relation.IdPokemon === item.IdPokemon)
                .map(
                  (relation) =>
                    store.tipos.find((type) => type.IdTipo === relation.IdTipo)
                      ?.Nombre,
                )
                .filter(Boolean) as string[];

              return (
                <Pressable
                  key={item.IdPokemon}
                  style={({ pressed }) => [
                    styles.pokemonCard,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: "/pokemon/[id]",
                      params: { id: String(item.IdPokemon) },
                    })
                  }
                >
                  <PokemonImage pokemon={item} />
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{item.Nombre}</Text>
                    <Text style={styles.cardNumber}>
                      #{String(item.NumeroPokedex).padStart(3, "0")}
                    </Text>
                    <View style={styles.typeRow}>
                      {itemTypes.slice(0, 2).map((type) => (
                        <Badge key={type} label={type} compact />
                      ))}
                    </View>
                    <Text style={styles.cardLink}>Ver detalle →</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>▦ Accesos rápidos</Text>
        <Text style={styles.sectionSubtitle}>
          Consulta los catálogos disponibles.
        </Text>
      </View>

      <View style={styles.quickGrid}>
        <AccessCard
          href="/pokemon"
          title="Pokédex"
          count={pokemon.length}
          description="Consulta, filtra y administra Pokémon."
          tone="red"
          symbol="◉"
        />
        <AccessCard
          href="/tipos"
          title="Tipos"
          count={tipos.length}
          description="Catálogo y relaciones Pokémon–Tipo."
          tone="blue"
          symbol="◆"
        />
        <AccessCard
          href="/regiones"
          title="Regiones"
          count={regiones.length}
          description="Organiza las regiones del mundo Pokémon."
          tone="green"
          symbol="▥"
        />
        <AccessCard
          href="/generaciones"
          title="Generaciones"
          count={generaciones.length}
          description="Relaciona generaciones con regiones."
          tone="purple"
          symbol="≋"
        />
      </View>
    </ScreenShell>
  );
}

function NavLink({
  href,
  label,
  active = false,
}: {
  href: "/" | "/pokemon" | "/tipos" | "/regiones" | "/generaciones";
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={StyleSheet.flatten([
          styles.navLink,
          active && styles.navLinkActive,
        ])}
      >
        <Text style={[styles.navLinkText, active && styles.navLinkTextActive]}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent: "red" | "blue" | "green" | "purple";
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statDot, styles[`stat_${accent}`]]} />
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function AccessCard({
  href,
  title,
  count,
  description,
  tone,
  symbol,
}: {
  href: "/pokemon" | "/tipos" | "/regiones" | "/generaciones";
  title: string;
  count: number;
  description: string;
  tone: "red" | "blue" | "green" | "purple";
  symbol: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) =>
          StyleSheet.flatten([
            styles.quickCard,
            styles[`quick_${tone}`],
            pressed && styles.pressed,
          ])
        }
      >
        <View style={[styles.quickIcon, styles[`quickIcon_${tone}`]]}>
          <Text style={styles.quickIconText}>{symbol}</Text>
        </View>

        <View style={styles.quickCopy}>
          <View style={styles.quickTitleRow}>
            <Text style={styles.quickTitle}>{title}</Text>
            <Text style={styles.quickCount}>{count}</Text>
          </View>
          <Text style={styles.quickDescription}>{description}</Text>
        </View>

        <Text style={styles.quickArrow}>→</Text>
      </Pressable>
    </Link>
  );
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fuego: { bg: "#4A1D12", text: "#FF9B6A", border: "#78341F" },
  agua: { bg: "#132E50", text: "#7EB8FF", border: "#285487" },
  planta: { bg: "#123523", text: "#6FE0A0", border: "#275C42" },
  eléctrico: { bg: "#3A3110", text: "#F8D95A", border: "#6D5B20" },
  electrico: { bg: "#3A3110", text: "#F8D95A", border: "#6D5B20" },
  fantasma: { bg: "#2D1F4E", text: "#C8A5FF", border: "#513A7D" },
  veneno: { bg: "#3B1643", text: "#E48AF2", border: "#682874" },
  psíquico: { bg: "#431C33", text: "#FF8DBB", border: "#723454" },
  psiquico: { bg: "#431C33", text: "#FF8DBB", border: "#723454" },
  hada: { bg: "#421D35", text: "#F4A1CB", border: "#70405A" },
  lucha: { bg: "#461F22", text: "#FF9B95", border: "#77373B" },
  roca: { bg: "#393322", text: "#D8C983", border: "#605536" },
  tierra: { bg: "#3D2B1E", text: "#DDA86E", border: "#6A4A31" },
  hielo: { bg: "#14343B", text: "#8CE5F3", border: "#28616B" },
  dragón: { bg: "#20254E", text: "#9AA8FF", border: "#3F4A83" },
  dragon: { bg: "#20254E", text: "#9AA8FF", border: "#3F4A83" },
  siniestro: { bg: "#252A33", text: "#C4CCD8", border: "#454D5B" },
  acero: { bg: "#21303C", text: "#A9C4D8", border: "#3B566B" },
  volador: { bg: "#242846", text: "#B0B6F2", border: "#454D7B" },
  bicho: { bg: "#2A3416", text: "#BFD971", border: "#4D612B" },
  normal: { bg: "#29313A", text: "#C9D2DC", border: "#4A5764" },
};

function Badge({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  const tone =
    TYPE_COLORS[label.trim().toLowerCase()] ?? {
      bg: "#17263A",
      text: "#C8D7E8",
      border: "#304762",
    };

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor: tone.bg, borderColor: tone.border },
      ]}
    >
      <Text style={[styles.badgeText, { color: tone.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    minHeight: 64,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#081522",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.red,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "#EEF3F8",
  },
  brandBallText: { color: "#0B1220", fontSize: 8 },
  brandName: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  brandAccent: { color: palette.red },
  navLinks: { flexDirection: "row", alignItems: "center", gap: 4 },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  navLinkActive: { borderBottomColor: palette.red },
  navLinkText: { color: palette.muted, fontSize: 13, fontWeight: "700" },
  navLinkTextActive: { color: palette.ink },
  navBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#2366A8",
    backgroundColor: "#0F2A46",
    alignItems: "center",
    justifyContent: "center",
  },
  navBadgeText: { color: palette.ink, fontWeight: "900", fontSize: 18 },

  showcase: {
    minHeight: 390,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#153253",
    backgroundColor: "#071522",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    gap: 24,
  },
  showcaseCopy: { flex: 1.3, gap: 16 },
  kicker: {
    color: palette.red,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  showcaseTitle: {
    color: palette.ink,
    fontSize: 46,
    lineHeight: 50,
    fontWeight: "900",
  },
  showcaseTitleAccent: { color: palette.red },
  showcaseSubtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 620,
  },
  searchPanel: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch",
    maxWidth: 760,
  },
  searchInputWrap: { flex: 1, minWidth: 220 },
  heroCta: {
    minWidth: 180,
    borderRadius: 10,
    paddingHorizontal: 18,
    backgroundColor: palette.red,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCtaText: { color: palette.white, fontSize: 13, fontWeight: "900" },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 22,
    marginTop: 4,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 9, minWidth: 100 },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  stat_red: { backgroundColor: palette.red },
  stat_blue: { backgroundColor: palette.blue },
  stat_green: { backgroundColor: "#22C983" },
  stat_purple: { backgroundColor: "#9B6CFF" },
  statValue: { color: palette.ink, fontSize: 18, fontWeight: "900" },
  statLabel: { color: palette.muted, fontSize: 11 },
  showcaseArt: {
    flex: 0.7,
    minWidth: 240,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  glowRing: {
    padding: 18,
    borderRadius: 999,
    backgroundColor: "#0C2237",
    borderWidth: 1,
    borderColor: "#17456C",
  },
  showcasePokemonName: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  showcasePokemonMeta: { color: palette.muted, fontSize: 12 },

  featured: {
    minHeight: 210,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A315E",
    borderLeftWidth: 8,
    borderLeftColor: palette.red,
    backgroundColor: "#0E162A",
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },
  featuredImage: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#21173D",
  },
  featuredCopy: { flex: 1, gap: 8 },
  featuredKicker: {
    color: palette.red,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  featuredTitle: {
    color: palette.ink,
    fontSize: 32,
    fontWeight: "900",
  },
  featuredNumber: { color: palette.muted, fontSize: 14 },
  featuredDescription: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 520,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionHeading: { gap: 2 },
  sectionTitle: {
    color: palette.ink,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "900",
  },
  sectionSubtitle: { color: palette.muted, fontSize: 13 },
  sectionLink: { color: palette.red, fontSize: 12, fontWeight: "900" },

  pokemonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  pokemonCard: {
    width: "23%",
    flexGrow: 1,
    minWidth: 210,
    minHeight: 165,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardCopy: { flex: 1, gap: 5 },
  cardTitle: { color: palette.ink, fontSize: 17, fontWeight: "900" },
  cardNumber: { color: palette.muted, fontSize: 12 },
  cardLink: { color: palette.red, fontSize: 12, fontWeight: "900" },

  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  badge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeCompact: { paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: "800" },

  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  quickCard: {
    width: "23%",
    flexGrow: 1,
    minWidth: 220,
    minHeight: 125,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quick_red: { backgroundColor: "#23131B", borderColor: "#7D2940" },
  quick_blue: { backgroundColor: "#0D2035", borderColor: "#1F568D" },
  quick_green: { backgroundColor: "#0D2722", borderColor: "#176B52" },
  quick_purple: { backgroundColor: "#21163D", borderColor: "#57349B" },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickIcon_red: { backgroundColor: "#4B1725" },
  quickIcon_blue: { backgroundColor: "#123B62" },
  quickIcon_green: { backgroundColor: "#114A3B" },
  quickIcon_purple: { backgroundColor: "#3E226F" },
  quickIconText: { color: palette.white, fontSize: 20, fontWeight: "900" },
  quickCopy: { flex: 1, gap: 4 },
  quickTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  quickTitle: { color: palette.ink, fontSize: 16, fontWeight: "900" },
  quickCount: { color: palette.muted, fontSize: 12, fontWeight: "800" },
  quickDescription: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  quickArrow: { color: palette.ink, fontSize: 22 },

  pressed: { opacity: 0.75 },
});
