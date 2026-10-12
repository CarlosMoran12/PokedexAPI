namespace PokedexAPI.DTOs;

public class EquipoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int IdUsuario { get; set; }
}

public class CrearEquipoDto
{
    public string Nombre { get; set; } = string.Empty;
    public int IdUsuario { get; set; }
}

public class ActualizarEquipoDto
{
    public string Nombre { get; set; } = string.Empty;
}

public class EquipoResponseDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int IdUsuario { get; set; }
    public DateTime FechaCreacion { get; set; }
}