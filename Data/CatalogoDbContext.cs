using Microsoft.EntityFrameworkCore;
using PokedexAPI.Models;

namespace PokedexAPI.Data;

public class CatalogoDbContext : DbContext
{
    public CatalogoDbContext(DbContextOptions<CatalogoDbContext> options)
        : base(options)
    {
    }

    public DbSet<Pokemon> Pokemon => Set<Pokemon>();
    public DbSet<Tipo> Tipos => Set<Tipo>();
    public DbSet<PokemonTipo> PokemonTipos => Set<PokemonTipo>();
    public DbSet<Region> Regiones => Set<Region>();
    public DbSet<Generacion> Generaciones => Set<Generacion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Region>(entity =>
        {
            entity.ToTable("region");
            entity.HasKey(e => e.IdRegion);

            entity.Property(e => e.IdRegion)
                .HasColumnName("id_region");

            entity.Property(e => e.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(100)
                .IsRequired();

            entity.HasIndex(e => e.Nombre)
                .IsUnique();
        });

        modelBuilder.Entity<Generacion>(entity =>
        {
            entity.ToTable("generacion");
            entity.HasKey(e => e.IdGeneracion);

            entity.Property(e => e.IdGeneracion)
                .HasColumnName("id_generacion");

            entity.Property(e => e.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.IdRegion)
                .HasColumnName("id_region");

            entity.HasOne<Region>()
                .WithMany()
                .HasForeignKey(e => e.IdRegion)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Pokemon>(entity =>
        {
            entity.ToTable("pokemon");
            entity.HasKey(e => e.IdPokemon);

            entity.Property(e => e.IdPokemon)
                .HasColumnName("id_pokemon");

            entity.Property(e => e.NumeroPokedex)
                .HasColumnName("numero_pokedex");

            entity.Property(e => e.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Altura)
                .HasColumnName("altura")
                .HasPrecision(6, 2);

            entity.Property(e => e.Peso)
                .HasColumnName("peso")
                .HasPrecision(6, 2);

            entity.Property(e => e.Imagen)
                .HasColumnName("imagen")
                .HasMaxLength(255);

            entity.Property(e => e.IdGeneracion)
                .HasColumnName("id_generacion");

            entity.HasIndex(e => e.NumeroPokedex)
                .IsUnique();

            entity.HasOne<Generacion>()
                .WithMany()
                .HasForeignKey(e => e.IdGeneracion)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Tipo>(entity =>
        {
            entity.ToTable("tipo");
            entity.HasKey(e => e.IdTipo);

            entity.Property(e => e.IdTipo)
                .HasColumnName("id_tipo");

            entity.Property(e => e.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(50)
                .IsRequired();

            entity.HasIndex(e => e.Nombre)
                .IsUnique();
        });

        modelBuilder.Entity<PokemonTipo>(entity =>
        {
            entity.ToTable("pokemon_tipo");
            entity.HasKey(e => e.IdPokemonTipo);

            entity.Property(e => e.IdPokemonTipo)
                .HasColumnName("id_pokemon_tipo");

            entity.Property(e => e.IdPokemon)
                .HasColumnName("id_pokemon");

            entity.Property(e => e.IdTipo)
                .HasColumnName("id_tipo");

            entity.HasIndex(e => new { e.IdPokemon, e.IdTipo })
                .IsUnique();

            entity.HasOne<Pokemon>()
                .WithMany()
                .HasForeignKey(e => e.IdPokemon)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<Tipo>()
                .WithMany()
                .HasForeignKey(e => e.IdTipo)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
