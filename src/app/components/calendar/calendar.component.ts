import { HostListener, ElementRef,ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import frLocale from '@fullcalendar/core/locales/fr'; 
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../environments/environment";
import { BehaviorSubject } from 'rxjs';
import { AuthService } from "../../shared/services/auth.service";
import { keycloakUser } from "../../shared/model/models.model";
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


declare var google: any;
declare var gapi: any;


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})


export class CalendarComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

        isConnectedToGoogleCalendar: boolean = false;
        isLoadingAccToken: boolean = false;
        dataFetchedAccToken: any = null;
        CLIENT_ID = environment.CLIENT_ID;
        API_KEY = environment.API_KEY;
        CLIENT_SECRET = environment.CLIENT_SECRET;
        DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
        SCOPES = 'https://www.googleapis.com/auth/calendar';
        ClientIdOfGoogle: any = null;
        AccessTokenGoogle: any = null;
        ExpiresIn: any = null;
        isReplanifierClicked: boolean = false;
        isSauvegarding: boolean = false;
        tokenClient: any;
        gapiInited = false;
        gisInited = false;
        user: any = null;
        userCurrent: keycloakUser | null = null;
        isNullValue: boolean = true;
        isLoading: boolean = false;
        expirationGoogleToken: string = 'No';
        private isNullValueSubject = new BehaviorSubject<boolean>(this.isNullValue);
        private tokenCheckInterval: any = null;
        shouldReconnect: boolean = false;  
        isUpdating: boolean = false;
        isDeleteTask: boolean = false;
        showCompletedTasks: boolean = false;
        ClientIdOfCloack: any = null;
        EmailKeyCloack: any = null;







        unsynchronizedTasks: any = null;
        NumberOfUnsyncTasks: any = null;
        allEventsOfGoogleCalendar: any = null;
  calendarOptions: CalendarOptions;
  selectedEvent: any = null; 
  showPopup: boolean = false;  
  events: string = '';
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  selectedDate: Date | null = null;
  months: string[] = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  weekDays: string[] = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  calendarDays: { date: number, currentMonth: boolean, selected: boolean }[] = [];
  filters: { persons: string[]; tasks: string[] } = { persons: [], tasks: [] };
  allPersons: { id: string; nom: string; prenom: string }[] = [];   
  allTasks: { id: string; nom: string }[] = [];     
  originalEvents: any[] = [];

  

  constructor(private title: Title,private eRef: ElementRef, private toastr: ToastrService, private http: HttpClient, private authService: AuthService) {
    this.title.setTitle("Planigramme | ACM");
    

    this.authService.GetCurrentUser().then((userXX: any) => {
      this.userCurrent = userXX; 
      this.updateIsNullValue(false);
    });
   

    this.generateCalendar();

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
      this.loadGoogleApis();
      this.isNullValueSubject.subscribe((value) => {
        this.isNullValue = value;
        if (!this.isNullValue) {
          this.fetchAccessToken();
        }
      });
      this.fetchTasks();
    }
    


    generateCalendar() {
      // Use currentMonth and currentYear to generate the calendar
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
      const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
      const numberOfDaysInMonth = lastDayOfMonth.getDate();
    
      // Empty the current calendar before regenerating it
      this.calendarDays = [];
    
      // Generate days for the selected month (from currentMonth and currentYear)
      for (let i = 1; i <= numberOfDaysInMonth; i++) {
        const dayObj = {
          date: i,
          currentMonth: true,
          selected: false
        };
        this.calendarDays.push(dayObj);
      }
    
      // After generating the calendar, reapply the selected date if necessary
      this.reapplySelectedDate();
    }



 
    
    selectDate(day: any) {
      if (!day.currentMonth) return;
    
      this.calendarDays.forEach(d => d.selected = false);  // Reset selected date
      day.selected = true;
      
      // Update selectedDate based on the selected day
      this.selectedDate = new Date(this.currentYear, this.currentMonth, day.date);
    
      // Update the calendar with the selected date
      this.generateCalendar();
    }
    
   
 

    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this.generateCalendar();
      this.reapplySelectedDate();
    }
    
    previousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.generateCalendar();
      this.reapplySelectedDate();
    }



    
    reapplySelectedDate() {
      if (this.selectedDate) {
        
         this.setDefaultDate(this.selectedDate);
      }
    }
    


    ReplanifierClicked(): void {
      this.isReplanifierClicked = true;
    
      let selectedEndDate = this.selectedEvent.extendedProps.EventStart;
      let defaultDate = new Date(selectedEndDate); // Convert ISO string to Date
    
      // Set the current month and year based on the selected event's date
      this.currentMonth = defaultDate.getMonth();
      this.currentYear = defaultDate.getFullYear();
    
      // Set the selected date for the calendar
      this.selectedDate = defaultDate;
    
      // Generate the calendar for the selected event's month
      this.generateCalendar();
    }
    


   setDefaultDate(date: Date) {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
 
    this.calendarDays.forEach(dayObj => {
      if (dayObj.date === day && dayObj.currentMonth && month === this.currentMonth && year === this.currentYear) {
        dayObj.selected = true;
      } else {
        dayObj.selected = false;  // Optional: Reset other days
      }
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

  async gapiLoaded() {
    try {
      await gapi.load('client', async () => {
        await gapi.client.init({
          apiKey: environment.API_KEY,
          discoveryDocs: [this.DISCOVERY_DOC],
        });
  
        if (this.AccessTokenGoogle) {
          gapi.client.setToken({
            access_token: this.AccessTokenGoogle,
          });
        }
  
        this.gapiInited = true;
        console.warn("gapi client initialized");
  
        await this.getAllGoogleCalendarEvents();
      });
    } catch (error) {
      console.error("❌ Error initializing gapi client:", error);
    }
  }


    gisLoaded(): void {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
        prompt: 'consent',
        access_type: 'offline',
        callback: (resp: any) => {
          this.AccessTokenGoogle = resp.access_token;
          this.ExpiresIn = resp.expires_in;
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



    

    formatExpirationDate(timestamp: number): string {
      // Debugging: Log the timestamp and validate it
      console.log('Timestamp:', timestamp);
    
      // Check if the timestamp is valid
      if (!timestamp || isNaN(timestamp)) {
        console.error('Invalid timestamp:', timestamp);
        return 'Invalid Date';
      }
    
      // Create a Date object from the timestamp
      const date = new Date(timestamp);
    
      // Debugging: Log the Date object to ensure it's valid
      console.log('Date Object:', date);
    
      // Check if the Date object is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid Date object:', date);
        return 'Invalid Date';
      }
    
      // Extract date and time components
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
    
      // Format the date and time
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    }





    async handleAuthResponse(resp: any): Promise<void> {
      if (resp.error) {
        console.error(resp);
        this.isConnectedToGoogleCalendar = false;
        return;
      }
    
      // Store the access token
      this.AccessTokenGoogle = resp.access_token;
  
  
      console.warn(resp);
     
  
      if (resp.refresh_token) {
        localStorage.setItem('google_refresh_token', resp.refresh_token);
      }
  
      
    
      // Calculate the expiration time
      const expiresInSeconds = resp.expires_in;  
      const expirationTime = Date.now() + expiresInSeconds * 1000;  
      // minus 10 minutes because it can be sometimes a delay or the loop not working or others unknown bugs 
      const adjustedExpirationTime = expirationTime - (5 * 60 * 1000);  // for test put : - 
    
      // Store the token and expiration time in localStorage
      localStorage.setItem('google_token', this.AccessTokenGoogle);
      localStorage.setItem('google_token_expiration', adjustedExpirationTime.toString());
    
      // Update the UI state
      this.isConnectedToGoogleCalendar = true;
    
      this.startTokenCheckLoop();
  
      // Prepare the request body for your backend
      const requestBody = {
        ClientIdOfCloack: this.userCurrent?.id,
        EmailKeyCloack: this.userCurrent?.email,
        AccessTokenGoogle: this.AccessTokenGoogle,
        ClientIdOfGoogle: this.ClientIdOfGoogle,
        ExpiresIn: adjustedExpirationTime.toString(), // Send the correct expiration time to the backend
      };
    
      // Send the request to your backend
      this.http.post(`${environment.url}/CreateGoogleCalendarAccount`, requestBody).subscribe({
        next: () => {
          this.toastr.success("Connexion à Google Calendar réussie.");
        },
        error: (err) => {
          console.error('Error creating account:', err);
          this.toastr.error("Connexion à Google Calendar échoué.");
        },
      });
    }


 

    handleLogout(): void {
      this.isLoadingAccToken = true;
      localStorage.removeItem('google_token');
      localStorage.removeItem('google_refresh_token');
      localStorage.removeItem('google_token_expiration');
      this.isConnectedToGoogleCalendar = false;
      this.stopTokenCheckLoop(); // Stop the loop
      this.removeTokenFromDatabase();
      this.isLoadingAccToken = false;
      this.toastr.success("Google Calendar n'est plus connecté à votre compte.");
    }



    SynchroniserLesTachesNonSynchronise(): void {
      if (!this.unsynchronizedTasks || this.unsynchronizedTasks.length === 0) {
        alert('Aucune tâche à synchroniser.');
        return;
      }
    
      this.isLoading = true;  
    
      let syncCount = 0;
    
      this.unsynchronizedTasks.forEach(async (task, index) => {
        try {
          await this.addEventToGoogleCalendar(task);
          syncCount++;
    
          if (syncCount === this.unsynchronizedTasks.length) {
            alert(`${syncCount} tâches synchronisées avec succès !`);
            this.fetchTasks();  
          }
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de la tâche ${task.title}:`, error);
        }
      });
    
      this.isLoading = false;  
    }
    



    removeTokenFromDatabase(): void {
      let XXX = this.userCurrent?.id.toUpperCase();
  
      const body = {
        ClientIdOfCloack: XXX, 
      };
  
      this.http.post(`${environment.url}/DeleteGoogleToken`, body).subscribe({
        next: (response) => {
          console.log('Token supprimé avec succès de la base de données', response);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du token', error);
        }
      });
    }
  
  
  

    closeShouldReconnect():void{
      this.shouldReconnect = false;
    }
  


    checkTokenExpiration(expirationTime: number): boolean {
      const currentTime = Date.now();
      if (currentTime >= expirationTime) {
        console.log('Token expiré, veuillez ré-authentifier.');
        this.refreshToken();
        this.isConnectedToGoogleCalendar = false;
        return false;
      }
      return true;
    }
  

    startTokenCheckLoop(): void {
      // Clear any existing interval
      if (this.tokenCheckInterval) {
        console.log('Clearing existing token check interval...');
        clearInterval(this.tokenCheckInterval);
      }
    
      console.log('Starting new token check loop...');
    
      // Start a new interval
      this.tokenCheckInterval = setInterval(() => {
        console.log('Loop running...');
    
        if (this.isConnectedToGoogleCalendar) {
          console.log('User is connected to Google Calendar. Checking token expiration...');
    
          const expirationTime = Number(localStorage.getItem('google_token_expiration'));
          console.log('Expiration Time from localStorage:', expirationTime);
    
          if (isNaN(expirationTime)) {
            console.error('Invalid expiration time in localStorage. Stopping loop.');
            this.stopTokenCheckLoop();
            return;
          }
    
          const isTokenValid = this.checkTokenExpirationForLoopingSystem(expirationTime);
          console.log('Is token valid?', isTokenValid);
    
          if (!isTokenValid) {
            console.log('Token is expired. Stopping loop...');
            // Stop the loop if the token is expired
            this.stopTokenCheckLoop();
          }
        } else {
          console.log('User is no longer connected to Google Calendar. Stopping loop...');
          // Stop the loop if the user is no longer connected
          this.stopTokenCheckLoop();
        }
      }, 3000); // Check every 10 seconds
    }
    
    stopTokenCheckLoop(): void {
      if (this.tokenCheckInterval) {
        console.log('Stopping token check loop...');
        clearInterval(this.tokenCheckInterval);
        this.tokenCheckInterval = null;
      } else {
        console.log('No token check loop to stop.');
      }
    }
  


    checkTokenExpirationForLoopingSystem(expirationTime: number): boolean {
      const currentTime = Date.now();
      if (currentTime >= expirationTime) {
        console.log('Token expiré, veuillez ré-authentifier.');
        this.refreshToken();
        this.isConnectedToGoogleCalendar = false;
        return false;
      } else {
        return true;
      }
    }
  




    
    refreshToken(): void {

      const REFRESH__TOKEN = localStorage.getItem('google_refresh_token');
  
      if (!REFRESH__TOKEN) {
        this.shouldReconnect = true;
        return;
      }
    
      const url = 'https://oauth2.googleapis.com/token';
      const data = new URLSearchParams();
      data.append('client_id', this.CLIENT_ID); 
      data.append('client_secret', this.CLIENT_SECRET);
      data.append('grant_type', 'refresh_token');
      data.append('refresh_token', REFRESH__TOKEN);
    
      fetch(url, { method: 'POST', body: data })
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
     
            this.toastr.success("Votre session Google Calendar a été rafraîchi avec succès!");
  
            const expiresInSeconds = data.expires_in;  
            const newExpirationTime = Date.now() + expiresInSeconds * 1000; 
            const adjustedExpirationTime = newExpirationTime - (5 * 60 * 1000);
            localStorage.setItem('google_token', data.access_token);
            localStorage.setItem('google_token_expiration', adjustedExpirationTime.toString());
  
            const requestBody = {
              ClientIdOfCloack: this.userCurrent?.id,
              EmailKeyCloack: this.userCurrent?.email,
              AccessTokenGoogle: this.AccessTokenGoogle,
              ClientIdOfGoogle: this.ClientIdOfGoogle,
              ExpiresIn: adjustedExpirationTime.toString()   
            };
          
            this.http.post(`${environment.url}/CreateGoogleCalendarAccount`, requestBody).subscribe({
              next: () => {
                 alert("Updated The Token In Backend")
              },
              error: (err) => {
                console.error('Error creating account:', err);
                alert("Error Updating The Token In Backend")                 
              },
            });

  
            this.isConnectedToGoogleCalendar = true;
            this.startTokenCheckLoop();
          } else {
            console.error('Impossible de rafraîchir le token:', data);
            //this.handleLogout();
            this.shouldReconnect = true;
          }
        })
        .catch((error) => {
          console.error('Erreur lors du rafraîchissement du token:', error);
          this.toastr.error("Une erreur est survenue au niveau de Google Calendar.");
          //this.handleLogout();
          this.shouldReconnect = true;
        });
    }




 
    handleAuthClick(): void {
      if (!this.tokenClient) return;
  
      this.isLoading = true;
      this.tokenClient.requestAccessToken({
        prompt: 'consent',
        callback: (response: any) => {
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
  
    
    fetchAccessToken(): void {
      if (!this.isNullValue && this.userCurrent?.id) {
        this.isLoadingAccToken = true;
        const tokenInUppercase = this.userCurrent.id.toUpperCase();
    
        this.http.get(`${environment.url}/GetAccessTokenGoogleCalendar?ClientIdOfCloack=${tokenInUppercase}`).subscribe({
          next: (response: any) => {
            if (response && response[0]) {
              console.warn('Fetched Access Token:', response[0]);
    
              // Store the token in localStorage
              localStorage.setItem('google_token', response[0].AccessTokenGoogle);
    
              // Retrieve the expiration time (already a timestamp in milliseconds)
              const expirationTime = Number(response[0].ExpiresIn);
    
              // Store the expiration time in localStorage
              localStorage.setItem('google_token_expiration', expirationTime.toString());
    
              // Format the expiration time for display
              this.expirationGoogleToken = this.formatExpirationDate(expirationTime);
    
              // Check if the token is still valid
              this.isConnectedToGoogleCalendar = this.checkTokenExpiration(expirationTime);

              console.warn(this.expirationGoogleToken);
              console.log('');

              this.isLoadingAccToken = false;
              this.startTokenCheckLoop();
            } else {
              console.log('No token fetched...');
              this.isLoadingAccToken = false;
            }
          },
          error: (error) => {
            console.error('Erreur fetching access token:', error);
            this.isLoadingAccToken = false;
            this.toastr.error("Une erreur est survenue au niveau de Google Calendar.");
          }
        });
      } else {
        console.warn("Utilisateur non authentifié, récupération du token impossible");
      }
    }











    































    
















  async addEventToGoogleCalendar(event: any) {
    try {
      // Get the Google access token from localStorage or another source
      const accessToken = localStorage.getItem('google_token');
      
      if (!accessToken) {
        console.error('No Google access token found');
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

        

        const eventId = await this.findGoogleEventIdByAppEventId(this.selectedEvent.extendedProps.EventId);

        
        console.log("TO delete => eventId : "+eventId);
    

        if (!eventId) {
          console.error("❌ Erreur: eventId est introuvable sur Google Calendar !");

          const EVENTIDTODELETEINDATABASE = this.selectedEvent.extendedProps.EventId; 
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
     
    
          
              
                const EVENTIDTODELETEINDATABASE = this.selectedEvent.extendedProps.EventId; 
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
        
                const EVENTIDTODELETEINDATABASE = this.selectedEvent.extendedProps.EventId; 
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

  
    
   
 

  handleSignoutClick(): void {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken(null);
      this.events = '';
    }
  }
 

 


   fetchTasks() {

    this.isLoading = true;
  
    this.http.get(`${environment.url}/GetClientTachesAllOfThem`).subscribe({
      next: (response: any) => {
   
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
            EventId: task.EventId, 
            EventStart : task.EventStart,
            EventEnd : task.EventEnd
          }
        }));
  
        this.extractFilterOptions();
  
        this.filters.persons = this.allPersons.map(person => person.id);
        this.filters.tasks = this.allTasks.map(task => task.id);
  
        this.calendarOptions.events = this.getFilteredEvents();
        
        this.unsynchronizedTasks = [];
        this.NumberOfUnsyncTasks = 0;

        let counter = 0;
    
        console.log('A')

          this.originalEvents.forEach((task) => {
            const appEventId = task.extendedProps.EventId.toString();
            const isSynchronized = this.allEventsOfGoogleCalendar.some((event) =>
              event.extendedProperties?.private?.appEventId?.toString() === appEventId
            );
            if (!isSynchronized) {
              this.unsynchronizedTasks.push(task);
              counter++;
            }
          });

        this.NumberOfUnsyncTasks = counter;

        console.log(this.unsynchronizedTasks);
        console.log('C')


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
         setTimeout(() => {
          this.isLoading = false;
        }, 400);
      }
    });
  }

  


  



  async getAllGoogleCalendarEvents() {
    try {
      if (!this.gapiInited) {
        console.error("gapi client is not initialized");
        return;
      }
  
      this.isLoading = true;
      const accessToken = localStorage.getItem('google_token');
  
      if (!accessToken) {
        console.error('No Google access token found');
        return;
      }
  
      gapi.client.setToken({
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

      this.allEventsOfGoogleCalendar = events;
      console.warn("Google Calendar Events:", events);
      this.isLoading = false;
  
    } catch (error) {
      this.allEventsOfGoogleCalendar = [];
      console.error("❌ Error fetching Google Calendar events:", error);
      this.isLoading = false;
    }
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
    this.showPopup = true; 
  }

  closePopup(): void {
    this.showPopup = false;
    setTimeout(()=>{
      this.selectedEvent = null;
    }, 500);
  }

  closePopupOfReplanifier(): void {
    this.isReplanifierClicked = false;
  }





  formatDateForDB = (dateString: Date): string => {
    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} 08:${minutes}:${seconds}.${milliseconds}`;
};







 formatDateForGoogleWithoutTimezoneAdjustment(dateInput: any): string {
  const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  const offsetMinutes = date.getTimezoneOffset(); 

  date.setMinutes(date.getMinutes() - offsetMinutes);

  return date.toISOString(); 
}




setTimeToEightThirty(dateInput: any): string {
  const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  // Set the time to 8:30 AM
  date.setHours(9);
  date.setMinutes(30);
  date.setSeconds(0);
  date.setMilliseconds(0);

  
  return date.toISOString(); 
}

setTimeToEightThirty2(dateInput: any): string {
  const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  // Set the time to 8:30 AM
  date.setHours(16);
  date.setMinutes(30);
  date.setSeconds(0);
  date.setMilliseconds(0);

  
  return date.toISOString(); 
}




  async SauvegarderDateReplanification() {

      this.isSauvegarding = true;

      if(this.isConnectedToGoogleCalendar){
        if(this.selectedDate !== null && this.selectedEvent !== null){

          const accessToken = localStorage.getItem('google_token');

          if (!accessToken) {
            console.error('❌ No Google access token found.');
          }
          else{
            gapi.client.setToken({ access_token: accessToken });

            const eventId = await this.findGoogleEventIdByAppEventId(this.selectedEvent.extendedProps.EventId);
            
            if (!eventId) {
              console.error("❌ Erreur: eventId est introuvable sur Google Calendar !");
            }
            else{
              try {
                
                let googleFormatWanted = this.formatDateForGoogleWithoutTimezoneAdjustment(this.selectedDate);
                let startDateCustomized = this.setTimeToEightThirty(googleFormatWanted);
                let endDateCustomized = this.setTimeToEightThirty2(googleFormatWanted);


                console.log("startDateCustomized : "+startDateCustomized);
                console.log("endDateCustomized : "+endDateCustomized);


                const updatedEvent = {
                  start: {
                    dateTime: startDateCustomized,  
                    timeZone: 'UTC'  
                  },
                  end: {
                    dateTime: endDateCustomized,
                    timeZone: 'UTC' 
                  }
                };

                await gapi.client.calendar.events.patch({
                  calendarId: 'primary',
                  eventId: eventId,
                  resource: updatedEvent,
                });
      
              } catch (checkError) {
                console.error(checkError);
              } 
            }
          }
        }
      }
      if(this.selectedDate !== null && this.selectedEvent !== null){
  
  
        let dateFormatedBeforeStoringIt = this.formatDateForDB(this.selectedDate);
        let googleFormatWanted = this.formatDateForGoogleWithoutTimezoneAdjustment(this.selectedDate);
        let afterfixdate = this.setTimeToEightThirty(googleFormatWanted);

  
        const payload = {
          NewDate: dateFormatedBeforeStoringIt,
          NewDateNonFormated : this.selectedDate, 
          EventId: this.selectedEvent.extendedProps.EventId,
        };
        
        this.http.post(`${environment.url}/UpdateSingleEvent`, payload).subscribe({
          next: (response) => {
            console.log('Sauvegarde réussie');
  
          
  
            let StartDateY = new Date(dateFormatedBeforeStoringIt);
            StartDateY.setHours(StartDateY.getHours() + 5);
            let EndDateY = `${StartDateY.getFullYear()}-${(StartDateY.getMonth() + 1).toString().padStart(2, '0')}-${StartDateY.getDate().toString().padStart(2, '0')} 08:${StartDateY.getMinutes().toString().padStart(2, '0')}:${StartDateY.getSeconds().toString().padStart(2, '0')}.${StartDateY.getMilliseconds()}`;
  
          
            this.isSauvegarding = false;
  
            this.closePopupOfReplanifier();
            setTimeout(()=>{
              this.closePopup();
              this.fetchTasks();
            }, 333);
  
  
          },
          error: (error) => {
            console.error('Erreur lors de la sauvegarde', error);
            this.isSauvegarding = false;
            this.toastr.error("Une erreur est survenue lors de la replanification.")
          },
        });
        this.isSauvegarding = false;
      }

      this.isSauvegarding = false;

  }




  formatDateOnly(dateString: string | Date | undefined): string {
    if (!dateString) return '---'; 

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