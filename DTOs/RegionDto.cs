namespace PokedexAPI.DTOs;

public class RegionDto
{
    public int IdRegion { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class RegionRequest
{
    public string Nombre { get; set; } = string.Empty;
}
