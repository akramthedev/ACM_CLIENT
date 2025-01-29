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
    this.http.get(`${environment.url}/GetClientTachesAllOfThem`).subscribe({
      next: (response: any) => {
        console.log('Fetched tasks:', response); 
  
        this.calendarOptions.events = response.map((task: any) => ({
          title: task.Intitule,
          start: this.formatDate(task.start_date),
          end: this.formatDate(task.end_date),
          Commentaire: task.Commentaire,
          backgroundColor: task.color || '#7366fe', 
          textColor: 'white',
          ClientTacheId : task.ClientTacheId, 
          ClientMissionPrestationId : task.ClientMissionPrestationId, 
          ClientMissionId : task.ClientMissionId, 
          TacheId : task.TacheId, 
          isDone : task.isDone, 
          isReminder : task.isReminder
        }));

        console.log(this.calendarOptions.events);
      },
      error: (error) => {
        console.error('Error fetching tasks:', error); 
      },
      complete: () => {
        console.log('Fetch tasks complete'); 
      }
    });
  }

  formatDate(dateString: string): string {
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
}