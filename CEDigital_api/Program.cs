using CEDigital_api.Data.Mongo;
using CEDigital_api.Data.Sql;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDb"));

builder.Services.AddSingleton<ProfesorService>();
builder.Services.AddSingleton<EstudianteService>();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<SqlService>();
builder.Services.AddScoped<SqlEstudianteService>();
builder.Services.AddScoped<SqlProfesorService>();
//builder.Services.AddScoped<MongoSeeder>();


// SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//using (var scope = app.Services.CreateScope())
//{
//    var seeder = scope.ServiceProvider.GetRequiredService<MongoSeeder>();
//    await seeder.SeedAsync();
//}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
