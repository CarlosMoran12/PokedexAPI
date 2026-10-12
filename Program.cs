using Microsoft.EntityFrameworkCore;
using PokedexAPI.Data;
using PokedexAPI.Endpoints;
using PokedexAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Base de datos InMemory
builder.Services.AddDbContext<CatalogoDbContext>(options =>
    options.UseInMemoryDatabase("PokedexDb"));

// 2. Registro de Inyección de Dependencias
// Servicios con interfaz
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IEquipoService, EquipoService>();
builder.Services.AddScoped<IEquipoPokemonService, EquipoPokemonService>();
builder.Services.AddScoped<IFavoritoService, FavoritoService>();

// Servicios concretos (sin interfaz)
builder.Services.AddScoped<PokemonService>();
builder.Services.AddScoped<RegionService>();
builder.Services.AddScoped<TipoService>();
builder.Services.AddScoped<PokemonTipoService>();
builder.Services.AddScoped<GeneracionService>();

// 3. Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 4. Mapeo de Endpoints
app.MapUsuarioEndpoints();
app.MapEquipoEndpoints();
app.MapEquipoPokemonEndpoints();
app.MapFavoritoEndpoints();

app.Run();