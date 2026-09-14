using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PokedexAPI.Data;
using PokedexAPI.Endpoints;
using PokedexAPI.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("PokedexConnection")
    ?? throw new InvalidOperationException("No se encontró la cadena de conexión.");

builder.Services.AddDbContext<CatalogoDbContext>(options =>
    options.UseNpgsql(connectionString));

#region Servicios
builder.Services.AddScoped<PokemonService>();
builder.Services.AddScoped<TipoService>();
builder.Services.AddScoped<PokemonTipoService>();
builder.Services.AddScoped<RegionService>();
builder.Services.AddScoped<GeneracionService>();
#endregion

#region Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PokedexMaster API",
        Version = "v1",
        Description = "API REST para la aplicación PokedexMaster"
    });
});
#endregion

var app = builder.Build();

#region Swagger UI
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "PokedexMaster API v1");
    options.RoutePrefix = "swagger";
});
#endregion

app.MapGet("/", () => Results.Ok(new
{
    api = "PokedexMaster API",
    estado = "Funcionando",
    swagger = "/swagger"
}));

app.MapPokemonEndpoints();
app.MapTipoEndpoints();
app.MapPokemonTipoEndpoints();
app.MapRegionEndpoints();
app.MapGeneracionEndpoints();

app.Run();
