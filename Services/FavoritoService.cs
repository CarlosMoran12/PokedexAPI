using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class FavoritoService : IFavoritoService
{
    private readonly CatalogoDbContext _context;

    public FavoritoService(CatalogoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FavoritoResponseDto>> ObtenerPorUsuarioAsync(int idUsuario)
    {
        var lista = await _context.Favoritos
            .Where(f => f.IdUsuario == idUsuario)
            .ToListAsync();

        return lista.Select(f => f.ToDto());
    }

    public async Task<FavoritoResponseDto> AgregarAsync(AgregarFavoritoDto dto)
    {
        var entidad = dto.ToEntity();
        _context.Favoritos.Add(entidad);
        await _context.SaveChangesAsync();

        return entidad.ToDto();
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var fav = await _context.Favoritos.FindAsync(id);
        if (fav is null) return false;

        _context.Favoritos.Remove(fav);
        await _context.SaveChangesAsync();
        return true;
    }
}