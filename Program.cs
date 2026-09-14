var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "PokedexAPI - estructura base de Carlos");

app.Run();
