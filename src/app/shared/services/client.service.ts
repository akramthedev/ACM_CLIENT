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

  GetClient(clientId: string): Observable<any> {
    let url = `${environment.url}/GetClient?ClientId=${clientId}`;
    return this.http.get(url);
  }
  CreateClient(clientData: any): Observable<any> {
    console.log("CreateClient.clientData: ", clientData);
    let url = `${environment.url}/CreateClient?`;
    clientData.CabinetId = "0E06E5A4-6246-415D-B119-C47077180755";
    return this.http.post<any>(url, clientData);
  }
  UpdateClient(data: any): Observable<any> {
    console.log("UpdateClient.data: ", data);
    let url = `${environment.url}/UpdateClient?`;
    // data.CabinetId = "0E06E5A4-6246-415D-B119-C47077180755";
    return this.http.put<any>(url, data);
  }

  deleteClient(clientId: string): Observable<any> {
    return this.http.delete<any>(`${environment.url}/DeleteClient/${clientId}`);
  }

  CreateClientPiece(formData: any) {
    let url = `${environment.url}/CreateClientPiece?`;
    return this.http.post(url, formData);
  }
  DeleteClientPiece(ClientPieceId: string) {
    let url = `${environment.url}/DeleteClientPiece/${ClientPieceId}`;
    return this.http.delete(url);
  }

  CreatePatrimoine(data: any) {
    let url = `${environment.url}/CreatePatrimoine?`;
    return this.http.post(url, data);
  }
  GetPatrimoines(clientId: string): Observable<any> {
    let url = `${environment.url}/GetPatrimoines?ClientId=${clientId}`;
    return this.http.get(url);
  }
  UpdatePatrimoine(data: any): Observable<any> {
    console.log("UpdatePatrimoine.data: ", data);
    let url = `${environment.url}/UpdatePatrimoine?`;
    // data.CabinetId = "0E06E5A4-6246-415D-B119-C47077180755";
    return this.http.put<any>(url, data);
  }
  DeletePatrimoine(PatrimoineId: string) {
    let url = `${environment.url}/DeletePatrimoine/${PatrimoineId}`;
    return this.http.delete(url);
  }

  CreatePassif(data: any) {
    let url = `${environment.url}/CreatePassif?`;
    return this.http.post(url, data);
  }
  GetPassifs(clientId: string): Observable<any> {
    let url = `${environment.url}/GetPassifs?ClientId=${clientId}`;
    return this.http.get(url);
  }
  UpdatePassif(data: any): Observable<any> {
    console.log("UpdatePassif.data: ", data);
    let url = `${environment.url}/UpdatePassif?`;
    // data.CabinetId = "0E06E5A4-6246-415D-B119-C47077180755";
    return this.http.put<any>(url, data);
  }
  DeletePassif(PassifsId: string) {
    let url = `${environment.url}/DeletePassif/${PassifsId}`;
    return this.http.delete(url);
  }

  CreateBudget(data: any) {
    let url = `${environment.url}/CreateBudget?`;
    return this.http.post(url, data);
  }
  GetBudgets(clientId: string): Observable<any> {
    let url = `${environment.url}/GetBudgets?ClientId=${clientId}`;
    return this.http.get(url);
  }
  UpdateBudget(data: any): Observable<any> {
    console.log("UpdateBudget.data: ", data);
    let url = `${environment.url}/UpdateBudget?`;
    // data.CabinetId = "0E06E5A4-6246-415D-B119-C47077180755";
    return this.http.put<any>(url, data);
  }
  DeleteBudget(BudgetsId: string) {
    let url = `${environment.url}/DeleteBudget/${BudgetsId}`;
    return this.http.delete(url);
  }

  CreateProche(data: any) {
    let url = `${environment.url}/CreateProche?`;
    return this.http.post(url, data);
  }
  GetProches(clientId: string): Observable<any> {
    let url = `${environment.url}/GetProches?ClientId=${clientId}`;
    return this.http.get(url);
  }
  UpdateProche(data: any): Observable<any> {
    console.log("UpdateProche.data: ", data);
    let url = `${environment.url}/UpdateProche?`;
    // data.CabinetId = "0E06E5A4-6246-415D-B119-C47077180755";
    return this.http.put<any>(url, data);
  }
  DeleteProche(ProchesId: string) {
    let url = `${environment.url}/DeleteProche/${ProchesId}`;
    return this.http.delete(url);
  }
}
