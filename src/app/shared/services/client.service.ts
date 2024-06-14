import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ClientService {
  constructor(private http: HttpClient) {}

  getClients(): Observable<any[]> {
    let url = `${environment.url}/GetClients?CabinetId=0E06E5A4-6246-415D-B119-C47077180755`;
    return this.http.get<any[]>(url);
  }

  CreateClient(clientData: any): Observable<any> {
    console.log("CreateClient.clientData: ", clientData);
    let url = `${environment.url}/CreateClient?`;
    clientData.CabinetId = "0E06E5A4-6246-415D-B119-C47077180755";
    return this.http.post<any>(url, clientData);
  }

  deleteClient(clientId: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.url}/DeleteClient/${clientId}`
    );
  }
}
