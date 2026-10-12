using PokedexAPI.DTOs;
using PokedexAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace PokedexAPI.Endpoints;

public static class EquipoEndpoints
{
    public static void MapEquipoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/equipos").WithTags("Equipos");

        group.MapGet("/", async (IEquipoService service) =>
        {
            var lista = await service.ObtenerTodosAsync();
            return Results.Ok(lista);
        });

        group.MapGet("/{id:int}", async (int id, IEquipoService service) =>
        {
            var equipo = await service.ObtenerPorIdAsync(id);
            return equipo is not null ? Results.Ok(equipo) : Results.NotFound();
        });

        group.MapPost("/", async (CrearEquipoDto dto, IEquipoService service) =>
        {
            var creado = await service.CrearAsync(dto);
            return Results.Created($"/api/equipos/{creado.Id}", creado);
        });

        group.MapDelete("/{id:int}", async (int id, IEquipoService service) =>
        {
            var eliminado = await service.EliminarAsync(id);
            return eliminado ? Results.NoContent() : Results.NotFound();
        });
    }
}