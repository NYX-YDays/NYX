import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../shared/services/alert.service';
import { AlertType } from '../alert-manager/enums/alert-type';

@Component({
  selector: 'app-e404',
  imports: [
    RouterLink
  ],
  templateUrl: './not-found.component.html',
  standalone: true,
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit {

  //region injections

  private alertService = inject(AlertService);

  //endregion

  //region methods

  ngOnInit() {
    this.alertService.pushAlert(AlertType.WARNING, 'Page not found.', 7);
  }

  //endregion

}
