using Microsoft.AspNetCore.Mvc;
using PokedexAPI.DTOs;
using PokedexAPI.Services;

namespace PokedexAPI.Endpoints;

public static class FavoritoEndpoints
{
    public static void MapFavoritoEndpoints(this IEndpointRouteBuilder app)
    {
        // Usa IFavoritoService y ponle [FromServices]
        app.MapGet("/api/favoritos/usuario/{idUsuario}", async (int idUsuario, [FromServices] IFavoritoService service) =>
        {
            var favoritos = await service.ObtenerPorUsuarioAsync(idUsuario);
            return Results.Ok(favoritos);
        });

        app.MapPost("/api/favoritos", async (AgregarFavoritoDto dto, [FromServices] IFavoritoService service) =>
        {
            var resultado = await service.AgregarAsync(dto);
            return Results.Created($"/api/favoritos/{resultado.Id}", resultado);
        });

        app.MapDelete("/api/favoritos/{id}", async (int id, [FromServices] IFavoritoService service) =>
        {
            var eliminado = await service.EliminarAsync(id);
            return eliminado ? Results.NoContent() : Results.NotFound();
        });
    }
}