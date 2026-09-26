import { finish, gradient } from "@/constants/visual-system";
import { AnimatedPressable } from "@/components/animated-pressable";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  ActionButton,
  confirmDestructive,
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingState,
  palette,
  ScreenHeader,
  ScreenShell,
  SearchBox,
} from "@/components/pokedex-ui";
import {
  usePokedexStore,
  type Generacion,
  type Region,
  type Tipo,
} from "@/data/pokedex-store";

type CatalogKind = "tipos" | "regiones" | "generaciones";
type CatalogItem = Tipo | Region | Generacion;

export function CatalogScreen({ kind }: { kind: CatalogKind }) {
  const store = usePokedexStore();
  const items =
    kind === "tipos"
      ? store.tipos
      : kind === "regiones"
        ? store.regiones
        : store.generaciones;
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [regionId, setRegionId] = useState(0);
  const [validation, setValidation] = useState("");
  const [success, setSuccess] = useState("");
  const filtered = items.filter((item) =>
    item.Nombre.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const title =
    kind === "tipos"
      ? "Tipos"
      : kind === "regiones"
        ? "Regiones"
        : "Generaciones";
  if (store.loading && items.length === 0)
    return (
      <ScreenShell>
        <ScreenHeader title={title} back />
        <LoadingState />
      </ScreenShell>
    );
  if (store.error && items.length === 0)
    return (
      <ScreenShell>
        <ScreenHeader title={title} back />
        <ErrorState
          message={store.error}
          onRetry={() => {
            void store.reload();
          }}
        />
      </ScreenShell>
    );

  const beginEdit = (item?: CatalogItem) => {
    setValidation("");
    setSuccess("");
    setRegionId(store.regiones[0]?.IdRegion ?? 0);
    setEditorOpen(true);
    setEditing(item ?? null);
    setDraft(item?.Nombre ?? "");
    if (kind === "generaciones" && item && "IdRegion" in item)
      setRegionId(item.IdRegion);
  };

  const save = async () => {
    setValidation("");
    if (!draft.trim()) return setValidation("Escribe un nombre.");
    if (
      kind === "generaciones" &&
      !store.regiones.some((region) => region.IdRegion === regionId)
    )
      return setValidation("Selecciona una región disponible.");
    try {
      if (kind === "tipos") {
        if (editing && "IdTipo" in editing) {
          await store.updateTipo(editing.IdTipo, { Nombre: draft.trim() });
        } else {
          await store.createTipo({ Nombre: draft.trim() });
        }
      }
      if (kind === "regiones") {
        if (editing && "IdRegion" in editing && !("IdGeneracion" in editing)) {
          await store.updateRegion(editing.IdRegion, { Nombre: draft.trim() });
        } else {
          await store.createRegion({ Nombre: draft.trim() });
        }
      }
      if (kind === "generaciones") {
        if (editing && "IdGeneracion" in editing) {
          await store.updateGeneracion(editing.IdGeneracion, {
            Nombre: draft.trim(),
            IdRegion: regionId,
          });
        } else {
          await store.createGeneracion({
            Nombre: draft.trim(),
            IdRegion: regionId,
          });
        }
      }
      setEditing(null);
      setEditorOpen(false);
      setDraft("");
      setSuccess("Cambios guardados.");
    } catch (cause) {
      setValidation(
        cause instanceof Error ? cause.message : "No se pudo guardar.",
      );
    }
  };

  const remove = (item: CatalogItem) =>
    confirmDestructive(`¿Eliminar ${item.Nombre}?`, async () => {
      if (kind === "tipos" && "IdTipo" in item)
        await store.deleteTipo(item.IdTipo);
      if (
        kind === "regiones" &&
        "IdRegion" in item &&
        !("IdGeneracion" in item)
      )
        await store.deleteRegion(item.IdRegion);
      if (kind === "generaciones" && "IdGeneracion" in item)
        await store.deleteGeneracion(item.IdGeneracion);
    });

  return (
    <ScreenShell>
      <ScreenHeader
        title={title}
        subtitle="Explora y administra este catálogo."
        back
      />
      <DemoNotice mode={store.mode} />
      {store.error ? (
        <ErrorState
          message={store.error}
          onRetry={() => {
            void store.reload();
          }}
        />
      ) : null}
      <View style={styles.actions}>
        {success ? (
          <Text accessibilityLiveRegion="polite" style={{ color: "#6FE0A0" }}>
            {success}
          </Text>
        ) : null}
        <SearchBox
          value={query}
          onChangeText={setQuery}
          placeholder={`Buscar ${title.toLowerCase()}...`}
        />
        <ActionButton
          label={`+ Crear ${kind === "tipos" ? "tipo" : kind === "regiones" ? "región" : "generación"}`}
          disabled={store.loading}
          onPress={() => beginEdit()}
        />
      </View>
      {editorOpen ? (
        <View style={styles.editor}>
          <TextLabel bold>Nombre</TextLabel>
          {validation ? (
            <Text accessibilityRole="alert" style={{ color: "#FF7C8E" }}>
              {validation}
            </Text>
          ) : null}
          {kind === "generaciones" && !store.regiones.length ? (
            <Text style={{ color: palette.muted }}>
              Crea una región antes de guardar una generación.
            </Text>
          ) : null}
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            placeholder="Nombre"
            placeholderTextColor="#8090a4"
            style={styles.input}
          />
          {kind === "generaciones" ? (
            <View style={styles.regionChoices}>
              {store.regiones.map((region) => (
                <AnimatedPressable
                  key={region.IdRegion}
                  onPress={() => setRegionId(region.IdRegion)}
                  style={[
                    styles.choice,
                    regionId === region.IdRegion && styles.choiceSelected,
                  ]}
                >
                  <Text
                    style={{
                      color:
                        regionId === region.IdRegion ? "#fff" : palette.ink,
                    }}
                  >
                    {region.Nombre}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          ) : null}
          <View style={styles.editorActions}>
            <ActionButton
              label="Cancelar"
              secondary
              disabled={store.loading}
              onPress={() => {
                setEditing(null);
                setEditorOpen(false);
                setDraft("");
              }}
            />
            <ActionButton
              label="Guardar"
              disabled={
                store.loading ||
                (kind === "generaciones" && !store.regiones.length)
              }
              onPress={() => {
                void save();
              }}
            />
          </View>
        </View>
      ) : null}
      {filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          message="Prueba otra búsqueda o crea un registro nuevo."
        />
      ) : (
        filtered.map((item, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.rowCopy}>
              <TextLabel bold>{item.Nombre}</TextLabel>
              {kind === "generaciones" && "IdRegion" in item ? (
                <TextLabel muted>
                  {store.regiones.find(
                    (region) => region.IdRegion === item.IdRegion,
                  )?.Nombre ?? "Región no disponible"}
                </TextLabel>
              ) : null}
            </View>
            <View style={styles.rowActions}>
              <ActionButton
                label="Editar"
                secondary
                disabled={store.loading}
                onPress={() => beginEdit(item)}
              />
              <ActionButton
                label="Eliminar"
                danger
                disabled={store.loading}
                onPress={() => remove(item)}
              />
              {kind === "regiones" &&
              "IdRegion" in item &&
              !("IdGeneracion" in item) ? (
                <ActionButton
                  label="Ver Pokémon"
                  secondary
                  onPress={() =>
                    router.push({
                      pathname: "/pokemon",
                      params: { regionId: String(item.IdRegion) },
                    })
                  }
                />
              ) : null}
              {kind === "generaciones" && "IdGeneracion" in item ? (
                <ActionButton
                  label="Ver Pokémon"
                  secondary
                  onPress={() =>
                    router.push({
                      pathname: "/pokemon",
                      params: { generationId: String(item.IdGeneracion) },
                    })
                  }
                />
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScreenShell>
  );
}

function TextLabel({
  children,
  muted,
  bold,
}: {
  children: React.ReactNode;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <View>
      <Text style={[styles.label, muted && styles.muted, bold && styles.bold]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10 },
  editor: {
    ...finish.panel,
    gap: 10,
    padding: 14,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    borderLeftWidth: 4,
    borderLeftColor: palette.blue,
  },
  input: {
    ...finish.input,
    height: 44,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: palette.ink,
  },
  regionChoices: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  choice: {
    ...finish.card,
    padding: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    borderRadius: 999,
  },
  choiceSelected: {
    ...gradient("#438FFF, #205BBC"),
    backgroundColor: palette.blue,
    borderColor: palette.blue,
  },
  editorActions: { flexDirection: "row", gap: 8 },
  row: {
    ...finish.panel,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderLeftWidth: 3,
    borderLeftColor: "#2E5F96",
    gap: 12,
  },
  rowCopy: { gap: 2 },
  rowActions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  label: { color: palette.ink, fontSize: 15, lineHeight: 21 },
  muted: { color: palette.muted, fontSize: 12 },
  bold: { fontWeight: "800" },
});
