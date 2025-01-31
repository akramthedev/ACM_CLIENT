import { Component, OnInit, HostListener, ElementRef,ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import frLocale from '@fullcalendar/core/locales/fr'; 
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Title } from '@angular/platform-browser';
import { GoogleAuthService  } from "../../services/google-auth.service";

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

  filters: { persons: string[]; tasks: string[] } = { persons: [], tasks: [] };

  allPersons: { id: string; nom: string; prenom: string }[] = [];  // Unique persons
  allTasks: { id: string; nom: string }[] = [];    // Unique task types
  originalEvents: any[] = [];
  user: any = null;



  constructor(private title: Title,private eRef: ElementRef, private http: HttpClient,private googleAuthService: GoogleAuthService) {
    this.title.setTitle("Plan de Tâches | ACM");
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: frLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      editable: false, // turn it ot true to use drop and drag
      selectable: true,
      // eventDrop: this.handleEventDrop.bind(this),
      eventClick: this.handleEventClick.bind(this), 
      eventDidMount: (info) => {
        info.el.style.cursor = 'pointer';
      },
      events: () => this.getFilteredEvents()
    };
  }

  ngOnInit(): void {

    
    this.fetchTasks();
    this.user = this.googleAuthService.getUser();

  }




  signIn(): void {
    // Ici vous pouvez utiliser google.accounts.id.prompt() ou appeler la méthode d'initialisation
    this.googleAuthService.loadGisScript(); // Cela va initialiser et déclencher One Tap

    // Une fois l'utilisateur connecté, mettez à jour l'utilisateur dans le composant
    setTimeout(() => {
      this.user = this.googleAuthService.getUser(); // Récupérez l'utilisateur
      console.log('Utilisateur connecté:', this.user);
    }, 1000); // Attendre un moment pour s'assurer que l'utilisateur soit authentifié
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
  
      console.log("🟢 Normalized ClientId:", ClientId);
  
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
  




  


 
  



  
  // deleteTask(): void {
  //   if (!this.selectedEvent) return;
  
  //   this.isDeleteTask = true;  
  
  //   const taskId = this.selectedEvent.extendedProps.ClientTacheId; 
  //   const deleteURL = `${environment.url}/DeleteTaskById/${taskId}`;
  
  //   this.http.delete(deleteURL).subscribe({
  //     next: (response) => {
  //       console.log('Tâche marquée comme faite:', response);
  
  //       this.selectedEvent.setProp('backgroundColor', '#28a745'); 
  //       this.selectedEvent.setExtendedProp('isDone', true);
        
  //       this.closePopup();
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors de la mise à jour:', error);
  //     },
  //     complete: () => {
  //       this.isDeleteTask = false;  
  //     }
  //   });
  // }
  
}

