
using AutoMapper;
using Common.Dto;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Mock;

using Repository.Interfacese;
using Repository.Repositories;
using Service.Interfaces;
using Service.Services;
using System.Text;
using System.Net.WebSockets;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

// ✅ Load configuration
builder.Configuration   
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

// ✅ Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddHttpClient();

// ✅ Swagger + JWT support
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Demo API", Version = "v1" });

    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter JWT token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ✅ CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials(); // ← הוסף את זה!
    });
});

// ✅ Authentication + JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))

        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// ✅ AutoMapper
builder.Services.AddAutoMapper(typeof(MyMapper));

// ✅ Register Context, Repositories, Services
builder.Services.AddDbContext<IContext, Database>();
builder.Services.AddScoped<IUserServicecs, UserService>();
builder.Services.AddScoped<ICallsRepository, CallsRepository>();
builder.Services.AddScoped<IVolunteer, VolunteersRepository>();
builder.Services.AddScoped<ICallService, CallService>();
builder.Services.AddScoped<IService<CallsDto>>(sp => sp.GetRequiredService<ICallService>());
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
// ✅ VolunteersCallService with multi-interface registration
builder.Services.AddScoped<VolunteersCallService>();
builder.Services.AddScoped<IVolunteersCallLogic>(sp => sp.GetRequiredService<VolunteersCallService>());
builder.Services.AddScoped<IService<VolunteerCallsDto>>(sp => sp.GetRequiredService<VolunteersCallService>());
//builder.Services.AddHttpClient<IAssistantService, OpenAIAssistantService>();
builder.Services.AddHttpClient<IAssistantService, GeminiAssistantService>();


// ✅ Resolve circular dependency
builder.Services.AddScoped<Func<IVolunteersCallLogic>>(sp => () => sp.GetRequiredService<IVolunteersCallLogic>());

// ✅ Add SignalR (optional)
// הוסף בתוך builder.Services.AddSignalR():
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true; // לdebug
});






builder.Services.AddSignalR();

// ✅ General services extension
builder.Services.AddServices(); // ודאי שהשיטה קיימת

// ✅ HttpContextAccessor
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// ✅ Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting(); // ✅ תיקון: חובה לפני UseEndpoints
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();


app.UseWebSockets();

var volunteerSockets = new ConcurrentDictionary<int, WebSocket>();

app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        var volunteerIdStr = context.Request.Query["volunteerId"];
        if (int.TryParse(volunteerIdStr, out int volunteerId))
        {
            volunteerSockets[volunteerId] = webSocket;
            var buffer = new byte[1024 * 4];
            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    volunteerSockets.TryRemove(volunteerId, out _);
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                }
            }
        }
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<NotificationHub>("/notificationHub");
});

app.Run();
