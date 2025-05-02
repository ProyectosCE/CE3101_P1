using CEDigital_api.Models.Sql;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

namespace CEDigital_api.Data.Sql
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Carpeta> Carpetas { get; set; }
        public DbSet<Carrera> Carreras { get; set; }
        public DbSet<Curso> Cursos { get; set; }
        public DbSet<Documento> Documentos { get; set; }
        public DbSet<Entregable> Entregables { get; set; }
        public DbSet<Evaluacion> Evaluaciones { get; set; }
        public DbSet<Grupo> Grupos { get; set; }
        public DbSet<GrupoXEstudiante> GruposXEstudiantes { get; set; }
        public DbSet<Nota> Notas { get; set; }
        public DbSet<Noticia> Noticias { get; set; }
        public DbSet<ProfesorXGrupo> ProfesoresXGrupos { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<Semestre> Semestres { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //=========== Relaciones 1 a 1 ===================

            // Entregable(1) - Nota(1)
            modelBuilder.Entity<Nota>()
                .HasOne(n => n.entregable)
                .WithOne(e => e.nota)
                .HasForeignKey<Nota>(n => n.id_entregable);

            //=========== Relaciones 1 a N ===================

            // Evaluacion(1) - Entregable(N)
            modelBuilder.Entity<Entregable>()
                .HasOne(e => e.evaluacion)
                .WithMany(ev => ev.entregables)
                .HasForeignKey(e => e.id_evaluacion);

            // Rubro(1) - Evaluacion(N)
            modelBuilder.Entity<Evaluacion>()
                .HasOne(e => e.rubro)
                .WithMany(r => r.evaluaciones)
                .HasForeignKey(e => e.id_rubro);

            // Grupo(1) - Rubro(N)
            modelBuilder.Entity<Rubro>()
                .HasOne(r => r.grupo)
                .WithMany(g => g.rubros)
                .HasForeignKey(r => r.id_grupo);

            // Grupo(1) - Carpeta(N)
            modelBuilder.Entity<Carpeta>()
                .HasOne(c => c.grupo)
                .WithMany(g => g.carpetas)
                .HasForeignKey(c => c.id_grupo);

            // Carrera(1) - Curso(N)
            modelBuilder.Entity<Curso>()
                .HasOne(c => c.carrera)
                .WithMany(c => c.cursos)
                .HasForeignKey(c => c.codigo_carrera);

            // Grupo(1) - Noticia(N)
            modelBuilder.Entity<Noticia>()
                .HasOne(n => n.grupo)
                .WithMany(g => g.noticias)
                .HasForeignKey(n => n.id_grupo);

            // Semestre(1) - Curso(N)
            modelBuilder.Entity<Curso>()
                .HasOne(c => c.semestre)
                .WithMany(s => s.cursos)
                .HasForeignKey(c => c.id_semestre);

            // Carpeta(1) - Documento(N)
            modelBuilder.Entity<Documento>()
                .HasOne(d => d.carpeta)
                .WithMany(c => c.documentos)
                .HasForeignKey(d => d.id_carpeta);

            //========== Relaciones N a N ===================

            // Grupo(N) - Estudiante(M)
            modelBuilder.Entity<GrupoXEstudiante>()
                .HasKey(ge => new { ge.id_grupo, ge.carnet_estudiante });

            modelBuilder.Entity<GrupoXEstudiante>()
                .HasOne(ge => ge.grupo)
                .WithMany(g => g.estudiantes)
                .HasForeignKey(ge => ge.id_grupo);

            // Profesor(N) - Grupo(M)
            modelBuilder.Entity<ProfesorXGrupo>()
                .HasKey(pg => new { pg.cedula_profesor, pg.id_grupo });

            modelBuilder.Entity<ProfesorXGrupo>()
                .HasOne(pg => pg.grupo)
                .WithMany(g => g.profesores)
                .HasForeignKey(pg => pg.id_grupo);
        }
    }
}