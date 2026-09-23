import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { pokedexApi } from "./pokedex-api";

export type Pokemon = {
  IdPokemon: number;
  NumeroPokedex: number;
  Nombre: string;
  Altura: number | null;
  Peso: number | null;
  Imagen: string | null;
  IdGeneracion: number;
};
export type Tipo = { IdTipo: number; Nombre: string };
export type Region = { IdRegion: number; Nombre: string };
export type Generacion = {
  IdGeneracion: number;
  Nombre: string;
  IdRegion: number;
};
export type PokemonTipo = {
  IdPokemonTipo: number;
  IdPokemon: number;
  IdTipo: number;
};
export type PokemonInput = Omit<Pokemon, "IdPokemon">;
export type StoreMode = "real" | "demo";

type PokedexStore = {
  mode: StoreMode;
  loading: boolean;
  error: string | null;
  pokemon: Pokemon[];
  tipos: Tipo[];
  regiones: Region[];
  generaciones: Generacion[];
  pokemonTipos: PokemonTipo[];
  reload: () => Promise<void>;
  createPokemon: (input: PokemonInput) => Promise<Pokemon>;
  updatePokemon: (id: number, input: PokemonInput) => Promise<void>;
  deletePokemon: (id: number) => Promise<void>;
  createTipo: (input: { Nombre: string }) => Promise<Tipo>;
  updateTipo: (id: number, input: { Nombre: string }) => Promise<void>;
  deleteTipo: (id: number) => Promise<void>;
  createRegion: (input: { Nombre: string }) => Promise<Region>;
  updateRegion: (id: number, input: { Nombre: string }) => Promise<void>;
  deleteRegion: (id: number) => Promise<void>;
  createGeneracion: (
    input: Omit<Generacion, "IdGeneracion">,
  ) => Promise<Generacion>;
  updateGeneracion: (
    id: number,
    input: Omit<Generacion, "IdGeneracion">,
  ) => Promise<void>;
  deleteGeneracion: (id: number) => Promise<void>;
  addPokemonTipo: (pokemonId: number, tipoId: number) => Promise<void>;
  removePokemonTipo: (relationId: number) => Promise<void>;
};

const LEGACY_AUTOMATIC_IMAGE_PREFIX =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

/**
 * Detecta las URL que versiones anteriores del frontend inventaban a partir
 * del número nacional. Se conservan únicamente para poder ignorarlas/limpiarlas;
 * la aplicación ya no consulta ni genera imágenes desde esa fuente.
 */
export function isLegacyAutomaticPokemonImage(
  pokemon: Pick<Pokemon, "Imagen" | "NumeroPokedex">,
) {
  const image = pokemon.Imagen?.trim();
  return (
    image ===
    `${LEGACY_AUTOMATIC_IMAGE_PREFIX}${pokemon.NumeroPokedex}.png`
  );
}
const demoRegions: Region[] = [1, 2, 3, 4, 5, 6].map((id) => ({
  IdRegion: id,
  Nombre: ["Kanto", "Johto", "Hoenn", "Sinnoh", "Kalos", "Paldea"][id - 1],
}));
const demoGenerations: Generacion[] = [
  { IdGeneracion: 1, Nombre: "Generación I", IdRegion: 1 },
  { IdGeneracion: 2, Nombre: "Generación II", IdRegion: 2 },
  { IdGeneracion: 3, Nombre: "Generación III", IdRegion: 3 },
  { IdGeneracion: 4, Nombre: "Generación IV", IdRegion: 4 },
  { IdGeneracion: 6, Nombre: "Generación VI", IdRegion: 5 },
  { IdGeneracion: 9, Nombre: "Generación IX", IdRegion: 6 },
];
const demoTypes: Tipo[] = [
  "Eléctrico",
  "Fuego",
  "Volador",
  "Lucha",
  "Acero",
  "Agua",
  "Siniestro",
  "Dragón",
  "Planta",
].map((Nombre, index) => ({ IdTipo: index + 1, Nombre }));
const demoPokemon: Pokemon[] = [25, 6, 448, 658, 384, 906].map(
  (number, index) => ({
    IdPokemon: number,
    NumeroPokedex: number,
    Nombre: [
      "Pikachu",
      "Charizard",
      "Lucario",
      "Greninja",
      "Rayquaza",
      "Sprigatito",
    ][index],
    Altura: null,
    Peso: null,
    Imagen: null,
    IdGeneracion: [1, 1, 4, 6, 3, 9][index],
  }),
);
const demoPokemonTypes: PokemonTipo[] = [
  { IdPokemonTipo: 1, IdPokemon: 25, IdTipo: 1 },
  { IdPokemonTipo: 2, IdPokemon: 6, IdTipo: 2 },
  { IdPokemonTipo: 3, IdPokemon: 6, IdTipo: 3 },
  { IdPokemonTipo: 4, IdPokemon: 448, IdTipo: 4 },
  { IdPokemonTipo: 5, IdPokemon: 448, IdTipo: 5 },
  { IdPokemonTipo: 6, IdPokemon: 658, IdTipo: 6 },
  { IdPokemonTipo: 7, IdPokemon: 658, IdTipo: 7 },
  { IdPokemonTipo: 8, IdPokemon: 384, IdTipo: 8 },
  { IdPokemonTipo: 9, IdPokemon: 384, IdTipo: 3 },
  { IdPokemonTipo: 10, IdPokemon: 906, IdTipo: 9 },
];

function nextId(items: Record<string, number>[], key: string) {
  return Math.max(0, ...items.map((item) => item[key] ?? 0)) + 1;
}

const StoreContext = createContext<PokedexStore | null>(null);

export function PokedexStoreProvider({ children }: { children: ReactNode }) {
  const mode: StoreMode =
    process.env.EXPO_PUBLIC_DATA_MODE === "demo" ? "demo" : "real";
  const [pokemon, setPokemon] = useState<Pokemon[]>(
    mode === "demo" ? demoPokemon : [],
  );
  const [tipos, setTipos] = useState<Tipo[]>(mode === "demo" ? demoTypes : []);
  const [regiones, setRegiones] = useState<Region[]>(
    mode === "demo" ? demoRegions : [],
  );
  const [generaciones, setGeneraciones] = useState<Generacion[]>(
    mode === "demo" ? demoGenerations : [],
  );
  const [pokemonTipos, setPokemonTipos] = useState<PokemonTipo[]>(
    mode === "demo" ? demoPokemonTypes : [],
  );
  const [loading, setLoading] = useState(mode === "real");
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (mode === "demo") return;
    setLoading(true);
    setError(null);
    try {
      const [
        pokemonResult,
        tiposResult,
        relationsResult,
        regionsResult,
        generationsResult,
      ] = await Promise.all([
        pokedexApi.listPokemon(),
        pokedexApi.listTipos(),
        pokedexApi.listPokemonTipos(),
        pokedexApi.listRegiones(),
        pokedexApi.listGeneraciones(),
      ]);
      setPokemon(pokemonResult);
      setTipos(tiposResult);
      setPokemonTipos(relationsResult);
      setRegiones(regionsResult);
      setGeneraciones(generationsResult);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo cargar la API.",
      );
    } finally {
      setLoading(false);
    }
  }, [mode]);

  // La carga inicial sincroniza el store con el servidor remoto.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const operation = useCallback(
    async <T,>(action: () => Promise<T>) => {
      if (busyRef.current) throw new Error("Ya hay una operación en curso.");
      busyRef.current = true;
      setBusy(true);
      setError(null);
      try {
        const result = await action();
        if (mode === "real") await reload();
        return result;
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "La operación no se pudo completar.",
        );
        throw cause;
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [mode, reload],
  );

  const value = useMemo<PokedexStore>(
    () => ({
      mode,
      loading: loading || busy,
      error,
      pokemon,
      tipos,
      regiones,
      generaciones,
      pokemonTipos,
      reload,
      createPokemon: (input) =>
        operation(async () => {
          const item =
            mode === "demo"
              ? {
                  ...input,
                  IdPokemon: nextId(
                    pokemon as unknown as Record<string, number>[],
                    "IdPokemon",
                  ),
                }
              : await pokedexApi.createPokemon(input);
          if (mode === "demo") setPokemon((current) => [...current, item]);
          return item;
        }),
      updatePokemon: (id, input) =>
        operation(async () => {
          if (mode === "demo")
            setPokemon((current) =>
              current.map((item) =>
                item.IdPokemon === id ? { ...input, IdPokemon: id } : item,
              ),
            );
          else await pokedexApi.updatePokemon(id, input);
        }),
      deletePokemon: (id) =>
        operation(async () => {
          if (mode === "demo") {
            setPokemon((current) =>
              current.filter((item) => item.IdPokemon !== id),
            );
            setPokemonTipos((current) =>
              current.filter((item) => item.IdPokemon !== id),
            );
          } else await pokedexApi.deletePokemon(id);
        }),
      createTipo: (input) =>
        operation(async () => {
          const item =
            mode === "demo"
              ? {
                  ...input,
                  IdTipo: nextId(
                    tipos as unknown as Record<string, number>[],
                    "IdTipo",
                  ),
                }
              : await pokedexApi.createTipo(input);
          if (mode === "demo") setTipos((current) => [...current, item]);
          return item;
        }),
      updateTipo: (id, input) =>
        operation(async () => {
          if (mode === "demo")
            setTipos((current) =>
              current.map((item) =>
                item.IdTipo === id ? { ...input, IdTipo: id } : item,
              ),
            );
          else await pokedexApi.updateTipo(id, input);
        }),
      deleteTipo: (id) =>
        operation(async () => {
          if (mode === "demo") {
            setTipos((current) => current.filter((item) => item.IdTipo !== id));
            setPokemonTipos((current) =>
              current.filter((item) => item.IdTipo !== id),
            );
          } else await pokedexApi.deleteTipo(id);
        }),
      createRegion: (input) =>
        operation(async () => {
          const item =
            mode === "demo"
              ? {
                  ...input,
                  IdRegion: nextId(
                    regiones as unknown as Record<string, number>[],
                    "IdRegion",
                  ),
                }
              : await pokedexApi.createRegion(input);
          if (mode === "demo") setRegiones((current) => [...current, item]);
          return item;
        }),
      updateRegion: (id, input) =>
        operation(async () => {
          if (mode === "demo")
            setRegiones((current) =>
              current.map((item) =>
                item.IdRegion === id ? { ...input, IdRegion: id } : item,
              ),
            );
          else await pokedexApi.updateRegion(id, input);
        }),
      deleteRegion: (id) =>
        operation(async () => {
          if (generaciones.some((item) => item.IdRegion === id))
            throw new Error(
              "Esta región tiene generaciones asociadas. Reasígnalas o elimínalas primero.",
            );
          if (mode === "demo")
            setRegiones((current) =>
              current.filter((item) => item.IdRegion !== id),
            );
          else await pokedexApi.deleteRegion(id);
        }),
      createGeneracion: (input) =>
        operation(async () => {
          const item =
            mode === "demo"
              ? {
                  ...input,
                  IdGeneracion: nextId(
                    generaciones as unknown as Record<string, number>[],
                    "IdGeneracion",
                  ),
                }
              : await pokedexApi.createGeneracion(input);
          if (mode === "demo") setGeneraciones((current) => [...current, item]);
          return item;
        }),
      updateGeneracion: (id, input) =>
        operation(async () => {
          if (mode === "demo")
            setGeneraciones((current) =>
              current.map((item) =>
                item.IdGeneracion === id
                  ? { ...input, IdGeneracion: id }
                  : item,
              ),
            );
          else await pokedexApi.updateGeneracion(id, input);
        }),
      deleteGeneracion: (id) =>
        operation(async () => {
          if (pokemon.some((item) => item.IdGeneracion === id))
            throw new Error(
              "Esta generación tiene Pokémon asociados. Reasígnalos o elimínalos primero.",
            );
          if (mode === "demo")
            setGeneraciones((current) =>
              current.filter((item) => item.IdGeneracion !== id),
            );
          else await pokedexApi.deleteGeneracion(id);
        }),
      addPokemonTipo: (pokemonId, tipoId) =>
        operation(async () => {
          if (mode === "demo")
            setPokemonTipos((current) =>
              current.some(
                (item) =>
                  item.IdPokemon === pokemonId && item.IdTipo === tipoId,
              )
                ? current
                : [
                    ...current,
                    {
                      IdPokemonTipo: nextId(
                        current as unknown as Record<string, number>[],
                        "IdPokemonTipo",
                      ),
                      IdPokemon: pokemonId,
                      IdTipo: tipoId,
                    },
                  ],
            );
          else
            await pokedexApi.createPokemonTipo({
              IdPokemon: pokemonId,
              IdTipo: tipoId,
            });
        }),
      removePokemonTipo: (relationId) =>
        operation(async () => {
          if (mode === "demo")
            setPokemonTipos((current) =>
              current.filter((item) => item.IdPokemonTipo !== relationId),
            );
          else await pokedexApi.deletePokemonTipo(relationId);
        }),
    }),
    [
      busy,
      error,
      generaciones,
      loading,
      mode,
      operation,
      pokemon,
      pokemonTipos,
      regiones,
      reload,
      tipos,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function usePokedexStore() {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error(
      "usePokedexStore debe usarse dentro de PokedexStoreProvider",
    );
  return store;
}
