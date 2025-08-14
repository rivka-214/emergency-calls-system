using Service.Interfaces;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

public class GeminiAssistantService : IAssistantService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GeminiAssistantService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> GetFirstAidInstructionsAsync(string userInput)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = $" אזרח במצוקה וכבר הזמין אנשי הצלה ומתנדבים לעזרה אתה מדריך עזרה ראשונה. ענה בצורה ברורה, קצרה ומעשית לפי תיאור הבעיה הוראות מה לעשות עד שהמתנדבים יגיעו אל תשתמש במושגים מקצועיים אבל תן הוראות ברמה גבוהה  שאזרח פשוט  יבין כמה שיותר דברים שיוכל לעשות עד שהמתנדבים  יגיעו תסיים תמיד כך: המתן למתנדבים שבדרך  אם הוא לא הביא תאור שקשור לעזרה ראשונה תכתוב לו נקלט תאור לא קשור לעזרה ראשונה .התאור של הבעיה הוא: {userInput}" }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content);
        var responseJson = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return $"שגיאה מהשרת: {response.StatusCode} - {responseJson}";
        }

        using var doc = JsonDocument.Parse(responseJson);
        var reply = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return reply;
    }
}
