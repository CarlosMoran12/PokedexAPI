using PokedexAPI.DTOs;

namespace PokedexAPI.Services;

public interface IFavoritoService
{
    Task<IEnumerable<FavoritoResponseDto>> ObtenerPorUsuarioAsync(int idUsuario);
    Task<FavoritoResponseDto> AgregarAsync(AgregarFavoritoDto dto);
    Task<bool> EliminarAsync(int id);
}