import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UtilService } from '../../../../shared/services/util.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent {

  //region injections

  private readonly router = inject(Router);
  private readonly utilService = inject(UtilService);

  //endregion

  //region fields

  /** Current admin user. */
  public currentUser = this.utilService.getCurrentUserIdentity();

  //endregion

  //region methods

  /** Logout. */
  public logout(): void {
    this.utilService.removeCurrentUserIdentity();
    this.router.navigate(['/sign-in']);
  }

  //endregion

}