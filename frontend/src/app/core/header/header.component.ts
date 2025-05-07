import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UtilService } from '../../shared/services/util.service';
import { UserIdentity } from '../../shared/models/user-identity';
import { UserRole } from '../../shared/enums/user-role';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { AlertService } from '../../shared/services/alert.service';
import { AlertType } from '../alert-manager/enums/alert-type';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    TranslatePipe,
    ConfirmModalComponent
  ],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  //region fields

  /** The application name. */
  protected appName = environment.appName;

  /** Current user identity. */
  protected currentUserIdentity?: UserIdentity;

  /** Logout confirm modal. */
  @ViewChild("confirmModal") protected confirmModal?: ElementRef;

  protected readonly UserRole = UserRole;

  //endregion

  //region injections

  private readonly utilService = inject(UtilService);

  private readonly alertService = inject(AlertService);

  private readonly translateService = inject(TranslateService);

  private readonly router = inject(Router);

  //endregion

  //region methods

  ngOnInit() {
    this.currentUserIdentity = this.utilService.getCurrentUserIdentity() ?? undefined;
  }

  /** Sign out the current user and redirect to the home page. */
  protected signOut() {
    this.utilService.removeCurrentUserIdentity();
    this.currentUserIdentity = undefined;

    this.router.navigateByUrl('/').then(
      _ => this.alertService.pushAlert(
        AlertType.SUCCESS,
        this.translateService.instant('HEADER.SIGN_OUT_SUCCESS_TEXT'),
        7
      )
    );
  }

  //endregion

}
