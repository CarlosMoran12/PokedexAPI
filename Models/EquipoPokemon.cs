namespace PokedexAPI.Models;

public class EquipoPokemon
{
    public int Id { get; set; }
    public int IdEquipo { get; set; }
    public int IdPokemon { get; set; }
    public int Orden { get; set; }

    public Equipo? Equipo { get; set; }
}