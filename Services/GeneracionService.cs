using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class GeneracionService
{
    private readonly CatalogoDbContext _db;

    public GeneracionService(CatalogoDbContext db) => _db = db;

    public async Task<List<GeneracionDto>> GetAllAsync() =>
        await _db.Generaciones.AsNoTracking().Select(x => x.ToDto()).ToListAsync();

    public async Task<GeneracionDto?> GetByIdAsync(int id)
    {
        var item = await _db.Generaciones.FindAsync(id);
        return item?.ToDto();
    }

    public async Task<GeneracionDto> CreateAsync(GeneracionRequest request)
    {
        var item = new Generacion
        {
            Nombre = request.Nombre,
            IdRegion = request.IdRegion
        };

        _db.Generaciones.Add(item);
        await _db.SaveChangesAsync();
        return item.ToDto();
    }

    public async Task<bool> UpdateAsync(int id, GeneracionRequest request)
    {
        var item = await _db.Generaciones.FindAsync(id);
        if (item is null) return false;

        item.Nombre = request.Nombre;
        item.IdRegion = request.IdRegion;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _db.Generaciones.FindAsync(id);
        if (item is null) return false;

        _db.Generaciones.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }
}
