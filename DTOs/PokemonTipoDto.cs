namespace PokedexAPI.DTOs;

public class PokemonTipoDto
{
    public int IdPokemonTipo { get; set; }
    public int IdPokemon { get; set; }
    public int IdTipo { get; set; }
}

public class PokemonTipoRequest
{
    public int IdPokemon { get; set; }
    public int IdTipo { get; set; }
}
