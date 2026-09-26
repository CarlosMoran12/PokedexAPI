import { palette, finish, gradient } from "@/constants/visual-system";
import { ModuleIcon } from "./module-icon";
import { PokemonArtwork } from "./pokemon-artwork";
import { AnimatedPressable } from "@/components/animated-pressable";
import { router } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FloatingPokemon } from "./home-motion";
import { ThemedText } from "@/components/themed-text";
import { MaxContentWidth } from "@/constants/theme";
import {
  type Pokemon,
} from "@/data/pokedex-store";

export { palette } from '@/constants/visual-system';


export function ScreenShell({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 },
      ]}
    >
      {children}
    </View>
  );
  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled={Platform.OS !== "web"}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.safeArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.safeArea}>{content}</View>
      )}
    </KeyboardAvoidingView>
  );
}

export function ScreenHeader({
  eyebrow = "POKÉDEXMASTER",
  title,
  subtitle,
  back = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  return (
    <View style={styles.header}>
      {back ? (
        <AnimatedPressable
          pressScale={0.95}
          accessibilityLabel="Volver"
          accessibilityRole="button"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
          style={styles.backButton}
        >
          <ThemedText style={styles.backText}>‹</ThemedText>
        </AnimatedPressable>
      ) : null}
      <View style={styles.headerCopy}>
        <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
        <ThemedText type="subtitle" style={styles.heading}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={styles.muted}>{subtitle}</ThemedText>
        ) : null}
      </View>
      {back ? null : (
        <View style={styles.headerBadge}>
          <ModuleIcon size={44} tone={title.toLowerCase().includes("tipo") ? "blue" : title.toLowerCase().includes("regi") ? "green" : title.toLowerCase().includes("generaci") ? "purple" : "red"} />
        </View>
      )}
    </View>
  );
}

export function SearchBox({
  value,
  onChangeText,
  placeholder = "Buscar...",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const focus = useRef(new Animated.Value(0)).current;
  useEffect(() => () => focus.stopAnimation(), [focus]);
  const animateFocus = (toValue: number) => Animated.timing(focus, { toValue, duration: 180, useNativeDriver: true }).start();
  return (
    <View>
    <TextInput
      onFocus={() => animateFocus(1)}
      onBlur={() => animateFocus(0)}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#8090a4"
      style={styles.search}
    />
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 10, borderWidth: 1, borderColor: palette.blue, opacity: focus }]} />
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        secondary && styles.secondaryButton,
        danger && styles.dangerButton,
        disabled && styles.disabledButton,
      ]}
    >
      <ThemedText
        style={[
          styles.actionText,
          secondary && { color: palette.ink },
          danger && styles.darkActionText,
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  backgroundColor,
  textColor,
  borderColor,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}) {
  const customChipStyle =
    !selected && (backgroundColor || borderColor)
      ? {
          ...gradient(`${backgroundColor ?? "#EEF4FA"}, ${backgroundColor ?? "#EEF4FA"}`),
          backgroundColor: backgroundColor ?? "#EEF4FA",
          borderColor: borderColor ?? palette.line,
        }
      : undefined;
  const customTextStyle =
    !selected && textColor ? { color: textColor } : undefined;

  const content = (
    <ThemedText
      style={[
        styles.chipText,
        customTextStyle,
        selected && styles.selectedText,
      ]}
    >
      {label}
    </ThemedText>
  );
  return onPress ? (
    <AnimatedPressable pressScale={0.96}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, customChipStyle, selected && styles.selectedChip, disabled && styles.disabledButton]}
    >
      {content}
    </AnimatedPressable>
  ) : (
    <View style={[styles.chip, customChipStyle]}>{content}</View>
  );
}

export function PokemonImage({
  pokemon,
  size = "card",
  breathe = false,
}: {
  pokemon: Pokemon;
  breathe?: boolean;
  size?: "card" | "hero" | "detail";
}) {
  const dimension = size === "hero" ? 130 : size === "detail" ? 200 : 100;
  const artwork = <PokemonArtwork number={pokemon.NumeroPokedex} current={pokemon.Imagen} name={pokemon.Nombre} style={{ width: dimension - 12, height: dimension - 12 }} />;
  return (
    <View style={[styles.imageFrame, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}>
      {breathe ? <FloatingPokemon>{artwork}</FloatingPokemon> : artwork}
    </View>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.empty}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.muted}>{message}</ThemedText>
    </View>
  );
}

export function SectionTitle({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <View style={styles.sectionHeading}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {count !== undefined ? (
        <ThemedText style={styles.resultCount}>{count} resultados</ThemedText>
      ) : null}
    </View>
  );
}

export function DemoNotice({ mode }: { mode: "real" | "demo" }) {
  if (mode === "real") return null;
  const message =
    mode === "demo"
      ? "Modo demostración · cambios activos durante esta sesión"
      : "API real · datos sincronizados con PokedexAPI";
  return (
    <View style={styles.demoNotice}>
      <ThemedText style={styles.demoText}>{message}</ThemedText>
    </View>
  );
}

export function LoadingState() {
  return (
    <View accessibilityRole="progressbar" style={[styles.empty, { borderColor: palette.blue }]}>
      <ActivityIndicator color={palette.blue} />
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View accessibilityRole="alert" style={[styles.empty, { borderColor: "#6E2635" }]}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        No se pudo cargar
      </ThemedText>
      <ThemedText style={styles.muted}>{message}</ThemedText>
      <ActionButton label="Reintentar" onPress={onRetry} />
    </View>
  );
}

export function confirmDestructive(
  message: string,
  onConfirm: () => void | Promise<void>,
) {
  const run = () => {
    Promise.resolve()
      .then(onConfirm)
      .catch(() => {
        /* El store conserva el error visible. */
      });
  };
  if (Platform.OS === "web") {
    if (globalThis.confirm(message)) run();
    return;
  }
  Alert.alert("Confirmar eliminación", message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Eliminar", style: "destructive", onPress: run },
  ]);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas },
  scrollContent: { alignItems: "center" },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: 20,
    gap: 18,
  },
  header: { paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerCopy: { flex: 1, minWidth: 0 },
  backButton: {
    ...finish.card,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: palette.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: palette.white, fontSize: 30, lineHeight: 32 },
  eyebrow: {
    color: palette.red,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  heading: { color: palette.ink, fontSize: 28, lineHeight: 35, marginTop: 5 },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.red,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: { color: palette.white, fontSize: 22, fontWeight: "800" },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  search: {
    ...finish.input,
    height: 48,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: palette.ink,
    fontSize: 14,
  },
  sectionHeading: { gap: 2 },
  sectionTitle: { color: palette.ink, fontSize: 23, lineHeight: 30 },
  resultCount: { color: palette.blue, fontSize: 12, fontWeight: "700" },
  chip: {
    ...finish.card,
    minHeight: 40,
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    alignSelf: "flex-start",
  },
  selectedChip: {
    ...gradient("#438FFF, #205BBC"),
    backgroundColor: palette.blue,
    borderColor: palette.blue,
  },
  chipText: { color: "#C9D6E8", fontSize: 12, fontWeight: "800" },
  selectedText: { color: palette.white },
  actionButton: {
    ...finish.red,
    backgroundColor: palette.red,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    ...finish.card,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.line,
  },
  dangerButton: {
    ...gradient("#351A25, #24121B"),
    backgroundColor: "#2B1219",
    borderWidth: 1,
    borderColor: "#6E2635",
  },
  disabledButton: { opacity: 0.45 },
  actionText: { color: palette.white, fontSize: 13, fontWeight: "800" },
  darkActionText: { color: "#FF7C8E" },
  imageFrame: {
    ...finish.panel,
    backgroundColor: "#12243A",
    borderWidth: 1,
    borderColor: "#203A5A",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fallback: { color: palette.muted, fontSize: 52, fontWeight: "900" },
  empty: {
    ...finish.panel,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 30,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    borderRadius: 12,
  },
  demoNotice: {
    borderLeftWidth: 3,
    borderLeftColor: palette.blue,
    backgroundColor: palette.surface,
    padding: 9,
  },
  demoText: { color: palette.muted, fontSize: 11 },
  unsupportedNote: {
    borderLeftWidth: 3,
    borderLeftColor: "#51657F",
    backgroundColor: palette.surface,
    padding: 9,
  },
});

export const uiStyles = styles;
