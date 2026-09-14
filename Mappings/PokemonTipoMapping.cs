using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class PokemonTipoMapping
{
    public static PokemonTipoDto ToDto(this PokemonTipo item) => new()
    {
        IdPokemonTipo = item.IdPokemonTipo,
        IdPokemon = item.IdPokemon,
        IdTipo = item.IdTipo
    };
}
