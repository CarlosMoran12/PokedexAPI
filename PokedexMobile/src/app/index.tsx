import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ModuleIcon } from "@/components/module-icon";
import { finish, gradient } from "@/constants/visual-system";
import { HomeAutocomplete } from "@/components/home-autocomplete";
import { AnimatedPressable } from "@/components/animated-pressable";
import { Link, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
  palette,
} from "@/components/pokedex-ui";
import { Entrance, useAmbientMotion } from "@/components/home-motion";
import { usePokedexStore } from "@/data/pokedex-store";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const store = usePokedexStore();
  const { pokemon, regiones, tipos, generaciones } = store;
  const [query, setQuery] = useState("");
  const ambient = useAmbientMotion(7000);
  const reaction = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const navigating = useRef(false);
  useEffect(() => () => { reaction.stopAnimation(); buttonScale.stopAnimation(); }, [reaction, buttonScale]);
  const pressScale = (toValue: number) => Animated.timing(buttonScale, { toValue, duration: 100, useNativeDriver: true }).start();
  const explore = () => {
    if (navigating.current) return;
    navigating.current = true;
    Animated.timing(reaction, { toValue: 1, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      if (finished) router.push({ pathname: "/pokemon", params: query.trim() ? { query } : {} });
      reaction.setValue(0);
      navigating.current = false;
    });
  };

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
      <Entrance style={{ gap: 18 }}>
      {width >= 760 ? (
        <View style={styles.navbar}>
          <View style={styles.brand}>
            <ModuleIcon size={34} />
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
          width < 760 && { flexDirection: "column", padding: width < 380 ? 16 : 28 },
        ]}
      >
        <View style={[styles.showcaseCopy, width < 760 && styles.showcaseCopyMobile]}>
          <Text style={styles.kicker}>— EXPLORA. DESCUBRE. COMPLETA.</Text>
          <View>
            <Entrance><Text style={[styles.showcaseTitle, width < 380 && { fontSize: 36, lineHeight: 42 }]}>Tu Pokédex,</Text></Entrance>
            <Entrance delay={140}><Text style={[styles.showcaseTitle, styles.showcaseTitleAccent, width < 380 && { fontSize: 36, lineHeight: 42 }]}>más visual.</Text></Entrance>
          </View>
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
              <HomeAutocomplete
                pokemon={pokemon}
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nombre o número..."
              />
            </View>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable accessibilityRole="button" onPressIn={() => pressScale(0.98)} onPressOut={() => pressScale(1)} onPress={explore} style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Explorar Pokédex →</Text>
              </Pressable>
            </Animated.View>
          </View>

          <View style={[styles.statsRow, width < 760 && styles.statsRowMobile]}>
            <Stat value={pokemon.length} label="Pokémon" accent="red" />
            <Stat value={tipos.length} label="Tipos" accent="blue" />
            <Stat value={regiones.length} label="Regiones" accent="green" />
            <Stat value={generaciones.length} label="Generaciones" accent="purple" />
          </View>
        </View>

        {showcasePokemon ? (
          <View style={[styles.showcaseArt, width < 760 && styles.showcaseArtMobile]}>
            <View style={{ padding: 18 }}>
              <Animated.View pointerEvents="none" style={[styles.glowRing, StyleSheet.absoluteFill, {
                opacity: Animated.multiply(ambient.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }), reaction.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] })),
                transform: [{ scale: Animated.multiply(ambient.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }), reaction.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] })) }, { rotate: ambient.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '12deg'] }) }],
              }]} />
              <PokemonImage key={showcasePokemon.IdPokemon} pokemon={showcasePokemon} size="detail" breathe />
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
            <PokemonImage key={featured.IdPokemon} pokemon={featured} size="hero" breathe />
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
              <AnimatedPressable pressScale={0.96}>
                <Text style={styles.sectionLink}>Ver todos →</Text>
              </AnimatedPressable>
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
                <AnimatedPressable
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
                </AnimatedPressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={styles.sectionHeading}>
        <View style={styles.quickHeadingRow}>
          <View style={styles.quickHeadingIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <MaterialCommunityIcons name="flash-outline" size={20} color={palette.white} />
          </View>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        </View>
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

        />
        <AccessCard
          href="/tipos"
          title="Tipos"
          count={tipos.length}
          description="Catálogo y relaciones Pokémon–Tipo."
          tone="blue"

        />
        <AccessCard
          href="/regiones"
          title="Regiones"
          count={regiones.length}
          description="Organiza las regiones del mundo Pokémon."
          tone="green"

        />
        <AccessCard
          href="/generaciones"
          title="Generaciones"
          count={generaciones.length}
          description="Relaciona generaciones con regiones."
          tone="purple"

        />
      </View>
      </Entrance>
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
      <AnimatedPressable
        pressScale={0.97}
        style={StyleSheet.flatten([
          styles.navLink,
          active && styles.navLinkActive,
        ])}
      >
        <Text style={[styles.navLinkText, active && styles.navLinkTextActive]}>
          {label}
        </Text>
      </AnimatedPressable>
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
  const pulse = useAmbientMotion(3000);
  return (
    <View style={styles.stat}>
      <Animated.View style={[styles.statDot, styles[`stat_${accent}`], { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]} />
      <View>
        <Entrance key={value}><Text style={styles.statValue}>{value}</Text></Entrance>
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
}: {
  href: "/pokemon" | "/tipos" | "/regiones" | "/generaciones";
  title: string;
  count: number;
  description: string;
  tone: "red" | "blue" | "green" | "purple";
}) {
  return (
    <Link href={href} asChild>
      <AnimatedPressable
        style={({ pressed }) => [
          styles.quickPressable,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.quickCard, styles[`quick_${tone}`]]}>
          <ModuleIcon tone={tone} />

          <View style={styles.quickCopy}>
            <View style={styles.quickTitleRow}>
              <Text style={styles.quickTitle}>{title}</Text>

              <View style={styles.quickCountBadge}>
                <Text style={styles.quickCount}>{count}</Text>
              </View>
            </View>

            <Text style={styles.quickDescription}>{description}</Text>
          </View>

          <View style={styles.quickArrowBox}>
            <Text style={styles.quickArrow}>{">"}</Text>
          </View>
        </View>
      </AnimatedPressable>
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
    ...finish.panel,
    flexWrap: "wrap",
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
    ...finish.panel,
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
  showcaseCopyMobile: { flex: 0, width: "100%" },
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
  searchInputWrap: { flex: 1, minWidth: 0 },
  heroCta: {
    ...finish.red,
    minHeight: 48,
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
  statsRowMobile: {
    width: "100%",
    gap: 14,
    justifyContent: "space-between",
  },
  stat: { paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 9, minWidth: 100 },
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
  showcaseArtMobile: {
    flex: 0,
    minWidth: 0,
    width: "100%",
    marginTop: 8,
    paddingVertical: 8,
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
    ...finish.panel,
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
  quickHeadingRow: {
    height: 31,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickHeadingIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt,
    ...gradient(`${palette.surfaceAlt}, #164D80`),
    borderWidth: 1,
    borderColor: "#285487",
    boxShadow: "0px 2px 7px rgba(59,130,246,0.14), inset 0px 1px 1px rgba(255,255,255,0.08)",
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
    ...finish.card,
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

  quickGrid: {
    width: "100%",
    gap: 14,
  },

  quickPressable: {
    width: "100%",
  },

  quickCard: {
    ...finish.panel,
    width: "100%",
    minHeight: 112,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  quick_red: {
    ...gradient("#241B2A, #151625"),
    backgroundColor: "#181620",
    borderColor: "#6C2940",
  },

  quick_blue: {
    ...gradient("#14293F, #0D1A2A"),
    backgroundColor: "#101D2B",
    borderColor: "#25577E",
  },

  quick_green: {
    ...gradient("#15332D, #0D211E"),
    backgroundColor: "#10231F",
    borderColor: "#24664F",
  },

  quick_purple: {
    ...gradient("#271F3F, #16162B"),
    backgroundColor: "#19172B",
    borderColor: "#543782",
  },

  quickIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  quickIcon_red: {
    backgroundColor: "#59192A",
  },

  quickIcon_blue: {
    backgroundColor: "#143F65",
  },

  quickIcon_green: {
    backgroundColor: "#12503E",
  },

  quickIcon_purple: {
    backgroundColor: "#45247A",
  },

  quickIconText: {
    color: palette.white,
    fontSize: 21,
    fontWeight: "900",
  },

  quickCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },

  quickTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  quickTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900",
    flexShrink: 1,
  },

  quickCountBadge: {
    ...finish.input,
    minWidth: 32,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 13,
    backgroundColor: "#263142",
    borderWidth: 1,
    borderColor: "#3B4A5F",
    alignItems: "center",
    justifyContent: "center",
  },

  quickCount: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "900",
  },

  quickDescription: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  quickArrowBox: {
    ...finish.red,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FF3652",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  quickArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "900",
  },

  pressed: { opacity: 0.75 },
});

