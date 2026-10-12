using PokedexAPI.DTOs;
using PokedexAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace PokedexAPI.Endpoints;

public static class EquipoPokemonEndpoints
{
    public static void MapEquipoPokemonEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/equipopokemon").WithTags("EquipoPokemon");

        group.MapGet("/equipo/{idEquipo:int}", async (int idEquipo, IEquipoPokemonService service) =>
        {
            var resultado = await service.ObtenerPokemonesPorEquipoAsync(idEquipo);
            return Results.Ok(resultado);
        });

        group.MapPost("/", async (CrearEquipoPokemonDto dto, IEquipoPokemonService service) =>
        {
            var creado = await service.AgregarPokemonAsync(dto);
            return Results.Created($"/api/equipopokemon/equipo/{creado.IdEquipo}", creado);
        });

        group.MapDelete("/{id:int}", async (int id, IEquipoPokemonService service) =>
        {
            var eliminado = await service.EliminarPorIdAsync(id);
            return eliminado ? Results.NoContent() : Results.NotFound();
        });
    }
}