using System.Text.Json.Serialization;

namespace Common.Dto
{
    public class FirstAidGuide
    {
        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("tags")]
        public List<string> Tags { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }
    }
}
