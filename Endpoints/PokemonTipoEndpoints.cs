using PokedexAPI.DTOs;
using PokedexAPI.Services;

namespace PokedexAPI.Endpoints;

public static class PokemonTipoEndpoints
{
    public static void MapPokemonTipoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/pokemon-tipos");

        group.MapGet("/", async (PokemonTipoService service) =>
            Results.Ok(await service.GetAllAsync()));

        group.MapGet("/{id:int}", async (int id, PokemonTipoService service) =>
        {
            var item = await service.GetByIdAsync(id);
            return item is null ? Results.NotFound() : Results.Ok(item);
        });

        group.MapPost("/", async (PokemonTipoRequest request, PokemonTipoService service) =>
            Results.Ok(await service.CreateAsync(request)));

        group.MapPut("/{id:int}", async (int id, PokemonTipoRequest request, PokemonTipoService service) =>
            await service.UpdateAsync(id, request)
                ? Results.NoContent()
                : Results.NotFound());

        group.MapDelete("/{id:int}", async (int id, PokemonTipoService service) =>
            await service.DeleteAsync(id)
                ? Results.NoContent()
                : Results.NotFound());
    }
}
