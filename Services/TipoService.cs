using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class TipoService
{
    private readonly CatalogoDbContext _db;

    public TipoService(CatalogoDbContext db) => _db = db;

    public async Task<List<TipoDto>> GetAllAsync() =>
        await _db.Tipos.AsNoTracking().Select(x => x.ToDto()).ToListAsync();

    public async Task<TipoDto?> GetByIdAsync(int id)
    {
        var item = await _db.Tipos.FindAsync(id);
        return item?.ToDto();
    }

    public async Task<TipoDto> CreateAsync(TipoRequest request)
    {
        var item = new Tipo { Nombre = request.Nombre };
        _db.Tipos.Add(item);
        await _db.SaveChangesAsync();
        return item.ToDto();
    }

    public async Task<bool> UpdateAsync(int id, TipoRequest request)
    {
        var item = await _db.Tipos.FindAsync(id);
        if (item is null) return false;

        item.Nombre = request.Nombre;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _db.Tipos.FindAsync(id);
        if (item is null) return false;

        _db.Tipos.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }
}
