using PokedexAPI.DTOs;
using PokedexAPI.Services;

namespace PokedexAPI.Endpoints;

public static class GeneracionEndpoints
{
    public static void MapGeneracionEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/generaciones");

        group.MapGet("/", async (GeneracionService service) =>
            Results.Ok(await service.GetAllAsync()));

        group.MapGet("/{id:int}", async (int id, GeneracionService service) =>
        {
            var item = await service.GetByIdAsync(id);
            return item is null ? Results.NotFound() : Results.Ok(item);
        });

        group.MapPost("/", async (GeneracionRequest request, GeneracionService service) =>
            Results.Ok(await service.CreateAsync(request)));

        group.MapPut("/{id:int}", async (int id, GeneracionRequest request, GeneracionService service) =>
            await service.UpdateAsync(id, request)
                ? Results.NoContent()
                : Results.NotFound());

        group.MapDelete("/{id:int}", async (int id, GeneracionService service) =>
            await service.DeleteAsync(id)
                ? Results.NoContent()
                : Results.NotFound());
    }
}
