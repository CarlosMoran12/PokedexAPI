using PokedexAPI.DTOs;

namespace PokedexAPI.Services;

public interface IEquipoService
{
    Task<IEnumerable<EquipoDto>> ObtenerTodosAsync();
    Task<EquipoDto?> ObtenerPorIdAsync(int id);
    Task<EquipoDto> CrearAsync(CrearEquipoDto dto);
    Task<bool> EliminarAsync(int id);
}