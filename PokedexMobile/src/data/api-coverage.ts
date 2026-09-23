export const unsupportedPokemonFields = [
  'Habilidades',
  'Estadísticas',
  'Evoluciones',
  'Variantes normal/shiny',
  'Sonido',
] as const;

export const clientPaginationDecision =
  'La API devuelve la lista completa sin parámetros de paginación; el catálogo pagina en cliente después de aplicar búsqueda y filtros.';
