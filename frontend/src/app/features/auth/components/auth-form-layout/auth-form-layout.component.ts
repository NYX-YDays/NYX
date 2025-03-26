import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-form-layout',
  imports: [
    NgOptimizedImage,
    RouterLink
  ],
  templateUrl: './auth-form-layout.component.html',
  styleUrl: './auth-form-layout.component.scss'
})
export class AuthFormLayoutComponent {

  //region parameters

  /** Form title. */
  @Input() public title = '';

  /** Notify when the form is submitted. */
  @Output() public onSubmit = new EventEmitter;

  /** Submit button text. */
  @Input() public buttonSubmitText = '';

  /** If the submit button is disabled. */
  @Input() public disableSubmitButton = false;

  /** Text of the extra link to display bellow the submit button. */
  @Input() public extraLinkText = '';

  /** URI to navigate to when clicking the extra link. */
  @Input() public extraLinkUri = '';

  /** Error message to display. */
  @Input() public errorMessage = '';

  /** If the form is loading. */
  @Input() public isLoading = false;

  //endregion

}
