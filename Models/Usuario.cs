namespace PokedexAPI.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    public ICollection<Equipo> Equipos { get; set; } = new List<Equipo>();
    public ICollection<Favorito> Favoritos { get; set; } = new List<Favorito>();
}