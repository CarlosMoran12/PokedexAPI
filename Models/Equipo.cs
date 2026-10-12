using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PokedexAPI.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
}

public class EquipoPokemon
{
    public int Id { get; set; }
    public int IdEquipo { get; set; }
    public int IdPokemon { get; set; }
    public int Orden { get; set; }
}

public class Equipo
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int IdUsuario { get; set; }

    [Required]
    [MaxLength(100)]
    public string NombreEquipo { get; set; } = string.Empty;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Usuario? Usuario { get; set; }

    [JsonIgnore]
    public ICollection<EquipoPokemon>? EquipoPokemones { get; set; }
}