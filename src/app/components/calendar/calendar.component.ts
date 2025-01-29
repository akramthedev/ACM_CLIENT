import { Component, OnInit, HostListener, ElementRef} from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import frLocale from '@fullcalendar/core/locales/fr'; 
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";



@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})




export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions;
  selectedEvent: any = null; 
  showPopup: boolean = false;  
  isLoading: boolean = true;
  isUpdating: boolean = false;
  isDeleteTask: boolean = false;

  constructor(private eRef: ElementRef, private http: HttpClient) {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: frLocale,
      events : [],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      editable: false,
      selectable: true,
      eventClick: this.handleEventClick.bind(this), 
      eventDidMount: (info) => {
        info.el.style.cursor = 'pointer';
      },
    };
  }

  ngOnInit(): void {
    this.fetchTasks();
  }



  fetchTasks(): void {
    this.isLoading = true;
    this.http.get(`${environment.url}/GetClientTachesAllOfThem`).subscribe({
      next: (response: any) => {
        console.log('Fetched tasks:', response); 
        this.calendarOptions.events = response.map((task: any) => ({
          title: task.TacheClientIntitule,
          start: this.formatDate(task.start_date),
          end: this.formatDate(task.end_date),
          backgroundColor: task.color || '#7366fe',           
          extendedProps: {
            Commentaire: task.Commentaire,
            textColor: 'white',
            ClientTacheId : task.ClientTacheId, 
            ClientMissionPrestationId : task.ClientMissionPrestationId, 
            ClientMissionId : task.ClientMissionId, 
            PrestationDesignation : task.PrestationDesignation, 
            MissionDesignation : task.MissionDesignation, 
            TacheIntitule : task.TacheIntitule, 
            TacheId : task.TacheId, 
            isDone : task.isDone, 
            isReminder : task.isReminder, 
            ClientEmail1 : task.ClientEmail1, 
            ClientEmail2 : task.ClientEmail2, 
            ClientTelephone1 : task.ClientTelephone1, 
            ClientAdresse : task.ClientAdresse, 
            ClientPrenom : task.ClientPrenom, 
            ClientNom : task.ClientNom,
            AgentNom  : task.AgentNom
          }
        }));

        console.log(this.calendarOptions.events);
      },
      error: (error) => {
        console.error('Error fetching tasks:', error); 
      },
      complete: () => {
        console.log('Fetch tasks complete'); 
        this.isLoading = false;
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



  markAsDone(): void {
    if (!this.selectedEvent) return;
  
    this.isUpdating = true;
  
    const taskId = this.selectedEvent.extendedProps.ClientTacheId; 
    const updateUrl = `${environment.url}/MarkAsDone/${taskId}`;
  
    this.http.put(updateUrl, { isDone : true, color: "#28a745" }).subscribe({
      next: (response) => {
        console.log('Tâche marquée comme faite:', response);
  
        this.selectedEvent.setProp('backgroundColor', '#28a745'); 
        this.selectedEvent.setExtendedProp('isDone', true);
        
        this.closePopup();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
      },
      complete: () => {
        this.isUpdating = false;  
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