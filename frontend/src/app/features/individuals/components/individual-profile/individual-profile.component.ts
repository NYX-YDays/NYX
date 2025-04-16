import { Component, inject, OnInit } from '@angular/core';
import { IndividualService } from '../../services/individual.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './individual-profile.component.html',
  styleUrl: './individual-profile.component.scss'
})
export class IndividualProfileComponent implements OnInit {

  //region injections

  private readonly individualService = inject(IndividualService);

  //endregion

  //region methods

  async ngOnInit() {
    console.log(await this.individualService.getCurrentIndividual());
  }

  //endregion

}
