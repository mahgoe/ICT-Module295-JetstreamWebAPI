using JetstreamSkiserviceAPI.Models;
using JetstreamSkiserviceAPI.Services;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace JetstreamSkiserviceAPI
{
    /// <summary>
    /// Main Program from the backend
    /// </summary>
    /// <remarks>
    /// If you use a other IP-Adress than the CORS registered, change it.
    /// On Errors please look at the root-folder on the webapi.log
    /// </remarks>
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add Serilogger
            var logger = new LoggerConfiguration()
                .ReadFrom.Configuration(builder.Configuration)
                .Enrich.FromLogContext()
                .CreateLogger();

            builder.Logging.ClearProviders();
            builder.Logging.AddSerilog(logger);

            // Add DbContext class
            builder.Services.AddDbContext<RegistrationsContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("JetstreamSkiserviceDB")));

            // Add Scopes from the implemented interfaces
            builder.Services.AddScoped<IRegistrationService, RegistrationService>();
            builder.Services.AddScoped<IStatusService, StatusService>();
            builder.Services.AddScoped<ITokenService, TokenService>();

            // Configure CORS
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins("http://localhost:5502", "http://127.0.0.1:5502") // Change this IP's
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddAuthorization();
            builder.Services.AddControllers();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors(); // Activate CORS

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
