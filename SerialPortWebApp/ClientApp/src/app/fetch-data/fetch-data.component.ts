import { Component, OnInit, Input } from '@angular/core';
import { SerialPortService } from '../services/serial-port.service';
import { SerialPort, SerialStatus } from '../services/serial-port';
import { Observable } from 'rxjs';

declare interface TableData {
  headerRow: string[];
  dataRows: SerialPort[];
}

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html',
  styleUrls: ['./fetch-data.component.scss']
})
export class FetchDataComponent implements OnInit {

  public errorMsg;

  public readDataTimer;
  public tableData: TableData;
  public selectedPortId: string;
  public port: string;
  public portOpts = { baudRate: 115200, autoOpen: false };

  public rxData: string;
  public txData: string;

  public selectedBaud: number;
  public bauds: number[] = [9600, 14400, 19200, 38400, 57600, 115200];
  // constructor() { }
  constructor(private serialportService: SerialPortService) { }

  ngOnInit() {
    this.tableData = {
      headerRow: ['COM name', 'Product ID', 'Vendor ID', 'Summary'],
      dataRows: [],
    };
    this.selectedBaud = 9600;
    this.scan();
  }

  scan() {
    this.selectedPortId = '';
    this.port = '';
    this.tableData.dataRows = []; // clear
    this.errorMsg = '';

    this.serialportService.getSerialPortList().subscribe((serialports) => {
      console.log(serialports);
      this.tableData.dataRows = serialports;
    }, error => this.errorMsg = 'Error!');
  }

  sendData() {
    console.log(this.txData);
    this.errorMsg = '';
    this.serialportService.sendData(this.txData).subscribe((status) => {
      console.log(status);
    }, error => {
      this.errorMsg = 'Error! Cannot send data.';
      this.port = '';
    });
    this.txData = '';
  }

  clearData() {
    this.rxData = '';
  }
  readData() {
    this.errorMsg = '';
    this.serialportService.getSerialPortStatus().subscribe((status) => {
      // console.log(status);
      status.map((item) => {
        if ( item.strError === 'Error' ) {
          this.closePort();
        } else {
          if ( item.strRxData) {
            this.rxData += item.strRxData;
          }
        }
      });
    }, error => this.errorMsg = 'Error! Cannot read data.');
  }

  getPort($event) {
    console.log('[LOG] Selected port ID: ', $event.target.textContent);
    this.selectedPortId = $event.target.textContent;
    this.tableData.dataRows = this.tableData.dataRows.filter(
      element => element.strComName === this.selectedPortId
    );
  }

  openPort() {
    this.port = this.selectedPortId;
    this.errorMsg = '';
    this.rxData = '';
    this.serialportService.openSerialPort(this.port, this.selectedBaud).subscribe((status) => {
      console.log(status);
      this.readDataTimer = setInterval(() => { this.readData(); }, 200);
    }, error => {
      this.errorMsg = 'Error! Cannot open Serial Port.';
      this.port = '';
    });
  }

  closePort() {
    console.log('[LOG] Port closed: ', this.selectedPortId);
    this.selectedPortId = null;
    this.port = null;
    this.scan();
    clearInterval(this.readDataTimer);

    this.port = this.selectedPortId;
    this.errorMsg = '';
    this.serialportService.closeSerialPort(this.port).subscribe((status) => {
      console.log(status);
    }, error => this.errorMsg = 'Error! Cannot close Serial Port.');
  }
}

