using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class EquipoPokemonService : IEquipoPokemonService
{
    private readonly CatalogoDbContext _context;

    public EquipoPokemonService(CatalogoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EquipoPokemonDto>> ObtenerPokemonesPorEquipoAsync(int idEquipo)
    {
        var lista = await _context.EquipoPokemones
            .Where(ep => ep.IdEquipo == idEquipo)
            .ToListAsync();

        return lista.Select(ep => ep.ToDto());
    }

    public async Task<EquipoPokemonDto> AgregarPokemonAsync(CrearEquipoPokemonDto dto)
    {
        var entidad = dto.ToEntity();
        _context.EquipoPokemones.Add(entidad);
        await _context.SaveChangesAsync();
        return entidad.ToDto();
    }

    public async Task<bool> EliminarPorIdAsync(int id)
    {
        var ep = await _context.EquipoPokemones.FindAsync(id);
        if (ep == null) return false;

        _context.EquipoPokemones.Remove(ep);
        await _context.SaveChangesAsync();
        return true;
    }
}