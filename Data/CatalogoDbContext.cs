using Microsoft.EntityFrameworkCore;
using PokedexAPI.Models;

namespace PokedexAPI.Data;

public class CatalogoDbContext : DbContext
{
    public CatalogoDbContext(DbContextOptions<CatalogoDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Equipo> Equipos { get; set; }
    public DbSet<EquipoPokemon> EquipoPokemones { get; set; }
    public DbSet<Favorito> Favoritos { get; set; }
    public DbSet<Pokemon> Pokemon { get; set; }
    public DbSet<Region> Regiones { get; set; }
    public DbSet<Tipo> Tipos { get; set; }
    public DbSet<PokemonTipo> PokemonTipos { get; set; }
    public DbSet<Generacion> Generaciones { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<EquipoPokemon>()
            .HasOne(ep => ep.Equipo)
            .WithMany(e => e.EquipoPokemones)
            .HasForeignKey(ep => ep.IdEquipo)
            .OnDelete(DeleteBehavior.Cascade);
    }
}