import { Component } from '@angular/core';
import { EventEditingFormComponent } from '../event-editing-form/event-editing-form.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-add-event',
  imports: [
    EventEditingFormComponent,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.scss'
})
export class AddEventComponent {

}
