namespace PokedexAPI.DTOs;

public class GeneracionDto
{
    public int IdGeneracion { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int IdRegion { get; set; }
}

public class GeneracionRequest
{
    public string Nombre { get; set; } = string.Empty;
    public int IdRegion { get; set; }
}
