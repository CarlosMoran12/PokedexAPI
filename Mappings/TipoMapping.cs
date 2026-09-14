using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class TipoMapping
{
    public static TipoDto ToDto(this Tipo item) => new()
    {
        IdTipo = item.IdTipo,
        Nombre = item.Nombre
    };
}
