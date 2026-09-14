using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class RegionService
{
    private readonly CatalogoDbContext _db;

    public RegionService(CatalogoDbContext db) => _db = db;

    public async Task<List<RegionDto>> GetAllAsync() =>
        await _db.Regiones.AsNoTracking().Select(x => x.ToDto()).ToListAsync();

    public async Task<RegionDto?> GetByIdAsync(int id)
    {
        var item = await _db.Regiones.FindAsync(id);
        return item?.ToDto();
    }

    public async Task<RegionDto> CreateAsync(RegionRequest request)
    {
        var item = new Region { Nombre = request.Nombre };
        _db.Regiones.Add(item);
        await _db.SaveChangesAsync();
        return item.ToDto();
    }

    public async Task<bool> UpdateAsync(int id, RegionRequest request)
    {
        var item = await _db.Regiones.FindAsync(id);
        if (item is null) return false;

        item.Nombre = request.Nombre;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _db.Regiones.FindAsync(id);
        if (item is null) return false;

        _db.Regiones.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }
}
