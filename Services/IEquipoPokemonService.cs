using PokedexAPI.DTOs;

namespace PokedexAPI.Services;

public interface IEquipoPokemonService
{
    Task<IEnumerable<EquipoPokemonDto>> ObtenerPokemonesPorEquipoAsync(int idEquipo);
    Task<EquipoPokemonDto> AgregarPokemonAsync(CrearEquipoPokemonDto dto);
    Task<bool> EliminarPorIdAsync(int id);
}