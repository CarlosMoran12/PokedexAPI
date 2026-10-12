namespace PokedexAPI.DTOs;

public class EquipoPokemonDto
{
    public int Id { get; set; }
    public int IdEquipo { get; set; }
    public int IdPokemon { get; set; }
    public int Orden { get; set; }
}

public class CrearEquipoPokemonDto
{
    public int IdEquipo { get; set; }
    public int IdPokemon { get; set; }
    public int Orden { get; set; }
}