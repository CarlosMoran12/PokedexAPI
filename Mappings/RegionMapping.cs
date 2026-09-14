using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class RegionMapping
{
    public static RegionDto ToDto(this Region item) => new()
    {
        IdRegion = item.IdRegion,
        Nombre = item.Nombre
    };
}
