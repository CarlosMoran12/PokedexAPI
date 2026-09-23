import { Image } from "expo-image";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ActionButton,
  Chip,
  confirmDestructive,
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingState,
  palette,
  PokemonImage,
  ScreenHeader,
  ScreenShell,
  SearchBox,
  SectionTitle,
} from "@/components/pokedex-ui";
import {
  isLegacyAutomaticPokemonImage,
  usePokedexStore,
} from "@/data/pokedex-store";
import {
  generationDisplayName,
  generationNumberFromLocalName,
  getPokemonReference,
  listPokemonReference,
  typeNameInSpanish,
  type PokemonReferenceDetail,
  type PokemonReferenceListItem,
} from "@/data/pokemon-reference";

export function PokemonListScreen() {
  const params = useLocalSearchParams<{
    regionId?: string;
    generationId?: string;
    query?: string;
  }>();
  return <PokemonListContent key={JSON.stringify(params)} />;
}
function PokemonListContent() {
  const store = usePokedexStore();
  const params = useLocalSearchParams<{
    regionId?: string;
    generationId?: string;
    query?: string;
  }>();
  const [query, setQuery] = useState(params.query ?? "");
  const [typeId, setTypeId] = useState<number | null>(null);
  const [regionId, setRegionId] = useState(
    params.regionId ? Number(params.regionId) : null,
  );
  const [generationId, setGenerationId] = useState(
    params.generationId ? Number(params.generationId) : null,
  );
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const filtered = useMemo(
    () =>
      store.pokemon.filter((item) => {
        const relations = store.pokemonTipos.filter(
          (relation) => relation.IdPokemon === item.IdPokemon,
        );
        const matchesQuery =
          !query.trim() ||
          item.Nombre.toLowerCase().includes(query.trim().toLowerCase()) ||
          String(item.NumeroPokedex).includes(query.trim());
        const matchesType =
          !typeId || relations.some((relation) => relation.IdTipo === typeId);
        const matchesGeneration =
          !generationId || item.IdGeneracion === generationId;
        const matchesRegion =
          !regionId ||
          store.generaciones.find(
            (generation) => generation.IdGeneracion === item.IdGeneracion,
          )?.IdRegion === regionId;
        return (
          matchesQuery && matchesType && matchesGeneration && matchesRegion
        );
      }),
    [
      generationId,
      query,
      regionId,
      store.generaciones,
      store.pokemon,
      store.pokemonTipos,
      typeId,
    ],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visiblePokemon = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const clearFilters = () => {
    setQuery("");
    setTypeId(null);
    setRegionId(null);
    setGenerationId(null);
    setPage(1);
  };
  if (store.loading && store.pokemon.length === 0)
    return (
      <ScreenShell>
        <ScreenHeader title="Pokédex" back />
        <LoadingState />
      </ScreenShell>
    );
  if (store.error && store.pokemon.length === 0)
    return (
      <ScreenShell>
        <ScreenHeader title="Pokédex" back />
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
        title="Pokédex"
        subtitle="Busca y filtra por nombre, tipo, región y generación."
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
      <View style={styles.toolbar}>
        <SearchBox
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            setPage(1);
          }}
          placeholder="Buscar por nombre o número..."
        />
        <Link href="/pokemon/nuevo" asChild>
          <ActionButton label="+ Añadir Pokémon" onPress={() => undefined} />
        </Link>
      </View>
      <View style={styles.filters}>
        <SectionTitle title="Filtros" count={filtered.length} />
        <TextLabel bold>Tipos</TextLabel>
        <View style={styles.chips}>
          {store.tipos.map((type) => (
            <Chip
              key={type.IdTipo}
              label={type.Nombre}
              selected={typeId === type.IdTipo}
              onPress={() => {
                setTypeId(typeId === type.IdTipo ? null : type.IdTipo);
                setPage(1);
              }}
            />
          ))}
        </View>
        <TextLabel bold>Regiones</TextLabel>
        <View style={styles.chips}>
          {store.regiones.map((region) => (
            <Chip
              key={region.IdRegion}
              label={region.Nombre}
              selected={regionId === region.IdRegion}
              onPress={() => {
                setRegionId(
                  regionId === region.IdRegion ? null : region.IdRegion,
                );
                setPage(1);
              }}
            />
          ))}
        </View>
        <TextLabel bold>Generaciones</TextLabel>
        <View style={styles.chips}>
          {store.generaciones.map((generation) => (
            <Chip
              key={generation.IdGeneracion}
              label={generation.Nombre}
              selected={generationId === generation.IdGeneracion}
              onPress={() => {
                setGenerationId(
                  generationId === generation.IdGeneracion
                    ? null
                    : generation.IdGeneracion,
                );
                setPage(1);
              }}
            />
          ))}
        </View>
        <ActionButton
          label="Limpiar filtros"
          secondary
          onPress={clearFilters}
        />
      </View>
      {filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          message="No hay Pokémon que coincidan con los filtros actuales."
        />
      ) : (
        <>
          <View style={styles.grid}>
            {visiblePokemon.map((item) => (
              <PokemonCard key={item.IdPokemon} pokemonId={item.IdPokemon} />
            ))}
          </View>
          <View style={styles.pagination}>
            <ActionButton
              label="Anterior"
              secondary
              disabled={currentPage === 1}
              onPress={() => setPage(Math.max(1, currentPage - 1))}
            />
            <TextLabel muted>
              Página {currentPage} de {pageCount}
            </TextLabel>
            <ActionButton
              label="Siguiente"
              secondary
              disabled={currentPage >= pageCount}
              onPress={() => setPage(Math.min(pageCount, currentPage + 1))}
            />
          </View>
        </>
      )}
    </ScreenShell>
  );
}

function PokemonCard({ pokemonId }: { pokemonId: number }) {
  const store = usePokedexStore();
  const item = store.pokemon.find((pokemon) => pokemon.IdPokemon === pokemonId);
  if (store.error && !item)
    return (
      <ScreenShell>
        <ScreenHeader title="Pokémon" back />
        <ErrorState
          message={store.error}
          onRetry={() => {
            void store.reload();
          }}
        />
      </ScreenShell>
    );
  if (!item) return null;
  const types = store.pokemonTipos
    .filter((relation) => relation.IdPokemon === item.IdPokemon)
    .map(
      (relation) =>
        store.tipos.find((type) => type.IdTipo === relation.IdTipo)?.Nombre,
    )
    .filter(Boolean)
    .join(" · ");
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/pokemon/[id]",
          params: { id: String(item.IdPokemon) },
        })
      }
      style={styles.card}
    >
      <PokemonImage pokemon={item} />
      <TextLabel muted>
        #{String(item.NumeroPokedex).padStart(3, "0")}
      </TextLabel>
      <TextLabel bold>{item.Nombre}</TextLabel>
      <TextLabel muted>{types || "Sin tipos asignados"}</TextLabel>
    </Pressable>
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

export function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = usePokedexStore();
  const item = store.pokemon.find(
    (pokemon) => pokemon.IdPokemon === Number(id),
  );
  if (store.loading && !item)
    return (
      <ScreenShell>
        <LoadingState />
      </ScreenShell>
    );
  if (!item)
    return (
      <ScreenShell>
        <EmptyState
          title="Pokémon no encontrado"
          message="Regresa al listado para continuar."
        />
        <ActionButton
          label="Volver"
          onPress={() => router.replace("/pokemon")}
        />
      </ScreenShell>
    );
  const generation = store.generaciones.find(
    (entry) => entry.IdGeneracion === item.IdGeneracion,
  );
  const region = store.regiones.find(
    (entry) => entry.IdRegion === generation?.IdRegion,
  );
  const relations = store.pokemonTipos.filter(
    (relation) => relation.IdPokemon === item.IdPokemon,
  );
  const remove = () =>
    confirmDestructive(`¿Quitar ${item.Nombre} de la Pokédex?`, async () => {
      await store.deletePokemon(item.IdPokemon);
      router.replace("/pokemon");
    });
  return (
    <ScreenShell>
      <ScreenHeader
        title={item.Nombre}
        subtitle={`#${String(item.NumeroPokedex).padStart(3, "0")}`}
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
      <View style={styles.detailHero}>
        <PokemonImage pokemon={item} size="detail" />
        <View style={styles.detailCopy}>
          <TextLabel bold>{item.Nombre}</TextLabel>
          <TextLabel muted>
            {generation?.Nombre ?? "Generación no disponible"} ·{" "}
            {region?.Nombre ?? "Región no disponible"}
          </TextLabel>
          <TextLabel muted>
            {item.Altura ?? "—"} m · {item.Peso ?? "—"} kg
          </TextLabel>
        </View>
      </View>
      <View style={styles.detailBox}>
        <SectionTitle title="Tipos" count={relations.length} />
        {relations.length ? (
          <View style={styles.chips}>
            {relations.map((relation) => (
              <Chip
                key={relation.IdPokemonTipo}
                label={
                  store.tipos.find((type) => type.IdTipo === relation.IdTipo)
                    ?.Nombre ?? "Tipo no disponible"
                }
              />
            ))}
          </View>
        ) : (
          <TextLabel muted>Sin tipos registrados.</TextLabel>
        )}
        <TextLabel muted>
          Los tipos se detectan y se relacionan automáticamente al añadir el Pokémon a la Pokédex.
        </TextLabel>
      </View>
      <View style={styles.actions}>
        <ActionButton
          label="Actualizar datos"
          disabled={store.loading}
          onPress={() =>
            router.push({
              pathname: "/pokemon/editar",
              params: { id: String(item.IdPokemon) },
            })
          }
        />
        <ActionButton
          label="Quitar de la Pokédex"
          disabled={store.loading}
          danger
          onPress={remove}
        />
        <ActionButton
          label="Volver al listado"
          secondary
          onPress={() => router.replace("/pokemon")}
        />
      </View>
    </ScreenShell>
  );
}
export function PokemonFormScreen({ edit }: { edit: boolean }) {
  const params = useLocalSearchParams<{ id?: string }>();
  const store = usePokedexStore();
  const existing = store.pokemon.find(
    (item) => item.IdPokemon === Number(params.id),
  );
  if (edit && !existing && store.loading)
    return (
      <ScreenShell>
        <LoadingState />
      </ScreenShell>
    );
  if (edit && !existing)
    return (
      <ScreenShell>
        <ScreenHeader title="Actualizar datos" back />
        <EmptyState
          title="Pokémon no disponible"
          message={store.error ?? "Regresa al catálogo."}
        />
      </ScreenShell>
    );
  return <PokemonFormContent key={edit ? params.id : "new"} edit={edit} />;
}
function PokemonFormContent({ edit }: { edit: boolean }) {
  const params = useLocalSearchParams<{ id?: string }>();
  const store = usePokedexStore();
  const existing = store.pokemon.find(
    (item) => item.IdPokemon === Number(params.id),
  );
  const [number, setNumber] = useState(
    existing ? String(existing.NumeroPokedex) : "",
  );
  const [name, setName] = useState(existing?.Nombre ?? "");
  const [height, setHeight] = useState(
    existing?.Altura ? String(existing.Altura) : "",
  );
  const [weight, setWeight] = useState(
    existing?.Peso ? String(existing.Peso) : "",
  );
  const [image, setImage] = useState(
    existing && !isLegacyAutomaticPokemonImage(existing)
      ? existing.Imagen?.trim() || null
      : null,
  );
  const [generation, setGeneration] = useState(
    existing?.IdGeneracion ?? store.generaciones[0]?.IdGeneracion ?? 0,
  );
  const [referenceTypes, setReferenceTypes] = useState<string[]>([]);
  const [referenceQuery, setReferenceQuery] = useState("");
  const [referenceItems, setReferenceItems] = useState<
    PokemonReferenceListItem[]
  >([]);
  const [referenceLoading, setReferenceLoading] = useState(!edit);
  const [referenceError, setReferenceError] = useState("");
  const [selectedReference, setSelectedReference] =
    useState<PokemonReferenceDetail | null>(null);
  const [validation, setValidation] = useState("");

  useEffect(() => {
    if (edit) return;
    let active = true;
    setReferenceLoading(true);
    setReferenceError("");
    void listPokemonReference()
      .then((items) => {
        if (active) setReferenceItems(items);
      })
      .catch((cause) => {
        if (active)
          setReferenceError(
            cause instanceof Error
              ? cause.message
              : "No se pudo cargar el catálogo de referencia.",
          );
      })
      .finally(() => {
        if (active) setReferenceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [edit]);

  const filteredReference = useMemo(() => {
    const query = referenceQuery.trim().toLowerCase();
    const candidates = query
      ? referenceItems.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            String(item.id).includes(query),
        )
      : referenceItems;
    return candidates.slice(0, 30);
  }, [referenceItems, referenceQuery]);

  const selectReference = async (item: PokemonReferenceListItem) => {
    setValidation("");
    setReferenceError("");
    if (store.pokemon.some((pokemon) => pokemon.NumeroPokedex === item.id)) {
      setValidation(
        `${item.name} (#${String(item.id).padStart(3, "0")}) ya está añadido a tu Pokédex.`,
      );
      return;
    }
    setReferenceLoading(true);
    try {
      const detail = await getPokemonReference(item.id);
      setSelectedReference(detail);
      setNumber(String(detail.id));
      setName(detail.name);
      setHeight(detail.heightMeters ? String(detail.heightMeters) : "");
      setWeight(detail.weightKg ? String(detail.weightKg) : "");
      setImage(detail.image);
      setReferenceTypes(detail.typeNames);

      if (detail.generationNumber) {
        const localGeneration = store.generaciones.find(
          (entry) =>
            generationNumberFromLocalName(entry.Nombre) ===
            detail.generationNumber,
        );
        if (localGeneration) setGeneration(localGeneration.IdGeneracion);
        else setGeneration(0);
      }
    } catch (cause) {
      setReferenceError(
        cause instanceof Error
          ? cause.message
          : "No se pudo consultar ese Pokémon.",
      );
    } finally {
      setReferenceLoading(false);
    }
  };

  const updateFromReference = async () => {
    setValidation("");
    setReferenceError("");
    if (!existing)
      return setValidation("No se encontró el Pokémon para actualizar.");

    setReferenceLoading(true);
    try {
      const detail = await getPokemonReference(existing.NumeroPokedex);
      if (!detail.generationNumber || !detail.regionName?.trim()) {
        throw new Error(
          "No se pudo detectar la generación o región oficial de este Pokémon.",
        );
      }

      const detectedRegion = detail.regionName.trim();
      let localRegion = store.regiones.find(
        (region) =>
          region.Nombre.localeCompare(detectedRegion, "es", {
            sensitivity: "base",
          }) === 0,
      );

      if (!localRegion) {
        localRegion = await store.createRegion({ Nombre: detectedRegion });
      }

      let localGeneration = store.generaciones.find(
        (item) =>
          generationNumberFromLocalName(item.Nombre) === detail.generationNumber,
      );

      if (!localGeneration) {
        localGeneration = await store.createGeneracion({
          Nombre: generationDisplayName(detail.generationNumber),
          IdRegion: localRegion.IdRegion,
        });
      } else if (localGeneration.IdRegion !== localRegion.IdRegion) {
        await store.updateGeneracion(localGeneration.IdGeneracion, {
          Nombre: generationDisplayName(detail.generationNumber),
          IdRegion: localRegion.IdRegion,
        });
        localGeneration = {
          ...localGeneration,
          Nombre: generationDisplayName(detail.generationNumber),
          IdRegion: localRegion.IdRegion,
        };
      }

      await store.updatePokemon(existing.IdPokemon, {
        NumeroPokedex: detail.id,
        Nombre: detail.name,
        Altura: detail.heightMeters,
        Peso: detail.weightKg,
        Imagen: detail.image,
        IdGeneracion: localGeneration.IdGeneracion,
      });

      const availableTypes = [...store.tipos];
      const desiredTypeIds: number[] = [];

      for (const referenceType of detail.typeNames) {
        const spanishName = typeNameInSpanish(referenceType);
        let localType = availableTypes.find(
          (type) =>
            type.Nombre.localeCompare(spanishName, "es", {
              sensitivity: "base",
            }) === 0,
        );

        if (!localType) {
          localType = await store.createTipo({ Nombre: spanishName });
          availableTypes.push(localType);
        }
        desiredTypeIds.push(localType.IdTipo);
      }

      const currentRelations = store.pokemonTipos.filter(
        (relation) => relation.IdPokemon === existing.IdPokemon,
      );

      for (const relation of currentRelations) {
        if (!desiredTypeIds.includes(relation.IdTipo)) {
          await store.removePokemonTipo(relation.IdPokemonTipo);
        }
      }

      for (const typeId of desiredTypeIds) {
        if (!currentRelations.some((relation) => relation.IdTipo === typeId)) {
          await store.addPokemonTipo(existing.IdPokemon, typeId);
        }
      }

      router.replace({
        pathname: "/pokemon/[id]",
        params: { id: String(existing.IdPokemon) },
      });
    } catch (cause) {
      setValidation(
        cause instanceof Error
          ? cause.message
          : "No se pudieron actualizar los datos del Pokémon.",
      );
    } finally {
      setReferenceLoading(false);
    }
  };

  const save = async () => {
    setValidation("");
    if (edit && !existing)
      return setValidation("No se encontró el Pokémon para editar.");
    if (!edit && !selectedReference)
      return setValidation(
        "Selecciona primero un Pokémon del catálogo de referencia.",
      );
    if (
      !name.trim() ||
      !Number.isInteger(Number(number)) ||
      Number(number) <= 0
    )
      return setValidation(
        "El Pokémon seleccionado no tiene un número nacional válido.",
      );
    if (
      [height, weight].some(
        (value) =>
          value.trim() &&
          (!Number.isFinite(Number(value)) || Number(value) <= 0),
      )
    )
      return setValidation(
        "Altura y peso deben ser números mayores que cero, o quedar vacíos.",
      );
    if (
      store.pokemon.some(
        (item) =>
          item.NumeroPokedex === Number(number) &&
          item.IdPokemon !== existing?.IdPokemon,
      )
    )
      return setValidation("Ese Pokémon ya está añadido a tu Pokédex.");

    try {
      let targetGenerationId = generation;

      if (!edit && selectedReference?.generationNumber) {
        let localGeneration = store.generaciones.find(
          (item) =>
            generationNumberFromLocalName(item.Nombre) ===
            selectedReference.generationNumber,
        );

        if (!localGeneration) {
          const detectedRegion = selectedReference.regionName?.trim();
          if (!detectedRegion) {
            throw new Error(
              "No se pudo detectar la región de esta generación. Inténtalo de nuevo.",
            );
          }

          let localRegion = store.regiones.find(
            (region) =>
              region.Nombre.localeCompare(detectedRegion, "es", {
                sensitivity: "base",
              }) === 0,
          );

          if (!localRegion) {
            localRegion = await store.createRegion({ Nombre: detectedRegion });
          }

          localGeneration = await store.createGeneracion({
            Nombre: generationDisplayName(selectedReference.generationNumber),
            IdRegion: localRegion.IdRegion,
          });
        }

        targetGenerationId = localGeneration.IdGeneracion;
        setGeneration(targetGenerationId);
      }

      if (!store.generaciones.some((item) => item.IdGeneracion === targetGenerationId) && edit) {
        throw new Error("Selecciona una generación válida antes de guardar.");
      }

      const input = {
        NumeroPokedex: Number(number),
        Nombre: name.trim(),
        Altura: height ? Number(height) : null,
        Peso: weight ? Number(weight) : null,
        Imagen: image,
        IdGeneracion: targetGenerationId,
      };
      const result =
        edit && existing
          ? (await store.updatePokemon(existing.IdPokemon, input), existing)
          : await store.createPokemon(input);

      if (!edit && referenceTypes.length) {
        // Los tipos funcionan como elementos "desbloqueables" de la Pokédex:
        // si ya existen se reutilizan; si aparecen por primera vez se crean
        // automáticamente y luego se relacionan con el Pokémon añadido.
        const availableTypes = [...store.tipos];

        for (const referenceType of referenceTypes) {
          const spanishName = typeNameInSpanish(referenceType);
          let localType = availableTypes.find(
            (type) =>
              type.Nombre.localeCompare(spanishName, "es", {
                sensitivity: "base",
              }) === 0,
          );

          if (!localType) {
            localType = await store.createTipo({ Nombre: spanishName });
            availableTypes.push(localType);
          }

          await store.addPokemonTipo(result.IdPokemon, localType.IdTipo);
        }
      }

      router.replace({
        pathname: "/pokemon/[id]",
        params: { id: String(result.IdPokemon) },
      });
    } catch (cause) {
      setValidation(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar. Tus datos siguen en el formulario.",
      );
    }
  };

  if (edit && !existing && store.loading)
    return (
      <ScreenShell>
        <LoadingState />
      </ScreenShell>
    );
  if (edit && !existing)
    return (
      <ScreenShell>
        <ScreenHeader title="Actualizar datos" back />
        <EmptyState
          title="Pokémon no disponible"
          message={
            store.error ?? "Regresa al catálogo y selecciona un Pokémon."
          }
        />
      </ScreenShell>
    );

  return (
    <ScreenShell>
      <ScreenHeader
        title={edit ? "Actualizar datos" : "Añadir Pokémon a la Pokédex"}
        subtitle={
          edit
            ? "Sincroniza esta especie con el catálogo de referencia sin editar sus datos manualmente."
            : "Elige un Pokémon existente; su número, nombre e imagen se completan automáticamente."
        }
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
      <View style={styles.form}>
        {validation ? (
          <Text accessibilityRole="alert" style={{ color: "#8b3030" }}>
            {validation}
          </Text>
        ) : null}

        {!edit ? (
          <View style={styles.referenceBox}>
            <TextLabel bold>1. Selecciona el Pokémon</TextLabel>
            <TextLabel muted>
              Este catálogo solo sirve como referencia para escoger la especie.
              Al añadirla, los datos se guardan en tu propia API.
            </TextLabel>
            <SearchBox
              value={referenceQuery}
              onChangeText={setReferenceQuery}
              placeholder="Buscar por nombre o número..."
            />
            {referenceError ? (
              <Text accessibilityRole="alert" style={{ color: "#8b3030" }}>
                {referenceError}
              </Text>
            ) : null}
            {referenceLoading && !selectedReference ? <LoadingState /> : null}
            {!referenceLoading && referenceItems.length > 0 ? (
              <View style={styles.referenceGrid}>
                {filteredReference.map((item) => {
                  const alreadyAdded = store.pokemon.some(
                    (pokemon) => pokemon.NumeroPokedex === item.id,
                  );
                  return (
                    <Pressable
                      key={item.id}
                      disabled={alreadyAdded || referenceLoading}
                      onPress={() => {
                        void selectReference(item);
                      }}
                      style={[
                        styles.referenceCard,
                        selectedReference?.id === item.id &&
                          styles.referenceCardSelected,
                        alreadyAdded && styles.referenceCardDisabled,
                      ]}
                    >
                      <Image
                        source={{ uri: item.image }}
                        contentFit="contain"
                        style={styles.referenceImage}
                      />
                      <TextLabel bold>{item.name}</TextLabel>
                      <TextLabel muted>
                        #{String(item.id).padStart(3, "0")}
                        {alreadyAdded ? " · Ya añadido" : ""}
                      </TextLabel>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
            {!referenceLoading &&
            referenceItems.length > 0 &&
            filteredReference.length === 0 ? (
              <EmptyState
                title="Sin coincidencias"
                message="Prueba con otra parte del nombre o con el número nacional."
              />
            ) : null}
          </View>
        ) : null}

        {(!edit && selectedReference) || edit ? (
          <>
            <TextLabel bold>{edit ? "Información" : "2. Información detectada"}</TextLabel>
            <View style={styles.selectedPokemon}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  contentFit="contain"
                  style={styles.selectedPokemonImage}
                />
              ) : null}
              <View style={styles.selectedPokemonCopy}>
                <TextLabel bold>{name}</TextLabel>
                <TextLabel muted>
                  Número nacional #{String(number).padStart(3, "0")}
                </TextLabel>
              </View>
            </View>

            {edit ? (
              <View style={styles.detectedData}>
                <TextLabel muted>
                  Datos actuales: {existing?.Altura ?? "—"} m · {existing?.Peso ?? "—"} kg
                </TextLabel>
                <TextLabel muted>
                  {store.generaciones.find(
                    (item) => item.IdGeneracion === existing?.IdGeneracion,
                  )?.Nombre ?? "Generación no disponible"}
                  {(() => {
                    const currentGeneration = store.generaciones.find(
                      (item) => item.IdGeneracion === existing?.IdGeneracion,
                    );
                    const currentRegion = store.regiones.find(
                      (item) => item.IdRegion === currentGeneration?.IdRegion,
                    );
                    return currentRegion ? ` · ${currentRegion.Nombre}` : "";
                  })()}
                </TextLabel>
                <TextLabel muted>
                  Al actualizar, la imagen, altura, peso, generación, región y tipos se volverán a sincronizar automáticamente con la especie #{String(existing?.NumeroPokedex ?? "").padStart(3, "0")}.
                </TextLabel>
              </View>
            ) : (
              <View style={styles.detectedData}>
                <TextLabel muted>
                  Altura: {height || "—"} m · Peso: {weight || "—"} kg
                </TextLabel>
                <TextLabel muted>
                  Generación detectada: {selectedReference?.generationNumber ?? "—"}
                  {selectedReference?.regionName
                    ? ` · ${selectedReference.regionName}`
                    : ""}
                </TextLabel>
                <TextLabel muted>
                  Tipos detectados: {referenceTypes.length ? referenceTypes.map(typeNameInSpanish).join(" · ") : "—"}
                </TextLabel>
                {selectedReference?.generationNumber && !generation ? (
                  <TextLabel muted>
                    Al añadirlo, {generationDisplayName(selectedReference.generationNumber)}
                    {selectedReference.regionName
                      ? ` y ${selectedReference.regionName}`
                      : ""} se registrarán automáticamente si aún no existen.
                  </TextLabel>
                ) : null}
              </View>
            )}

            <View style={styles.actions}>
              <ActionButton
                label={edit ? "Actualizar desde catálogo" : "Añadir a la Pokédex"}
                disabled={
                  store.loading ||
                  referenceLoading ||
                  (!edit && !selectedReference)
                }
                onPress={() => {
                  if (edit) void updateFromReference();
                  else void save();
                }}
              />
              <ActionButton
                label="Cancelar"
                secondary
                disabled={store.loading}
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/pokemon")
                }
              />
            </View>
          </>
        ) : null}
      </View>
    </ScreenShell>
  );
}
const styles = StyleSheet.create({
  toolbar: { gap: 10 },
  filters: {
    gap: 10,
    padding: 14,
    backgroundColor: "#eaf5ff",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 7,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pagination: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  card: {
    width: "47%",
    flexGrow: 1,
    minWidth: 145,
    padding: 10,
    gap: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 7,
  },
  label: { color: palette.ink, fontSize: 15, lineHeight: 21 },
  muted: { color: palette.muted, fontSize: 12 },
  bold: { fontWeight: "800" },
  detailHero: {
    padding: 16,
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 8,
  },
  detailCopy: { width: "100%", gap: 6 },
  detailBox: {
    padding: 14,
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 7,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  form: {
    gap: 14,
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 7,
  },
  referenceBox: {
    gap: 10,
    padding: 12,
    backgroundColor: "#f5faff",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 7,
  },
  referenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  referenceCard: {
    width: "30%",
    minWidth: 110,
    flexGrow: 1,
    alignItems: "center",
    gap: 3,
    padding: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 7,
  },
  referenceCardSelected: {
    borderColor: palette.blue,
    borderWidth: 2,
    backgroundColor: "#eaf5ff",
  },
  referenceCardDisabled: { opacity: 0.45 },
  referenceImage: { width: 72, height: 72 },
  selectedPokemon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: palette.panel,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: palette.line,
  },
  selectedPokemonImage: { width: 100, height: 100 },
  selectedPokemonCopy: { flex: 1, gap: 4 },
  detectedData: {
    gap: 5,
    padding: 10,
    backgroundColor: "#f8fbfe",
    borderRadius: 6,
  },
});
