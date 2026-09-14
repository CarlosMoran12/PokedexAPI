using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class PokemonMapping
{
    public static PokemonDto ToDto(this Pokemon pokemon)
    {
        return new PokemonDto
        {
            Id = pokemon.Id,
            Name = pokemon.Name,
            ImageUrl = $"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon.Id}.png"
        };
    }
}
