using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class FavoritoMapping
{
    public static FavoritoResponseDto ToDto(this Favorito entity)
    {
        return new FavoritoResponseDto
        {
            Id = entity.Id,
            IdUsuario = entity.IdUsuario,
            IdPokemon = entity.IdPokemon,
            FechaAgregado = entity.FechaAgregado
        };
    }

    public static Favorito ToEntity(this AgregarFavoritoDto dto)
    {
        return new Favorito
        {
            IdUsuario = dto.IdUsuario,
            IdPokemon = dto.IdPokemon,
            FechaAgregado = DateTime.UtcNow
        };
    }
}