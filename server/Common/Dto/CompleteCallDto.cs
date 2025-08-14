using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Dto
{
    public class CompleteCallDto
    {
        public string Summary { get; set; } = string.Empty;
        public bool SentToHospital { get; set; }
        public string? HospitalName { get; set; }
    }

}
