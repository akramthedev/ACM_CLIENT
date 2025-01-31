import { Injectable } from '@angular/core';

declare const google: any; // Déclaration pour éviter l'erreur TypeScript



@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  
  public CLIENT_ID = '267508651605-2vqqep29h97uef9tt7ahis82dskjsm1r.apps.googleusercontent.com';
  public currentUser: any = null; // Stocke l'utilisateur actuel

  constructor() {
    this.loadGisScript();
  }

  public loadGisScript(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      this.initGoogleAuth();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (typeof google !== 'undefined' && google.accounts) {
          this.initGoogleAuth();
        } else {
          console.error('Le script Google Identity Services ne s’est pas chargé correctement.');
        }
      };
      document.body.appendChild(script);
    }
  }

  public initGoogleAuth(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: this.CLIENT_ID,
        callback: this.handleCredentialResponse.bind(this)
      });

      google.accounts.id.prompt(); // Active One Tap
    } else {
      console.error('Google API non chargée !');
    }
  }

  public handleCredentialResponse(response: any): void {
    const credential = response.credential;
    const jwtPayload = this.decodeJwt(credential);
    this.currentUser = jwtPayload; // Stocker l'utilisateur
    console.log('Utilisateur connecté :', jwtPayload);
  }

  public decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error('Erreur de décodage du JWT', error);
      return null;
    }
  }

  // Méthode pour obtenir l'utilisateur
  getUser(): any {
    return this.currentUser;
  }
}
