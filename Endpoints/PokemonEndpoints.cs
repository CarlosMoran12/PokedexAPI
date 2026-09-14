using PokedexAPI.DTOs;
using PokedexAPI.Services;

namespace PokedexAPI.Endpoints;

public static class PokemonEndpoints
{
    public static void MapPokemonEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/pokemon");

        group.MapGet("/", async (PokemonService service) =>
            Results.Ok(await service.GetAllAsync()));

        group.MapGet("/{id:int}", async (int id, PokemonService service) =>
        {
            var item = await service.GetByIdAsync(id);
            return item is null ? Results.NotFound() : Results.Ok(item);
        });

        group.MapGet("/numero/{numero:int}", async (int numero, PokemonService service) =>
        {
            var item = await service.GetByNumeroAsync(numero);
            return item is null ? Results.NotFound() : Results.Ok(item);
        });

        group.MapPost("/", async (PokemonRequest request, PokemonService service) =>
            Results.Ok(await service.CreateAsync(request)));

        group.MapPut("/{id:int}", async (int id, PokemonRequest request, PokemonService service) =>
            await service.UpdateAsync(id, request)
                ? Results.NoContent()
                : Results.NotFound());

        group.MapDelete("/{id:int}", async (int id, PokemonService service) =>
            await service.DeleteAsync(id)
                ? Results.NoContent()
                : Results.NotFound());
    }
}
