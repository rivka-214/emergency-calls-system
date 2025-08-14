using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Dto
{
    public class AssignRequestDto
    {
        public int CallId { get; set; }
        public double LocationX { get; set; }
        public double LocationY { get; set; }
    }
}
