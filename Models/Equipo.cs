namespace PokedexAPI.Models;

public class Equipo
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int IdUsuario { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Usuario? Usuario { get; set; }
    public ICollection<EquipoPokemon> EquipoPokemones { get; set; } = new List<EquipoPokemon>();
}