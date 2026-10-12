using PokedexAPI.DTOs;

namespace PokedexAPI.Services;

public interface IUsuarioService
{
    Task<List<UsuarioResponseDto>> ObtenerTodosAsync();
    Task<UsuarioResponseDto?> ObtenerPorIdAsync(int id);
    Task<UsuarioResponseDto> RegistrarAsync(RegistrarUsuarioDto dto);
    Task<UsuarioResponseDto?> LoginAsync(LoginUsuarioDto dto);
    Task<UsuarioResponseDto?> ActualizarAsync(int id, ActualizarUsuarioDto dto);
    Task<bool> EliminarAsync(int id);
}