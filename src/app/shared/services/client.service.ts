import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, of } from "rxjs";
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
  GetClientPiecess(clientId: string): Observable<any> {
    let url = `${environment.url}/GetClientPiecess?ClientId=${clientId}`;
    return this.http.get(url);
  }
  CreateClientPiece(formData: any) {
    let url = `${environment.url}/CreateClientPiece?`;
    return this.http.post(url, formData);
  }
  DeleteClientPiece(ClientPieceId: string) {
    let url = `${environment.url}/DeleteClientPiece/${ClientPieceId}`;
    return this.http.delete(url);
  }

  UpdateClientPiece(data: any): Observable<any> {
    console.log("UpdateClientPiece.data: ", data);
    let url = `${environment.url}/UpdateClientPiece?`;
    return this.http.put<any>(url, data);
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
  DeletePatrimoine(PatrimoineId: string, ClientId: string) {
    console.log("DeletePatrimoine: ", PatrimoineId, "  ", ClientId);
    let url = `${environment.url}/DeletePatrimoine?`;
    if (PatrimoineId != null) url += `PatrimoineId=${PatrimoineId}&`;
    if (ClientId != null) url += `ClientId=${ClientId}&`;
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

  CreateConjoint(data: any) {
    let url = `${environment.url}/CreateConjoint?`;
    return this.http.post(url, data);
  }
  GetConjoint(clientId: string): Observable<any> {
    let url = `${environment.url}/GetProche?ClientId=${clientId}`;
    return this.http.get(url);
  }
  UpdateConjoint(data: any): Observable<any> {
    console.log("UpdateConjoint.data: ", data);
    let url = `${environment.url}/UpdateConjoint?`;
    // data.CabinetId = "0E06E5A4-6246-415D-B119-C47077180755";
    return this.http.put<any>(url, data);
  }
  DeleteConjoint(ConjointId: string) {
    let url = `${environment.url}/DeleteConjoint/${ConjointId}`;
    return this.http.delete(url);
  }

  getServices(): Observable<any[]> {
    let url = `${environment.url}/GetServices?CabinetId=0e06e5a4-6246-415d-b119-c47077180755`;
    return this.http.get<any[]>(url);
  }

  getMissions(): Observable<any[]> {
    let url = `${environment.url}/GetMissions?ServiceId=66eb9acf-02e0-44e8-bfe3-5686873e8761`;
    return this.http.get<any[]>(url);
  }
  GetClientMissions(clientId: string): Observable<any> {
    let url = `${environment.url}/GetClientMissions?ClientId=${clientId}`;
    return this.http.get(url);
  }
  getMissionsWithPrestationsCount(): Observable<any[]> {
    let url = `${environment.url}/GetMissionsWithPrestationsCount`;
    return this.http.get<any[]>(url);
  }
  getPrestations(): Observable<any[]> {
    let url = `${environment.url}/GetPrestations?MissionId=a83dcad0-3a14-4523-a5c5-30e1baa232d0`;
    return this.http.get<any[]>(url);
  }
  getTaches(): Observable<any[]> {
    let url = `${environment.url}/GetTaches`;
    return this.http.get<any[]>(url);
  }

  CreateClientMission(data: any) {
    let url = `${environment.url}/CreateClientMission?`;
    return this.http.post(url, data);
  }
  GetClientMissionPrestationSimple(clientId: string): Observable<any> {
    let url = `${environment.url}/GetClientMissionPrestationSimple?ClientId=${clientId}`;
    return this.http.get(url);
  }
  DeleteClientMissionPrestation(ClientMissionPrestationId: string) {
    let url = `${environment.url}/DeleteClientMissionPrestation/${ClientMissionPrestationId}`;
    return this.http.delete(url);
  }

  GetClientTaches(clientId: string): Observable<any> {
    let url = `${environment.url}/GetClientTaches?ClientId=${clientId}`;
    return this.http.get(url);
  }
  GetClientTachesSimple(clientId: string): Observable<any> {
    let url = `${environment.url}/GetClientTachesSimple?ClientId=${clientId}`;
    return this.http.get(url);
  }
  GetAllClientTaches(): Observable<any> {
    let url = `${environment.url}/GetAllClientTaches?`;
    return this.http.get(url);
  }
  GetLettreMission(clientMissionId: string): Observable<Blob> {
    let url = `${environment.url}/GetLettreMission/${clientMissionId}`;
    return this.http.get(url, { responseType: "blob" });
  }
  CreateClientMissionPrestation(data: any): Observable<any> {
    let url = `${environment.url}/CreateClientMissionPrestation?`;
    return this.http.post(url, data);
  }
  CreateClientMissionPrestationCustom(data: any): Observable<any> {
    let url = `${environment.url}/CreateClientMissionPrestationCustom?`;
    return this.http.post(url, data);
  }
  CreateClientTache(data: any): Observable<any> {
    let url = `${environment.url}/CreateClientTache?`;
    return this.http.post(url, data);
  }
  CreateClientTacheCustom(data: any): Observable<any> {
    let url = `${environment.url}/CreateClientTacheCustom?`;
    return this.http.post(url, data);
  }
  UpdateClientTache(data: any): Observable<any> {
    console.log("UpdateClientTache.data: ", data);
    let url = `${environment.url}/UpdateClientTache?`;
    return this.http.put<any>(url, data);
  }
  DeleteClientTache(ClientTacheId: string) {
    let url = `${environment.url}/DeleteClientTache/${ClientTacheId}`;
    return this.http.delete(url);
  }
  SentEmail() {
    let url = `${environment.url}/email?`;
    return this.http.get(url, { responseType: "text" });
  }
  SentEmail2(to: string, subject: string, html: string) {
    const url = `${environment.url}/email2?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&html=${encodeURIComponent(html)}`;
    return this.http.get(url, { responseType: "text" });
  }

  UploadProfileImage(formData: FormData) {
    const url = `${environment.url}/UploadProfileImage`; // Remplacez par votre URL API
    return this.http.post(url, formData);
  }
  // DeleteProfileImage(clientId: string) {
  //   const url = `${environment.url}/deleteProfileImage/${clientId}`;
  //   return this.http.delete(url); // Envoie une requête DELETE avec seulement le ClientId
  // }
  checkImageExists(clientId: string, extension: string) {
    const url = `${environment.url}/Pieces/${clientId}/profile.${extension}`;
    return this.http.head(url).pipe(
      map(() => true), // Si la requête HEAD réussit, l'image existe
      catchError(() => of(false)) // Si erreur, l'image n'existe pas
    );
  }

  DeleteProfileImage(clientId: string, extension: string) {
    const url = `${environment.url}/deleteProfileImage/${clientId}/profile.${extension}`;
    return this.http.delete(url); // Supprime l'image avec l'extension spécifiée
  }
  UploadStatusDocument(formData: FormData) {
    const url = `${environment.url}/uploadStatusDocument`;
    return this.http.post(url, formData);
  }
  UploadClientPieceFile(formData: FormData) {
    let url = `${environment.url}/UploadClientPieceFile`;
    return this.http.post(url, formData);
  }
  getDownloadUrl(clientPieceId: string): string {
    return `${environment.url}/DownloadClientPiece/${clientPieceId}`;
  }

  GetUnassignedClientMissionPrestationSimple(ClientMissionId: string): Observable<any> {
    let url = `${environment.url}/GetUnassignedClientMissionPrestationSimple?ClientMissionId=${ClientMissionId}`;
    return this.http.get(url);
  }
  GetUnassignedClientTache(clientId: string, PrestationId: string): Observable<any> {
    let url = `${environment.url}/GetUnassignedClientTache?ClientId=${clientId}&PrestationId=${PrestationId}`;
    return this.http.get(url);
  }
}
