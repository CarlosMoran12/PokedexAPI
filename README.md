# PokedexAPI

Estructura inicial del proyecto PokedexAPI para trabajo en equipo.

## Parte realizada por Carlos

Carlos trabaja en la estructura de datos:

- `Models/`
  - `Pokemon.cs`
  - `PokemonType.cs`
  - `Region.cs`
- `DTOs/`
  - `PokemonDto.cs`
  - `PokemonDetailDto.cs`
  - `PokemonListDto.cs`
- `Mappings/`
  - `PokemonMapping.cs`

Esta parte ya está incluida en el proyecto.

## Parte pendiente para la segunda persona

La segunda persona debe trabajar principalmente en:

- `Services/`
  - servicio para consumir PokéAPI
- `Endpoints/`
  - endpoints de Pokémon, tipos o regiones
- `Program.cs`
  - registrar servicios y endpoints
- pruebas en archivo `.http`, si el docente las solicita

> `Program.cs` contiene únicamente una ruta temporal para que la rama inicial de Carlos pueda compilar y ejecutarse antes de integrar el trabajo de la segunda persona.

## Probar la estructura actual

```bash
dotnet restore
dotnet build
dotnet run
```

Después de integrar ambas partes se deben probar los endpoints definitivos.
