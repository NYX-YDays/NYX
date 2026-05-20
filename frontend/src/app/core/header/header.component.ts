import { Component, inject, OnInit, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UtilService } from '../../shared/services/util.service';
import { UserIdentity } from '../../shared/models/user-identity';
import { UserRole } from '../../shared/enums/user-role';
import { AlertService } from '../../shared/services/alert.service';
import { AlertType } from '../alert-manager/enums/alert-type';
import { ApproachService } from '../../features/approaches/services/approach.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    TranslatePipe
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

  /** The number of pending approaches linked to the current user's ads. */
  protected pendingApproachCount = signal(0);

  protected readonly UserRole = UserRole;

  //endregion

  //region injections

  private readonly utilService = inject(UtilService);

  private readonly alertService = inject(AlertService);

  private readonly translateService = inject(TranslateService);

  private readonly router = inject(Router);

  private readonly approachService = inject(ApproachService);

  //endregion

  //region methods

  async ngOnInit() {
    this.currentUserIdentity = this.utilService.getCurrentUserIdentity() ?? undefined;

    if (this.currentUserIdentity?.roles.includes(UserRole.SERVICE_PROVIDER)) {
      this.approachService.onPendingApproachCountChanged.subscribe(async () =>
        this.pendingApproachCount.set(await this.approachService.getUserPendingApproachCountAsync())
      );
      this.approachService.onPendingApproachCountChanged.emit(); // Get current user's pending approach count
    }
  }

  /** Sign out the current user after confirmation and redirect to the home page. */
  protected async signOutAsync() {
    this.alertService.showConfirmation(
      async () => {

        // Remove current user identity
        this.utilService.removeCurrentUserIdentity();
        this.currentUserIdentity = undefined;

        // Navigate back to home page
        await this.router.navigateByUrl('/');

        // Show success message
        this.alertService.pushAlert(
          AlertType.SUCCESS,
          this.translateService.instant('HEADER.SIGN_OUT_SUCCESS_TEXT'),
          7
        );

      }, this.translateService.instant('HEADER.CONFIRM_SIGN_OUT_MESSAGE')
    );
  }

  //endregion

}
