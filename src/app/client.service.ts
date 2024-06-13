import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = 'http://localhost:3000'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }
  

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetClients`);
  }

  addClient(clientData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/clients/add`, clientData);
  }

  deleteClient(clientId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/clients/delete/${clientId}`);
  }
}
