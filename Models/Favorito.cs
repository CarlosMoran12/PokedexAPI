namespace PokedexAPI.Models;

public class Favorito
{
    public int Id { get; set; }
    public int IdUsuario { get; set; }
    public int IdPokemon { get; set; }
    public DateTime FechaAgregado { get; set; } = DateTime.UtcNow;

    // Propiedad de navegación
    public Usuario? Usuario { get; set; }
}