namespace PokedexAPI.DTOs;

public class TipoDto
{
    public int IdTipo { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class TipoRequest
{
    public string Nombre { get; set; } = string.Empty;
}
