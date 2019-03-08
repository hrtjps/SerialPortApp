using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RJCP.IO.Ports;

namespace SerialPortWebApp.Controllers
{
    [Route("api/[controller]")]
    public class SampleDataController : Controller
    {
        public SampleDataController()
        {
            /*
            if (Port == null)
            {
                Port = new SerialPortStream();
                Port.DataReceived += new EventHandler<SerialDataReceivedEventArgs>(this.serialPort_DataReceived);
            }
            */
        }

        
        [HttpGet("[action]")]
        public IEnumerable<SerialPortInfo> SerialPortList()
        {
            PortDescription[] ports = SerialPortStream.GetPortDescriptions();
            
            return Enumerable.Range(0, ports.Length).Select(index => new SerialPortInfo
            {
                StrComName = ports[index].Port,
                StrComProdId = ports[index].ToString(),
                StrComVendorId = "-",// ports[index].ToString(),
                StrSummary = ports[index].Description
            });
        }


        [HttpGet("[action]")]
        public IEnumerable<SerialStatus> GetSerialStatus()
        {
            string data = Global.RxData;
            Global.RxData = "";
            Console.WriteLine("read data/status.");
            return Enumerable.Repeat(new SerialStatus
            {
                Connected = Global.MyPort.IsOpen,
                StrError = "Receive Data",
                StrRxData = data,
                StrTxData = ""
            }, 1) ;
        }

        [HttpPost("[action]")]
        public IEnumerable<SerialStatus> SendData([FromBody]TxData data)
        {
            Console.WriteLine("Write data: \"{0}\"", data.Data);
            if (Global.MyPort != null && Global.MyPort.CanWrite)
                Global.MyPort.Write(data.Data);
            Global.RxData += Global.MyPort.ReadExisting();
            return Enumerable.Repeat(new SerialStatus
            {
                Connected = Global.MyPort.CanWrite,
                StrError = "Send Data",
                StrRxData = "",
                StrTxData = data.Data
            }, 1);
        }

        private void serialPort_DataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            Global.RxData += Global.MyPort.ReadExisting();
        }

        [HttpPost("[action]")]
        public IEnumerable<SerialStatus> OpenSerialPort([FromBody]SerialPortName data)
        {
            Console.WriteLine("Open {0} port!", data.PortName);
            
            //if (Port != null) Port = null;

            //Port = new SerialPortStream();
            if (Global.MyPort.IsOpen)
                Global.MyPort.Close();

            Global.MyPort.DataReceived += new EventHandler<SerialDataReceivedEventArgs>(serialPort_DataReceived);
            Global.RxData = "";
            Global.MyPort.PortName = data.PortName;
            Global.MyPort.BaudRate = data.BaudRate;

            Global.MyPort.Open();
            
            return Enumerable.Repeat(new SerialStatus
            {
                Connected = Global.MyPort.IsOpen && Global.MyPort.CanRead && Global.MyPort.CanWrite,
                StrError = data.PortName + "/ " + (Global.MyPort.CanWrite?"Can Write":"Not Write") +" / " + (Global.MyPort.CanRead ? "Can Read" : "Not Read"),
                StrRxData = "",
                StrTxData = ""
            }, 1);
        }

        [HttpPost("[action]")]
        public IEnumerable<SerialStatus> CloseSerialPort([FromBody]SerialPortName data)
        {
            Console.WriteLine("Close {0}.", data.PortName);
            if (Global.MyPort != null)
            {
                Global.MyPort.Close();
            }
            return Enumerable.Repeat(new SerialStatus
            {
                Connected = !Global.MyPort.IsOpen,
                StrError = "Closed " + data.PortName,
                StrRxData = "",
                StrTxData = ""
            }, 1);
        }

        public class TxData
        {
            public string Data { get; set; }
        }

        public class SerialStatus
        {
            public bool Connected { get; set; }
            public string StrError { get; set; }
            public string StrRxData { get; set; }
            public string StrTxData { get; set; }
        }

        public class SerialPortName
        {
            public string PortName { get; set; }
            public int BaudRate { get; set; }
        }
        public class SerialPortInfo
        {
            public string StrComName { get; set; }
            public string StrComProdId { get; set; }
            public string StrComVendorId { get; set; }
            public string StrSummary { get; set; }
        }
    }
}
