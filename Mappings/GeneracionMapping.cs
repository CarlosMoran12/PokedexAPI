using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class GeneracionMapping
{
    public static GeneracionDto ToDto(this Generacion item) => new()
    {
        IdGeneracion = item.IdGeneracion,
        Nombre = item.Nombre,
        IdRegion = item.IdRegion
    };
}
