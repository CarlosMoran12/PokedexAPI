using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class PokemonTipoService
{
    private readonly CatalogoDbContext _db;

    public PokemonTipoService(CatalogoDbContext db) => _db = db;

    public async Task<List<PokemonTipoDto>> GetAllAsync() =>
        await _db.PokemonTipos.AsNoTracking().Select(x => x.ToDto()).ToListAsync();

    public async Task<PokemonTipoDto?> GetByIdAsync(int id)
    {
        var item = await _db.PokemonTipos.FindAsync(id);
        return item?.ToDto();
    }

    public async Task<PokemonTipoDto> CreateAsync(PokemonTipoRequest request)
    {
        var item = new PokemonTipo
        {
            IdPokemon = request.IdPokemon,
            IdTipo = request.IdTipo
        };

        _db.PokemonTipos.Add(item);
        await _db.SaveChangesAsync();

        return item.ToDto();
    }

    public async Task<bool> UpdateAsync(int id, PokemonTipoRequest request)
    {
        var item = await _db.PokemonTipos.FindAsync(id);
        if (item is null) return false;

        item.IdPokemon = request.IdPokemon;
        item.IdTipo = request.IdTipo;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _db.PokemonTipos.FindAsync(id);
        if (item is null) return false;

        _db.PokemonTipos.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }
}
