const REFERENCE_API = "https://pokeapi.co/api/v2";

export type PokemonReferenceListItem = {
  id: number;
  name: string;
  image: string;
};

export type PokemonReferenceDetail = PokemonReferenceListItem & {
  heightMeters: number | null;
  weightKg: number | null;
  generationNumber: number | null;
  regionName: string | null;
  typeNames: string[];
};

type PokeApiListResponse = {
  results: Array<{ name: string; url: string }>;
};

type PokeApiPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  species: { url: string };
  sprites: {
    front_default: string | null;
    other?: {
      home?: { front_default?: string | null };
      [key: string]: unknown;
    };
  };
  types: Array<{ type: { name: string } }>;
};

type PokeApiSpecies = {
  generation?: { name?: string };
};

function requestError() {
  return new Error(
    "No se pudo consultar el catálogo de referencia. Comprueba tu conexión a Internet e inténtalo de nuevo.",
  );
}

function idFromUrl(url: string) {
  const match = url.match(/\/pokemon-species\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

export function displayPokemonName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function referencePreviewImage(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export async function listPokemonReference(): Promise<PokemonReferenceListItem[]> {
  let response: Response;
  try {
    response = await fetch(`${REFERENCE_API}/pokemon-species?limit=2000&offset=0`);
  } catch {
    throw requestError();
  }
  if (!response.ok) throw requestError();
  const body = (await response.json()) as PokeApiListResponse;
  return body.results
    .map((item) => ({
      id: idFromUrl(item.url),
      name: displayPokemonName(item.name),
      image: referencePreviewImage(idFromUrl(item.url)),
    }))
    .filter((item) => item.id > 0)
    .sort((a, b) => a.id - b.id);
}

function generationNumber(name?: string) {
  const roman = name?.replace(/^generation-/, "").toLowerCase();
  const values: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
  };
  return roman ? (values[roman] ?? null) : null;
}


const REGION_BY_GENERATION: Record<number, string> = {
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Teselia",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",
};

export function regionNameFromGenerationNumber(number: number | null) {
  return number ? (REGION_BY_GENERATION[number] ?? null) : null;
}

const ROMAN_BY_GENERATION: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
};

export function generationDisplayName(number: number) {
  return `Generación ${ROMAN_BY_GENERATION[number] ?? number}`;
}

export async function getPokemonReference(
  id: number,
): Promise<PokemonReferenceDetail> {
  let pokemonResponse: Response;
  try {
    pokemonResponse = await fetch(`${REFERENCE_API}/pokemon/${id}`);
  } catch {
    throw requestError();
  }
  if (!pokemonResponse.ok) throw requestError();
  const pokemon = (await pokemonResponse.json()) as PokeApiPokemon;

  let species: PokeApiSpecies = {};
  try {
    const speciesResponse = await fetch(pokemon.species.url);
    if (speciesResponse.ok)
      species = (await speciesResponse.json()) as PokeApiSpecies;
  } catch {
    // La generación también puede elegirse manualmente si esta consulta falla.
  }

  const image =
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default ??
    referencePreviewImage(pokemon.id);

  const detectedGeneration = generationNumber(species.generation?.name);

  return {
    id: pokemon.id,
    name: displayPokemonName(pokemon.name),
    image,
    heightMeters:
      Number.isFinite(pokemon.height) && pokemon.height > 0
        ? pokemon.height / 10
        : null,
    weightKg:
      Number.isFinite(pokemon.weight) && pokemon.weight > 0
        ? pokemon.weight / 10
        : null,
    generationNumber: detectedGeneration,
    regionName: regionNameFromGenerationNumber(detectedGeneration),
    typeNames: pokemon.types.map((item) => item.type.name),
  };
}

export function generationNumberFromLocalName(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/generacion/g, "")
    .trim();
  const roman: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
  };
  if (roman[normalized]) return roman[normalized];
  const numeric = Number(normalized);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

const TYPE_NAMES_ES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

export function typeNameInSpanish(name: string) {
  return TYPE_NAMES_ES[name] ?? displayPokemonName(name);
}
