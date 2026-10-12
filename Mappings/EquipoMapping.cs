using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class EquipoMapping
{
    public static EquipoDto ToDto(this Equipo entity)
    {
        return new EquipoDto
        {
            Id = entity.Id,
            Nombre = entity.Nombre,
            IdUsuario = entity.IdUsuario
        };
    }

    public static Equipo ToEntity(this CrearEquipoDto dto)
    {
        return new Equipo
        {
            Nombre = dto.Nombre,
            IdUsuario = dto.IdUsuario
        };
    }
}