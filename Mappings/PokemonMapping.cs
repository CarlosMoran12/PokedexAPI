using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class PokemonMapping
{
    public static PokemonDto ToDto(this Pokemon item) => new()
    {
        IdPokemon = item.IdPokemon,
        NumeroPokedex = item.NumeroPokedex,
        Nombre = item.Nombre,
        Altura = item.Altura,
        Peso = item.Peso,
        Imagen = item.Imagen,
        IdGeneracion = item.IdGeneracion
    };
}
