using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class EquipoService : IEquipoService
{
    private readonly CatalogoDbContext _context;

    public EquipoService(CatalogoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EquipoDto>> ObtenerTodosAsync()
    {
        var lista = await _context.Equipos.ToListAsync();
        return lista.Select(e => e.ToDto());
    }

    public async Task<EquipoDto?> ObtenerPorIdAsync(int id)
    {
        var equipo = await _context.Equipos.FindAsync(id);
        return equipo?.ToDto();
    }

    public async Task<EquipoDto> CrearAsync(CrearEquipoDto dto)
    {
        var entidad = dto.ToEntity();
        _context.Equipos.Add(entidad);
        await _context.SaveChangesAsync();
        return entidad.ToDto();
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var equipo = await _context.Equipos.FindAsync(id);
        if (equipo is null) return false;

        _context.Equipos.Remove(equipo);
        await _context.SaveChangesAsync();
        return true;
    }
}