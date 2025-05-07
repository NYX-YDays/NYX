import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { ActivationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { RouteSettings } from './shared/models/route-settings';
import { TranslateService } from '@ngx-translate/core';
import { AlertStackComponent } from './core/alert-manager/components/alert-stack/alert-stack.component';
import { UtilService } from './shared/services/util.service';
import Cookies from 'universal-cookie';
import { Constants } from './shared/constants';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, AlertStackComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {

  //region fields

  /** If the app layout (header, footer, etc.) must be displayed. */
  protected showAppLayout = true;

  //endregion

  //region injections

  private readonly utilService = inject(UtilService);

  private readonly translateService = inject(TranslateService);

  private readonly router = inject(Router);

  //endregion

  //region methods

  async ngOnInit() {

    // Set default app language
    this.translateService.setDefaultLang('en');
    this.translateService.use(this.translateService.getBrowserLang() ?? 'en');

    // Check if the current user is still authenticated
    if (!await this.utilService.checkUserIdentityAsync()) {
      const cookie = new Cookies(null, {path: '/'});
      cookie.remove(Constants.COOKIE_NAMES.userIdentity);
    }

  }

  ngAfterViewInit() {
    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof ActivationEnd) {
          const routeSettings = event.snapshot.data as RouteSettings;

          // Update header field values
          this.showAppLayout = routeSettings.showAppLayout ?? true;

        }
      }
    );
  }

  //endregion

}
