using PokedexAPI.DTOs;
using PokedexAPI.Services;

namespace PokedexAPI.Endpoints;

public static class TipoEndpoints
{
    public static void MapTipoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/tipos");

        group.MapGet("/", async (TipoService service) =>
            Results.Ok(await service.GetAllAsync()));

        group.MapGet("/{id:int}", async (int id, TipoService service) =>
        {
            var item = await service.GetByIdAsync(id);
            return item is null ? Results.NotFound() : Results.Ok(item);
        });

        group.MapPost("/", async (TipoRequest request, TipoService service) =>
            Results.Ok(await service.CreateAsync(request)));

        group.MapPut("/{id:int}", async (int id, TipoRequest request, TipoService service) =>
            await service.UpdateAsync(id, request)
                ? Results.NoContent()
                : Results.NotFound());

        group.MapDelete("/{id:int}", async (int id, TipoService service) =>
            await service.DeleteAsync(id)
                ? Results.NoContent()
                : Results.NotFound());
    }
}
