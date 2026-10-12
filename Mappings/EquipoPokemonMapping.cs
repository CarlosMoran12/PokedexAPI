using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class EquipoPokemonMappings
{
    public static EquipoPokemonDto ToDto(this EquipoPokemon entity)
    {
        return new EquipoPokemonDto
        {
            Id = entity.Id,
            IdEquipo = entity.IdEquipo,
            IdPokemon = entity.IdPokemon,
            Orden = entity.Orden
        };
    }

    public static EquipoPokemon ToEntity(this CrearEquipoPokemonDto dto)
    {
        return new EquipoPokemon
        {
            IdEquipo = dto.IdEquipo,
            IdPokemon = dto.IdPokemon,
            Orden = dto.Orden
        };
    }
}