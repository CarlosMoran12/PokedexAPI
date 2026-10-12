using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.DTOs;
using PokedexAPI.Mappings;
using PokedexAPI.Models;

namespace PokedexAPI.Services;

public class UsuarioService : IUsuarioService
{
    private readonly CatalogoDbContext _context;

    public UsuarioService(CatalogoDbContext context)
    {
        _context = context;
    }

    public async Task<List<UsuarioResponseDto>> ObtenerTodosAsync()
    {
        var usuarios = await _context.Usuarios.ToListAsync();
        return usuarios.Select(u => u.ToDto()).ToList();
    }

    public async Task<UsuarioResponseDto?> ObtenerPorIdAsync(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        return usuario?.ToDto();
    }

    public async Task<UsuarioResponseDto> RegistrarAsync(RegistrarUsuarioDto dto)
    {
        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Correo = dto.Correo,
            PasswordHash = dto.Password,
            FechaRegistro = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return usuario.ToDto();
    }

    public async Task<UsuarioResponseDto?> LoginAsync(LoginUsuarioDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo == dto.Correo && u.PasswordHash == dto.Password);

        return usuario?.ToDto();
    }

    public async Task<UsuarioResponseDto?> ActualizarAsync(int id, ActualizarUsuarioDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return null;

        usuario.Nombre = dto.Nombre;
        usuario.Correo = dto.Correo;

        await _context.SaveChangesAsync();
        return usuario.ToDto();
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return false;

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
        return true;
    }
}