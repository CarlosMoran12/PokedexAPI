namespace PokedexAPI.DTOs;

public class FavoritoDto
{
    public int Id { get; set; }
    public int IdUsuario { get; set; }
    public int IdPokemon { get; set; }
}

public class AgregarFavoritoDto
{
    public int IdUsuario { get; set; }
    public int IdPokemon { get; set; }
}

public class FavoritoResponseDto
{
    public int Id { get; set; }
    public int IdUsuario { get; set; }
    public int IdPokemon { get; set; }
    public DateTime FechaAgregado { get; set; }
}