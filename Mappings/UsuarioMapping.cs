using PokedexAPI.DTOs;
using PokedexAPI.Models;

namespace PokedexAPI.Mappings;

public static class UsuarioMappingExtensions
{
    public static UsuarioResponseDto ToDto(this Usuario usuario)
    {
        return new UsuarioResponseDto(
            usuario.Id,
            usuario.Nombre,
            usuario.Correo,
            usuario.FechaRegistro
        );
    }
}