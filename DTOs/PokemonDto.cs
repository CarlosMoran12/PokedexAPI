namespace PokedexAPI.DTOs;

public class PokemonDto
{
    public int IdPokemon { get; set; }
    public int NumeroPokedex { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal? Altura { get; set; }
    public decimal? Peso { get; set; }
    public string? Imagen { get; set; }
    public int IdGeneracion { get; set; }
}

public class PokemonRequest
{
    public int NumeroPokedex { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal? Altura { get; set; }
    public decimal? Peso { get; set; }
    public string? Imagen { get; set; }
    public int IdGeneracion { get; set; }
}
