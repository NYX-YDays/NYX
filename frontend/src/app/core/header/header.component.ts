import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink
  ],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  /** The application name. */
  protected appName = environment.appName;

}
