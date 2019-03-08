using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RJCP.IO.Ports;

namespace SerialPortWebApp
{
    public static class Global
    {
        public static string RxData = "";
        public static SerialPortStream MyPort = new SerialPortStream();
    }
}
