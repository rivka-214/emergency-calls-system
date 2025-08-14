using Microsoft.AspNetCore.Mvc;

namespace MyProject1.Controllers
{
  
        [ApiController]
        [Route("api/[controller]")]
        public class ImagesController : ControllerBase
        {
            [HttpGet("{fileName}")]
            public IActionResult GetImage(string fileName)
            {
                var imagePath = Path.Combine(Environment.CurrentDirectory, "Images", fileName);

                if (!System.IO.File.Exists(imagePath))
                    return NotFound();

                var imageBytes = System.IO.File.ReadAllBytes(imagePath);

                // זיהוי סוג הקובץ לפי סיומת
                var extension = Path.GetExtension(fileName).ToLower();
                var contentType = extension switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".bmp" => "image/bmp",
                    _ => "application/octet-stream"
                };

                return File(imageBytes, contentType);
            }
        }
    
}

