import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { SerialPort, SerialStatus } from './serial-port';
import { PlatformLocation } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const serialPort: SerialPort[] = [
  { strComName: 'COM1', strComVendorID: 'Prod 1', strComProdId: 'Vendor 1', strSummary: 'summary 1' },
  { strComName: 'COM2', strComVendorID: 'Prod 1', strComProdId: 'Vendor 1', strSummary: 'summary 2' },
  { strComName: 'COM3', strComVendorID: 'Prod 1', strComProdId: 'Vendor 1', strSummary: 'summary 3' },
];

@Injectable({
  providedIn: 'root'
})
export class SerialPortService {

  private baseUrl: string;

  constructor(
    private platformLocation: PlatformLocation,
    private httpClient: HttpClient
    ) {
      this.baseUrl = (this.platformLocation as any).location.origin;
  }

  getSerialPortList(): Observable<SerialPort[]> {
    return this.httpClient.get<SerialPort[]>(this.baseUrl + '/api/SampleData/SerialPortList')
      .pipe(catchError(this.errorHandler));
  }

  getSerialPortStatus(): Observable<SerialStatus[]> {
    return this.httpClient.get<SerialStatus[]>(this.baseUrl + '/api/SampleData/GetSerialStatus')
      .pipe(catchError(this.errorHandler));
  }

  sendData(sendData: string): Observable<SerialStatus[]> {
    const data = {data: sendData};
    return this.httpClient.post<SerialStatus[]>(this.baseUrl + '/api/SampleData/SendData', data)
      .pipe(catchError(this.errorHandler));
  }

  openSerialPort(name: string, baud: number): Observable<SerialStatus[]> {
    const data = {portName: name, baudRate: baud};
    return this.httpClient.post<SerialStatus[]>(this.baseUrl + '/api/SampleData/OpenSerialPort', data)
      .pipe(catchError(this.errorHandler));

  }

  closeSerialPort(name: string): Observable<SerialStatus[]> {
    const data = { portName: name };
    return this.httpClient.post<SerialStatus[]>(this.baseUrl + '/api/SampleData/CloseSerialPort', data)
      .pipe(catchError(this.errorHandler));
  }

  errorHandler(error: HttpErrorResponse) {
    return Observable.throw(error.message || 'Server Error');
  }
}
