import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Signal,
  viewChild,
} from '@angular/core';

import { DialogContent } from '../../utils/types/dialog-content.type';
import { DialogForm } from './dialog-form/dialog-form';
import { Auth } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { DialogHandler } from '../../services/dialog-handler.service';
import { DialogStructure } from '../../utils/interfaces/dialog-structure.interface';
import { FormTemplate } from '../../services/form-template.service';

@Component({
  selector: 'app-dialog',
  imports: [DialogForm],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog implements AfterViewInit {
  /** DialogHandler service: manages dialog state and emits events */
  #dialogHandler: DialogHandler = inject(DialogHandler);

  /** FormTemplate service: provides titles and buttons for forms */
  #formTemplate: FormTemplate = inject(FormTemplate);

  /** FocusTrapFactory service: creates focus traps for accessibility */
  #focusTrapFactory: FocusTrapFactory = inject(FocusTrapFactory);

  /** Computed signal for current dialog buttons */
  protected buttons: Signal<DialogStructure['buttons'] | undefined> =
    computed(() => {
      const content = this.#dialogHandler.actualContent();
      const key = content !== 'message' ? content : undefined;
      if (!key) return undefined;
      else return this.#formTemplate.getButtonsByFieldKey(key);
    });

  /** FocusTrap instance to manage focus within the dialog */
  private focusTrap!: FocusTrap;

  /** Reference to the dialog container element */
  private dialog = viewChild.required<ElementRef | null>('dialogContainer');

  /** Signal for the current active dialog content */
  protected dialogContent: Signal<DialogContent> =
    this.#dialogHandler.actualContent;

  /** Tracks whether the dialog was rejected/cancelled */
  protected rejectEmitter = false;

  /** Getter for the dialog structure data */
  get dialogData(): DialogStructure | undefined {
    return this.#dialogHandler.dialogData;
  }

  /** Handles Escape key press to close the dialog */
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.closeDialog();
  }

  /** Lifecycle hook: sets up focus trap after view initialization */
  ngAfterViewInit() {
    const dialogElelement = this.dialog();
    if (dialogElelement) {
      console.log(dialogElelement);
      this.focusTrap = this.#focusTrapFactory.create(
        dialogElelement.nativeElement
      );
      this.focusTrap.focusInitialElement();
    }
  }

  /** Returns the dialog title depending on the content type */
  protected getTitle(): string {
    const content = this.#dialogHandler.actualContent();
    const key = content !== 'message' ? content : undefined;
    if (key) {
      return this.#formTemplate.getTitleByFieldKey(key!);
    } else {
      return this.dialogData!.title;
    }
  }

  /** Closes the dialog and emits a close event */
  protected closeDialog(): void {
    this.#dialogHandler.emitData('CLOSE_EVENT');
    console.log('Dialog closed');
  }

  /** Sends a trigger event to the DialogHandler */
  sendTrigger(value: string): void {
    this.#dialogHandler.trigger(value);
  }

  /** Immediately emits a value to the DialogHandler */
  instantEmit(value: boolean | 'CLOSE_EVENT'): void {
    this.#dialogHandler.emitData(value);
  }
}

