namespace PokedexAPI.Models;

public class Pokemon
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Height { get; set; }
    public int Weight { get; set; }
    public List<PokemonType> Types { get; set; } = new();
}
