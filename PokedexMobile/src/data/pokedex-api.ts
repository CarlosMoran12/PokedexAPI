import { Platform } from "react-native";
import type {
  Generacion,
  Pokemon,
  PokemonTipo,
  Region,
  Tipo,
} from "./pokedex-store";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000");

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(
      0,
      "No se pudo conectar. Comprueba tu conexión y que el servidor esté encendido.",
    );
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    const detail = await response.text();
    let message =
      response.status === 409
        ? "Hay un registro duplicado o una relación que impide esta operación."
        : response.status === 404
          ? "El registro ya no está disponible."
          : "No se pudo completar la operación. Inténtalo de nuevo.";
    if (response.status < 500 && detail) {
      try {
        const parsed = JSON.parse(detail);
        message = parsed.detail || parsed.message || parsed.title || message;
      } catch {
        if (detail.length < 250 && !detail.includes("<")) message = detail;
      }
    }
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  const body = await response.text();
  return body.trim() ? (JSON.parse(body) as T) : (undefined as T);
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(body),
});
const put = (body: unknown): RequestInit => ({
  method: "PUT",
  body: JSON.stringify(body),
});

type RawPokemon = {
  idPokemon: number;
  numeroPokedex: number;
  nombre: string;
  altura: number | null;
  peso: number | null;
  imagen: string | null;
  idGeneracion: number;
};
type RawTipo = { idTipo: number; nombre: string };
type RawRegion = { idRegion: number; nombre: string };
type RawGeneracion = { idGeneracion: number; nombre: string; idRegion: number };
type RawPokemonTipo = {
  idPokemonTipo: number;
  idPokemon: number;
  idTipo: number;
};
const mapPokemon = (item: RawPokemon): Pokemon => ({
  IdPokemon: item.idPokemon,
  NumeroPokedex: item.numeroPokedex,
  Nombre: item.nombre,
  Altura: item.altura,
  Peso: item.peso,
  Imagen: item.imagen,
  IdGeneracion: item.idGeneracion,
});
const mapTipo = (item: RawTipo): Tipo => ({
  IdTipo: item.idTipo,
  Nombre: item.nombre,
});
const mapRegion = (item: RawRegion): Region => ({
  IdRegion: item.idRegion,
  Nombre: item.nombre,
});
const mapGeneracion = (item: RawGeneracion): Generacion => ({
  IdGeneracion: item.idGeneracion,
  Nombre: item.nombre,
  IdRegion: item.idRegion,
});
const mapPokemonTipo = (item: RawPokemonTipo): PokemonTipo => ({
  IdPokemonTipo: item.idPokemonTipo,
  IdPokemon: item.idPokemon,
  IdTipo: item.idTipo,
});

export const pokedexApi = {
  listPokemon: () =>
    request<RawPokemon[]>("/api/pokemon/").then((items) =>
      items.map(mapPokemon),
    ),
  getPokemon: (id: number) =>
    request<RawPokemon>(`/api/pokemon/${id}`).then(mapPokemon),
  createPokemon: (body: Omit<Pokemon, "IdPokemon">) =>
    request<RawPokemon>("/api/pokemon/", json(body)).then(mapPokemon),
  updatePokemon: (id: number, body: Omit<Pokemon, "IdPokemon">) =>
    request<void>(`/api/pokemon/${id}`, put(body)),
  deletePokemon: (id: number) =>
    request<void>(`/api/pokemon/${id}`, { method: "DELETE" }),
  listTipos: () =>
    request<RawTipo[]>("/api/tipos/").then((items) => items.map(mapTipo)),
  createTipo: (body: { Nombre: string }) =>
    request<RawTipo>("/api/tipos/", json(body)).then(mapTipo),
  updateTipo: (id: number, body: { Nombre: string }) =>
    request<void>(`/api/tipos/${id}`, put(body)),
  deleteTipo: (id: number) =>
    request<void>(`/api/tipos/${id}`, { method: "DELETE" }),
  listPokemonTipos: () =>
    request<RawPokemonTipo[]>("/api/pokemon-tipos/").then((items) =>
      items.map(mapPokemonTipo),
    ),
  createPokemonTipo: (body: { IdPokemon: number; IdTipo: number }) =>
    request<RawPokemonTipo>("/api/pokemon-tipos/", json(body)).then(
      mapPokemonTipo,
    ),
  deletePokemonTipo: (id: number) =>
    request<void>(`/api/pokemon-tipos/${id}`, { method: "DELETE" }),
  listRegiones: () =>
    request<RawRegion[]>("/api/regiones/").then((items) =>
      items.map(mapRegion),
    ),
  createRegion: (body: { Nombre: string }) =>
    request<RawRegion>("/api/regiones/", json(body)).then(mapRegion),
  updateRegion: (id: number, body: { Nombre: string }) =>
    request<void>(`/api/regiones/${id}`, put(body)),
  deleteRegion: (id: number) =>
    request<void>(`/api/regiones/${id}`, { method: "DELETE" }),
  listGeneraciones: () =>
    request<RawGeneracion[]>("/api/generaciones/").then((items) =>
      items.map(mapGeneracion),
    ),
  createGeneracion: (body: { Nombre: string; IdRegion: number }) =>
    request<RawGeneracion>("/api/generaciones/", json(body)).then(
      mapGeneracion,
    ),
  updateGeneracion: (id: number, body: { Nombre: string; IdRegion: number }) =>
    request<void>(`/api/generaciones/${id}`, put(body)),
  deleteGeneracion: (id: number) =>
    request<void>(`/api/generaciones/${id}`, { method: "DELETE" }),
};
