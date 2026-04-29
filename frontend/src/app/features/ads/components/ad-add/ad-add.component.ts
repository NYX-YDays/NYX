import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AdEditingFormComponent } from '../ad-editing-form/ad-editing-form.component';

@Component({
  selector: 'app-ad-add',
  imports: [
    RouterLink,
    TranslatePipe,
    AdEditingFormComponent
  ],
  templateUrl: './ad-add.component.html',
  styleUrl: './ad-add.component.scss'
})
export class AdAddComponent {

}
