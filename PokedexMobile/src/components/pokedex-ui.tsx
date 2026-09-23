import { Image } from "expo-image";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { MaxContentWidth } from "@/constants/theme";
import {
  isLegacyAutomaticPokemonImage,
  type Pokemon,
} from "@/data/pokedex-store";

export const palette = {
  ink: "#132238",
  blue: "#2F6FB3",
  dark: "#173F6B",
  red: "#E63946",
  yellow: "#F4C542",
  muted: "#6B7A90",
  line: "#D7E1EC",
  panel: "#EAF3FB",
  canvas: "#F4F7FB",
  white: "#FFFFFF",
};

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
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
          style={styles.backButton}
        >
          <ThemedText style={styles.backText}>‹</ThemedText>
        </Pressable>
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
          <ThemedText style={styles.headerBadgeText}>#</ThemedText>
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
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#8090a4"
      style={styles.search}
    />
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
    <Pressable
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
          secondary && { color: palette.dark },
          danger && styles.darkActionText,
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, customChipStyle, selected && styles.selectedChip]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={[styles.chip, customChipStyle]}>{content}</View>
  );
}

export function PokemonImage({
  pokemon,
  size = "card",
}: {
  pokemon: Pokemon;
  size?: "card" | "hero" | "detail";
}) {
  const storedImage = pokemon.Imagen?.trim() || null;
  const uri =
    storedImage && !isLegacyAutomaticPokemonImage(pokemon)
      ? storedImage
      : null;
  const [failed, setFailed] = useState(false);
  const dimension = size === "hero" ? 130 : size === "detail" ? 200 : 100;
  return (
    <View
      style={[
        styles.imageFrame,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      {!uri || failed ? (
        <ThemedText
          accessibilityLabel={`${pokemon.Nombre}: sin imagen disponible`}
          style={styles.fallback}
        >
          ?
        </ThemedText>
      ) : (
        <Image
          key={uri}
          accessibilityLabel={pokemon.Nombre}
          source={{ uri }}
          contentFit="contain"
          onError={() => setFailed(true)}
          style={{ width: dimension - 12, height: dimension - 12 }}
        />
      )}
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
    <View style={styles.empty}>
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
    <View style={styles.empty}>
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
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerCopy: { flex: 1, minWidth: 0 },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 5,
    backgroundColor: palette.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: palette.white, fontSize: 30, lineHeight: 32 },
  eyebrow: {
    color: palette.blue,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  heading: { color: palette.ink, fontSize: 28, lineHeight: 35, marginTop: 5 },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: { color: palette.white, fontSize: 22, fontWeight: "800" },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  search: {
    height: 46,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    borderRadius: 5,
    paddingHorizontal: 14,
    color: palette.ink,
    fontSize: 14,
  },
  sectionHeading: { gap: 2 },
  sectionTitle: { color: palette.ink, fontSize: 23, lineHeight: 30 },
  resultCount: { color: palette.blue, fontSize: 12, fontWeight: "700" },
  chip: {
    minHeight: 40,
    justifyContent: "center",
    backgroundColor: "#EEF4FA",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    alignSelf: "flex-start",
  },
  selectedChip: {
    backgroundColor: palette.dark,
    borderColor: palette.dark,
  },
  chipText: { color: "#31577E", fontSize: 12, fontWeight: "800" },
  selectedText: { color: palette.white },
  actionButton: {
    backgroundColor: palette.blue,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#B9CDE1",
  },
  dangerButton: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#F2B8BD",
  },
  disabledButton: { opacity: 0.45 },
  actionText: { color: palette.white, fontSize: 13, fontWeight: "800" },
  darkActionText: { color: "#A52E38" },
  imageFrame: {
    backgroundColor: "#E3F0FB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fallback: { color: palette.dark, fontSize: 52, fontWeight: "900" },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 30,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    borderRadius: 12,
  },
  demoNotice: {
    borderLeftWidth: 3,
    borderLeftColor: palette.blue,
    backgroundColor: "#EAF3FB",
    padding: 9,
  },
  demoText: { color: "#41617e", fontSize: 11 },
  unsupportedNote: {
    borderLeftWidth: 3,
    borderLeftColor: "#9aaabd",
    backgroundColor: "#f1f5f9",
    padding: 9,
  },
});

export const uiStyles = styles;
