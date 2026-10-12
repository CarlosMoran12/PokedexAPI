using PokedexAPI.DTOs;
using PokedexAPI.Services;

namespace PokedexAPI.Endpoints;

public static class UsuarioEndpoints
{
    public static void MapUsuarioEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/usuarios").WithTags("Usuarios");

        group.MapGet("/", async (IUsuarioService service) =>
            Results.Ok(await service.ObtenerTodosAsync()));

        group.MapGet("/{id:int}", async (int id, IUsuarioService service) =>
        {
            var item = await service.ObtenerPorIdAsync(id);
            return item is null ? Results.NotFound() : Results.Ok(item);
        });

        group.MapPost("/registro", async (RegistrarUsuarioDto dto, IUsuarioService service) =>
            Results.Ok(await service.RegistrarAsync(dto)));

        group.MapPost("/login", async (LoginUsuarioDto dto, IUsuarioService service) =>
        {
            var resultado = await service.LoginAsync(dto);
            return resultado is null ? Results.Unauthorized() : Results.Ok(resultado);
        });
    }
}