using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class PokemonService
{
    private readonly CatalogoDbContext _db;

    public PokemonService(CatalogoDbContext db) => _db = db;

    public async Task<List<PokemonDto>> GetAllAsync() =>
        await _db.Pokemon.AsNoTracking().Select(x => x.ToDto()).ToListAsync();

    public async Task<PokemonDto?> GetByIdAsync(int id)
    {
        var item = await _db.Pokemon.FindAsync(id);
        return item?.ToDto();
    }

    public async Task<PokemonDto?> GetByNumeroAsync(int numero)
    {
        var item = await _db.Pokemon
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.NumeroPokedex == numero);

        return item?.ToDto();
    }

    public async Task<PokemonDto> CreateAsync(PokemonRequest request)
    {
        var item = new Pokemon
        {
            NumeroPokedex = request.NumeroPokedex,
            Nombre = request.Nombre,
            Altura = request.Altura,
            Peso = request.Peso,
            Imagen = request.Imagen,
            IdGeneracion = request.IdGeneracion
        };

        _db.Pokemon.Add(item);
        await _db.SaveChangesAsync();

        return item.ToDto();
    }

    public async Task<bool> UpdateAsync(int id, PokemonRequest request)
    {
        var item = await _db.Pokemon.FindAsync(id);
        if (item is null) return false;

        item.NumeroPokedex = request.NumeroPokedex;
        item.Nombre = request.Nombre;
        item.Altura = request.Altura;
        item.Peso = request.Peso;
        item.Imagen = request.Imagen;
        item.IdGeneracion = request.IdGeneracion;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _db.Pokemon.FindAsync(id);
        if (item is null) return false;

        _db.Pokemon.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }
}
