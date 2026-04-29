import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ApproachState } from '../../enums/approach-state';

@Component({
  selector: 'app-approach-state',
  imports: [
    TranslatePipe
  ],
  templateUrl: './approach-state.component.html',
  styleUrl: './approach-state.component.scss'
})
export class ApproachStateComponent {

  /** Approach state. */
  public approachState = input.required<ApproachState>();

  protected readonly ApproachState = ApproachState;

}
