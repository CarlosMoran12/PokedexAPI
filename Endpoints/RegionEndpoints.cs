using PokedexAPI.DTOs;
using PokedexAPI.Services;

namespace PokedexAPI.Endpoints;

public static class RegionEndpoints
{
    public static void MapRegionEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/regiones");

        group.MapGet("/", async (RegionService service) =>
            Results.Ok(await service.GetAllAsync()));

        group.MapGet("/{id:int}", async (int id, RegionService service) =>
        {
            var item = await service.GetByIdAsync(id);
            return item is null ? Results.NotFound() : Results.Ok(item);
        });

        group.MapPost("/", async (RegionRequest request, RegionService service) =>
            Results.Ok(await service.CreateAsync(request)));

        group.MapPut("/{id:int}", async (int id, RegionRequest request, RegionService service) =>
            await service.UpdateAsync(id, request)
                ? Results.NoContent()
                : Results.NotFound());

        group.MapDelete("/{id:int}", async (int id, RegionService service) =>
            await service.DeleteAsync(id)
                ? Results.NoContent()
                : Results.NotFound());
    }
}
