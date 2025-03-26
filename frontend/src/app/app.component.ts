import { Component, inject, OnInit } from '@angular/core';
import { ActivationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { RouteSettings } from './shared/models/route-settings';
import { TranslateService } from '@ngx-translate/core';
import { AlertStackComponent } from './core/alert-manager/components/alert-stack/alert-stack.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, AlertStackComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  //region fields

  /** If the app layout (header, footer, etc.) must be displayed. */
  protected showAppLayout = true;

  //endregion

  //region injections

  private translateService = inject(TranslateService);

  private router = inject(Router);

  //endregion

  //region methods

  ngOnInit() {

    // Set default app language
    this.translateService.setDefaultLang('en');
    this.translateService.use(this.translateService.getBrowserLang() ?? 'en');

    // Subscribe to current route data
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
