import { Component, OnInit, HostListener, ElementRef,ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import { ToastrService } from "ngx-toastr";
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import frLocale from '@fullcalendar/core/locales/fr'; 
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Title } from '@angular/platform-browser';
import { AuthService } from "src/app/shared/services/auth.service";
import { keycloakUser } from "src/app/shared/model/models.model";
import { BehaviorSubject } from 'rxjs';



declare var google: any;
declare var gapi: any;


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})


export class CalendarComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions: CalendarOptions;
  selectedEvent: any = null; 
  showPopup: boolean = false;  
  isLoading: boolean = true;
  isUpdating: boolean = false;
  isDeleteTask: boolean = false;
  showCompletedTasks: boolean = false;



  isConnectedToGoogleCalendar: boolean = false;
  isLoadingAccToken:boolean = false;
  dataFetchedAccToken : any = null; 




  CLIENT_ID = '267508651605-2vqqep29h97uef9tt7ahis82dskjsm1r.apps.googleusercontent.com';
  API_KEY = 'AIzaSyBhI34z9rSK7S-rfmngJ1nmb48zfb5nUz8';
  DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  SCOPES = 'https://www.googleapis.com/auth/calendar';




  ClientIdOfCloack: any = null;
  EmailKeyCloack: any = null;
  ClientIdOfGoogle: any = null;
  AccessTokenGoogle: any = null;


  tokenClient: any;
  gapiInited = false;
  gisInited = false;
  events: string = '';

  filters: { persons: string[]; tasks: string[] } = { persons: [], tasks: [] };

  allPersons: { id: string; nom: string; prenom: string }[] = [];   
  allTasks: { id: string; nom: string }[] = [];     
  originalEvents: any[] = [];
  user: any = null;
  userCurrent: keycloakUser = null;

  isNullValue: boolean = true;

  
  private isNullValueSubject = new BehaviorSubject<boolean>(this.isNullValue);


  constructor(private title: Title,private eRef: ElementRef, private toastr: ToastrService, private http: HttpClient, private authService: AuthService) {
    this.title.setTitle("Planigramme | ACM");
    

    this.authService.GetCurrentUser().then((userXX: any) => {
      this.userCurrent = userXX; 
      this.updateIsNullValue(false);
    });
















    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: frLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      editable: false, // turn it to true to use drag and drop
      selectable: true,
      eventClick: this.handleEventClick.bind(this),
      eventDidMount: (info) => {
        console.log("Event mounted: ", info.event); // Check if event is being triggered
        info.el.style.cursor = 'pointer';
        
        const tooltipContent = `
          <strong>${info.event.title}</strong><br>
          Client: ${info.event.extendedProps.ClientNom} ${info.event.extendedProps.ClientPrenom}<br>
          Mission: ${info.event.extendedProps.MissionDesignation}<br>
          Tâche: ${info.event.extendedProps.TacheIntitule}
        `;
      
        // Add the appTooltip attribute with dynamic content
        info.el.setAttribute('appTooltip', tooltipContent);
      },
      
      events: () => this.getFilteredEvents(),
    };
    


  }

    
  
    ngOnInit(): void {
        this.fetchTasks();
        this.loadGoogleApis();
        this.isNullValueSubject.subscribe((value) => {
            this.isNullValue = value;
            this.fetchAccessToken();
        });
    }

    
    updateIsNullValue(newValue: boolean) {
        this.isNullValueSubject.next(newValue);
    }



  loadGoogleApis(): void {
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => this.gapiLoaded();
    document.body.appendChild(gapiScript);
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = () => this.gisLoaded();
    document.body.appendChild(gisScript);
  }



  gapiLoaded(): void {
    gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: '',  
        discoveryDocs: [this.DISCOVERY_DOC],
      });
  
      if (this.AccessTokenGoogle) {
        gapi.client.setToken({
          access_token: this.AccessTokenGoogle, 
        });
      }
  
      this.gapiInited = true;
      this.maybeEnableButtons();
    });
  }
  



  gisLoaded(): void {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
      callback: (resp: any) => {
        this.AccessTokenGoogle = resp.access_token;
        this.handleAuthResponse(resp)
      },
    });
    this.gisInited = true;
    this.maybeEnableButtons();
  }

  maybeEnableButtons(): void {
    if (this.gapiInited && this.gisInited) {
      document.getElementById('authorize_button')!.style.visibility = 'visible';
    }
  }



  async addEventToGoogleCalendar(event: any) {
    try {
      // Get the Google access token from localStorage or another source
      const accessToken = localStorage.getItem('google_token');
      
      if (!accessToken) {
        console.error('No Google access token found');
        alert('Please authenticate with Google Calendar.');
        return;
      }
  
      gapi.auth.setToken({
        access_token: accessToken,
      });
  
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.title, 
          start: { dateTime: event.start },
          end: { dateTime: event.end },
        },
      });
  
      alert('Événement ajouté');
    } catch (error) {
      console.error('Erreur lors de l’ajout de l’événement :', error);
      alert('Erreur lors de l’ajout de l’événement');
    }
  }
  
  






  async getGoogleCalendarEvents() {
    try {

          const accessToken = localStorage.getItem('google_token');
          
          if (!accessToken) {
            console.error('No Google access token found');
            alert('Please authenticate with Google Calendar.');
            return;
          }
      
          gapi.auth.setToken({
            access_token: accessToken,
          });
      
        

        const response = await gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),  
            showDeleted: false,  
            singleEvents: true,  
            orderBy: 'startTime', 
        });



        const events = response.result.items || [];
 



        const filteredEvents = events.filter(event => 
            event.extendedProperties?.private?.appEventId
        );

        console.warn(filteredEvents);

        return filteredEvents;
        
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des événements :", error);
        alert("Erreur lors de la récupération des événements.");
    }
}


async findGoogleEventIdByAppEventId(appEventId) {
  try {
      const events = await this.getGoogleCalendarEvents();


      if (!events || events.length === 0) {
          console.warn("⚠️ No events found.");
          return null;
      }

       


      let EventToReturn = null;


      for(let i = 0;i<events.length;i++){
        
        console.warn(events[i].extendedProperties.private.appEventId);

        if(events[i].extendedProperties.private.appEventId.toString() === appEventId.toString()){
          console.log("Him...");
          EventToReturn = events[i].id;
        }
        else{
          console.log("Not him...");
        }
      }
      
      return EventToReturn ? EventToReturn : null;
  } catch (error) {
      console.error("❌ Error finding event by appEventId:", error);
      return null;
  }
}











async deleteEventOnGoogleCalendar() {
  try {
    this.isDeleteTask = true;
    

    if(this.isConnectedToGoogleCalendar){
        const accessToken = localStorage.getItem('google_token');

        if (!accessToken) {
          console.error('❌ No Google access token found.');
          this.toastr.error("Vous n'êtes pas connecté à Google Calendar pour exécuter cette opération.");
          return;
        }

        gapi.client.setToken({ access_token: accessToken });

        

        const eventId = await this.findGoogleEventIdByAppEventId(this.selectedEvent._def.extendedProps.EventId);

        
        console.log("TO delete => eventId : "+eventId);
    

        if (!eventId) {
          console.error("❌ Erreur: eventId est introuvable sur Google Calendar !");

          const EVENTIDTODELETEINDATABASE = this.selectedEvent._def.extendedProps.EventId; 
          const deleteURL = `${environment.url}/DeleteEventById/${EVENTIDTODELETEINDATABASE}`;
        
          this.http.delete(deleteURL).subscribe({
            next: (response) => {

              this.selectedEvent.setProp('visible', false);
              this.selectedEvent.remove();
              this.closePopup();
              this.isDeleteTask = false; 

            },
            error: (error) => {
              console.error('Erreur lors de la mise à jour:', error);
            },
            complete: () => {
              this.isDeleteTask = false; 
              this.fetchTasks();
              this.toastr.success('Evenement supprimé avec succès.');
            }
            
          });
          this.isDeleteTask = false; 
          return;
        }
    
        try {
          const event = await gapi.client.calendar.events.get({
            calendarId: 'primary',
            eventId: eventId,  
          });
     
    
          
              
                const EVENTIDTODELETEINDATABASE = this.selectedEvent._def.extendedProps.EventId; 
                const deleteURL = `${environment.url}/DeleteEventById/${EVENTIDTODELETEINDATABASE}`;
              
                this.http.delete(deleteURL).subscribe({
                  next: (response) => {
    
                    this.selectedEvent.setProp('visible', false);
                    this.selectedEvent.remove();
                    this.closePopup();
                    this.isDeleteTask = false; 
    
                  },
                  error: (error) => {
                    console.error('Erreur lors de la mise à jour:', error);
                  },
                  complete: () => {
                    this.isDeleteTask = false; 
                    this.fetchTasks();
                    this.toastr.success('Evenement supprimé avec succès.');
                  }
                  
                });
    
          
        } catch (checkError) {
          alert("L'événement n'existe pas sur Google Calendar.");
          return;
        } finally{
          this.isDeleteTask = false; 
        }
    
        await gapi.client.calendar.events.delete({
          calendarId: 'primary',
          eventId: eventId,
        });
    
    
       
    
      }
      else{
        
                const EVENTIDTODELETEINDATABASE = this.selectedEvent._def.extendedProps.EventId; 
                const deleteURL = `${environment.url}/DeleteEventById/${EVENTIDTODELETEINDATABASE}`;
                this.http.delete(deleteURL).subscribe({
                  next: (response) => {
    
                    this.selectedEvent.setProp('visible', false);
                    this.selectedEvent.remove();
                    this.closePopup();
                    this.isDeleteTask = false; 
    
                  },
                  error: (error) => {
                    console.error('Erreur lors de la mise à jour:', error);
                  },
                  complete: () => {
                    this.isDeleteTask = false; 
                    this.fetchTasks();
                    this.toastr.success('Evenement supprimé avec succès.');
                  }
                  
                });

      }

    
            
        


  } catch (error) {
    console.error("❌ Échec de la suppression :", error);
    this.toastr.error("Erreur lors de la suppression de l’événement sur Google Calendar.");
  }
}




   

  
  





  

  handleAuthClick(): void {
    if (!this.tokenClient) return;
  
    this.isLoading = true;
    this.tokenClient.requestAccessToken({
      prompt: 'consent',
      callback: (response: any) => {
        // Check if there's an error in the response
        if (response.error) {
          console.error('Google authentication error:', response.error);
          this.isLoading = false;
          return;
        }
        else{
          console.warn(response);
          this.isLoading = false;
        }
      }
    });

    this.ClientIdOfGoogle = this.tokenClient.s.client_id;
    this.isLoading = false;
  }
  
  



  handleSignoutClick(): void {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken(null);
      this.events = '';
    }
  }


  
  

  async handleAuthResponse(resp: any): Promise<void> {

    if (resp.error) {
      console.error(resp);
      this.isConnectedToGoogleCalendar = false;
      return;
    }


    this.AccessTokenGoogle = resp.access_token;
    localStorage.setItem('google_token', resp.access_token);
    const expiresIn = resp.expires_in;  
   
    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem('google_token_expiration', expirationTime.toString());
    this.isConnectedToGoogleCalendar = true;

    // console.warn("--------------------------------");
    // console.warn(this.userCurrent.id);
    // console.warn(this.userCurrent.email);
    // console.warn(this.ClientIdOfGoogle);
    // console.warn(this.AccessTokenGoogle);
    // console.warn("--------------------------------");

    const authButton = document.getElementById('authorize_button');
    
    if (authButton) {
      authButton.innerText = '';
      authButton.style.color = 'white';
      authButton.style.background = 'white';
      authButton.style.pointerEvents = 'none';
      authButton.style.cursor = 'default';
    }



    const requestBody = {
      ClientIdOfCloack : this.userCurrent.id, 
      EmailKeyCloack : this.userCurrent.email, 
      AccessTokenGoogle : this.AccessTokenGoogle, 
      ClientIdOfGoogle : this.ClientIdOfGoogle
    };
  
    console.warn("Body Of Request : ");
    console.warn(requestBody);
    this.http.post(`${environment.url}/CreateGoogleCalendarAccount`, requestBody)
      .subscribe({
        next: (res) => {
          this.toastr.success("Connexion à Google Calendar réussie.");
          window.location.reload();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating account:', err);
          this.toastr.error("Connexion à Google Calendar échoué.");
          this.isLoading = false;
        }
      });  
      this.isLoading = false;
  }



  


  




  checkTokenExpiration(): boolean {
    const expirationTime = localStorage.getItem('google_token_expiration');
    
    if (expirationTime) {
      const currentTime = Date.now();
      const expiryDate = parseInt(expirationTime);

      if (currentTime >= expiryDate) {
        console.log('Token expiré, veuillez ré-authentifier.');
        this.refreshToken();  
        this.isConnectedToGoogleCalendar = false;
        return false;
      }
    } else {
      console.log('Aucun token trouvé, veuillez vous connecter.');
      this.isConnectedToGoogleCalendar = false;
      return false;
    }
    return true;
  }



  refreshToken(): void {
    const refreshTokenX = localStorage.getItem('google_refresh_token');   
  
    if (!refreshTokenX) {
      this.handleLogout();
      this.toastr.error("Veuillez vous reconnecter, votre session a expiré.");
      return;
    }
  
    const url = 'https://oauth2.googleapis.com/token';
    const data = new URLSearchParams();
    data.append('client_id', this.ClientIdOfGoogle);  
    data.append('client_secret', this.AccessTokenGoogle);   
    data.append('refresh_token', refreshTokenX);  
    data.append('grant_type', 'refresh_token');  
  
    fetch(url, { method: 'POST', body: data })
      .then((response) => response.json())
      .then((data) => {
          
        if (data.access_token) {
          console.log('Token rafraîchi avec succès!');
  
          // Mettre à jour le token et la date d'expiration
          const newExpirationTime = Date.now() + (58 * 60 * 1000); // 1 heure de validité
          localStorage.setItem('google_token', data.access_token);
          localStorage.setItem('google_token_expiration', newExpirationTime.toString());
  
          alert(data.refresh_token.toString());
          if (data.refresh_token) {
            localStorage.setItem('google_refresh_token', data.refresh_token);
          }
          this.isConnectedToGoogleCalendar = true;

        } else {
          console.log('Impossible de rafraîchir le token:', data);
          this.handleLogout();
          this.toastr.error("Veuillez vous reconnecter à Google Calendar.");
          this.isConnectedToGoogleCalendar = false;
        }
      })
      .catch((error) => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        this.toastr.error("Une erreur est survenue au niveau de Google Calendar.");
        this.isConnectedToGoogleCalendar = false;
      });
  }
  




  
  


  fetchAccessToken(): void {
    if (!this.isNullValue) {
      this.isLoadingAccToken = true;
      const tokenInUppercase = this.userCurrent.id.toUpperCase();
  
      this.http.get(`${environment.url}/GetAccessTokenGoogleCalendar?ClientIdOfCloack=${tokenInUppercase}`).subscribe({
        next: (response: any) => {
          // Si le token est bien récupéré
          if (response && response[0]) {
            console.warn('Fetched Access Token:', response[0]);
  
            localStorage.setItem('google_token', response[0].AccessTokenGoogle);
            const expirationTime = Date.now() + (58 * 60 * 1000);  
            localStorage.setItem('google_token_expiration', expirationTime.toString());
            this.isConnectedToGoogleCalendar = this.checkTokenExpiration();
            this.isLoadingAccToken = false;
          } else {
            console.error('Erreur lors de la récupération du token');
            this.isLoadingAccToken = false;
          }
        },
        error: (error) => {
          console.error('Erreur fetching access token:', error);
          this.isLoadingAccToken = false;
          this.toastr.error("Une erreur est survenue au niveau de Google Calendar.");
        },
        complete: () => {
          console.log('Token fetch complete');
        }
      });
    } else {
      console.warn("Utilisateur non authentifié, récupération du token impossible");
    }
  }







 
 
  handleLogout(): void {
    this.isLoadingAccToken = true
    localStorage.removeItem('google_token');
    localStorage.removeItem('google_token_expiration');
    localStorage.removeItem('google_refresh_token');
  
    this.isConnectedToGoogleCalendar = false;
    this.removeTokenFromDatabase();
    this.isLoadingAccToken = false;
    this.toastr.success("Google Calendar n'est plus connecté à votre compte.");
  }
  
  




  removeTokenFromDatabase(): void {

    let XXX = this.userCurrent.id.toUpperCase();

    const body = {
      ClientIdOfCloack: XXX, 
    };

  
    this.http.post(`${environment.url}/DeleteGoogleToken`, body).subscribe({
      next: (response) => {
        console.log('Token supprimé avec succès de la base de données', response);
        window.location.reload();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du token', error);
        alert('Une erreur est survenue lors de votre déconnexion.')
      }
    });
  }
  








  fetchTasks(): void {
    this.isLoading = true;
  
    this.http.get(`${environment.url}/GetClientTachesAllOfThem`).subscribe({
      next: (response: any) => {
        console.log('Fetched tasks:', response);
  
        this.originalEvents = response.map((task: any) => ({
          title: ' ' +
            (task.EventDescription === 'Event 1' ? "1/" :
            task.EventDescription === 'Event 2' ? '2/' :
            task.EventDescription === 'Event 3' ? '3/' :
            task.EventDescription === 'Event 4' ? '4/' :
            task.EventDescription === 'Event 5' ? '5/' :
            task.EventDescription === 'Event 6' ? '6/' : '-/') +
            task.NumberEvent + ' : ' + task.TacheClientIntitule,
          start: this.formatDate(task.EventStart),
          end: this.formatDate(task.EventEnd),
          backgroundColor: task.EventColor || '#7366fe',
          extendedProps: {
            Commentaire: task.Commentaire,
            textColor: 'white',
            ClientTacheId: task.ClientTacheId,
            ClientMissionPrestationId: task.ClientMissionPrestationId,
            ClientMissionId: task.ClientMissionId,
            PrestationDesignation: task.PrestationDesignation,
            MissionDesignation: task.MissionDesignation,
            TacheIntitule: task.TacheIntitule,
            TacheId: task.TacheId,
            isDone: task.isDone,
            isReminder: task.isReminder,
            ClientEmail1: task.ClientEmail1,
            ClientEmail2: task.ClientEmail2,
            ClientTelephone1: task.ClientTelephone1,
            ClientAdresse: task.ClientAdresse,
            ClientPrenom: task.ClientPrenom,
            ClientNom: task.ClientNom,
            ClientId: task.ClientId,
            AgentNom: task.AgentNom,
            start_date: task.start_date,
            end_date: task.end_date,
            EventName: task.EventName,
            color: task.color,
            EventIsDone: task.EventIsDone,
            EventIsReminder: task.EventIsReminder,
            EventId: task.EventId
          }
        }));
  
        this.extractFilterOptions();
  
        this.filters.persons = this.allPersons.map(person => person.id);
        this.filters.tasks = this.allTasks.map(task => task.id);
  
        this.calendarOptions.events = this.getFilteredEvents();
  
        setTimeout(() => {
          this.calendarComponent.getApi().refetchEvents();
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
        setTimeout(() => {
          this.isLoading = false;
        }, 400);
      },
      complete: () => {
        console.log('Fetch tasks complete');
        setTimeout(() => {
          this.isLoading = false;
        }, 400);
      }
    });
  }

  

  



 
  extractFilterOptions(): void {
    const uniqueClients = new Set<string>(); // Store unique ClientIds
    const uniqueTasks = new Set<string>(); // Store unique TaskIds
    const personsList: { id: string; nom: string; prenom: string }[] = [];
    const tasksList: { id: string; nom: string }[] = [];
  
    this.originalEvents.forEach(event => {
      let { ClientId, ClientNom, ClientPrenom, TacheId, TacheIntitule } = event.extendedProps;
  
      // ✅ Extract first ClientId if it's an array
      if (Array.isArray(ClientId)) {
        ClientId = ClientId[0]; // Take the first value
      }
  
  
      // ✅ Ensure unique clients
      if (ClientId && ClientNom && ClientPrenom && !uniqueClients.has(ClientId)) {
        uniqueClients.add(ClientId);
        personsList.push({ id: ClientId, nom: ClientNom.trim(), prenom: ClientPrenom.trim() });
      }
  
      // ✅ Ensure unique tasks
      if (TacheId && TacheIntitule && !uniqueTasks.has(TacheId)) {
        uniqueTasks.add(TacheId);
        tasksList.push({ id: TacheId, nom: TacheIntitule.trim() });
      }
    });
  
    this.allPersons = personsList;
    this.allTasks = tasksList;
  
 

    console.log("🔵 Unique Clients Extracted: ", this.allPersons);
    console.log("🟢 Unique Tasks Extracted: ", this.allTasks);
  }
  




  


  

  


  getFilteredEvents(): any[] {
    if (this.filters.persons.length === 0 || this.filters.tasks.length === 0) {
      return [];
    }
  
    const filteredEvents = this.originalEvents.filter(event => {
      let clientId = event.extendedProps.ClientId;
  
      if (Array.isArray(clientId)) {
        clientId = clientId[0];
      }
  
      const isDone = event.extendedProps.isDone;
  
      // ✅ Apply the task filter
      if (!this.filters.tasks.includes(event.extendedProps.TacheId)) {
        return false; // Hide if task is not selected
      }
  
      // ✅ Apply the person filter
      if (!this.filters.persons.includes(clientId)) {
        return false; // Hide if person is not selected
      }
  
      // ✅ Apply the completion status filter
      if (!this.showCompletedTasks) {
        return !isDone; // Show only pending tasks
      }
  
      return isDone; // Show only completed tasks
    });
  
    // ✅ Refresh the calendar with the new filtered events
    this.refreshCalendar(filteredEvents);
  
    return filteredEvents;
  }

  

  refreshCalendar(filteredEvents: any[]): void {
  setTimeout(() => {
    this.calendarComponent.getApi().removeAllEvents(); // Clear current events
    this.calendarComponent.getApi().addEventSource(filteredEvents); // Add filtered events
    this.calendarComponent.getApi().refetchEvents();
  }, 100);
  this.isLoading = false;
}




  



  updateFilter(type: 'persons' | 'tasks', value: string, isChecked: boolean): void {
    if (isChecked) {
      this.filters[type].push(value); // Add to selected filters
    } else {
      this.filters[type] = this.filters[type].filter(item => item !== value); // Remove from selected filters
    }
  
    console.log("🟢 Updated Filters:", this.filters);
  
    // ✅ Reapply filtering immediately
    this.updateCalendarEvents();
  }
  
  
  
  updateCalendarEvents(): void {
    this.calendarOptions.events = this.getFilteredEvents();
  }

  



  markAsDone(): void {
    if (!this.selectedEvent) return;
  
    this.isUpdating = true;
    const taskId = this.selectedEvent.extendedProps.ClientTacheId;
    const updateUrl = `${environment.url}/MarkAsDone/${taskId}`;
  
    this.http.put(updateUrl, { isDone: true, color: "#28a745" }).subscribe({
      next: (response) => {
        console.log("✅ Tâche marquée comme faite:", response);
  
        // ✅ Update the task's status locally
        this.originalEvents.forEach(event => {
          if (event.extendedProps.ClientTacheId === taskId) {
            event.backgroundColor = "#28a745";
            event.extendedProps.isDone = true;
          }
        });
  
        // ✅ Reapply filtering instead of showing all tasks
        this.updateCalendarEvents();
  
        this.closePopup();
      },
      error: (error) => {
        console.error("❌ Erreur lors de la mise à jour:", error);
        alert("Erreur lors de la mise à jour. Cliquez sur OK pour rafraîchir.");
        location.reload();
      },
      complete: () => {
        this.isUpdating = false;
      }
    });
  }

  

  



  formatDate(dateString: string): string {
    if (!dateString) {
      return ''; // or some default value
    }
    return dateString.replace(' ', 'T').split('.')[0];  
  }
  


  
  handleEventClick(eventInfo: any): void {
    this.selectedEvent = eventInfo.event; 
    console.log(this.selectedEvent.extendedProps);
    this.showPopup = true; 
  }

  closePopup(): void {
    this.showPopup = false;
    setTimeout(()=>{
      this.selectedEvent = null;
    }, 500);
  }


  formatDateOnly(dateString: string | Date | undefined): string {
    if (!dateString) return '---'; // Gestion des valeurs nulles ou indéfinies

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }



  addTestEventToGoogleCalendar() {
    const event = {
      title: 'Nouvel Événement',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
    };
    this.addEventToGoogleCalendar(event);
  }

  
  

  getEventPrefix(description: string | undefined): string {
    const eventMap: { [key: string]: string } = {
      'First Event': '1/',
      'Second Event': '2/',
      'Third Event': '3/',
      'Fourth Event': '4/',
      'Fifth Event': '5/',
      'Sixth Event': '6/',
    };
    return eventMap[description || ''] || '--/';
  }
  

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.eRef.nativeElement.contains(event.target);
    if (!clickedInside && this.showPopup) {
      this.closePopup();
    }
  }

  preventClose(event: MouseEvent): void {
    event.stopPropagation();  
  }




  handleEventDrop(eventDropInfo: any): void {
    const updatedEvent = eventDropInfo.event;
    const taskId = updatedEvent.extendedProps.ClientTacheId;
  
    const updatedTask = {
      ClientTacheId: taskId,  
      start_date: updatedEvent.start.toISOString(),  
      end_date: updatedEvent.end ? updatedEvent.end.toISOString() : null,
    };
  
    console.log('Tâche déplacée:', updatedTask);
  
    this.http.put(`${environment.url}/UpdateClientTacheDates`, updatedTask).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie:', response);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        eventDropInfo.revert(); 
      }
    });
  }
  




  


 
  


  
}
