namespace PokedexAPI.DTOs;

public record RegistrarUsuarioDto(
    string Nombre, 
    string Correo, 
    string Password
);

public record LoginUsuarioDto(
    string Correo, 
    string Password
);

public record ActualizarUsuarioDto(
    string Nombre, 
    string Correo
);

public record UsuarioResponseDto(
    int Id, 
    string Nombre, 
    string Correo, 
    DateTime FechaRegistro
);