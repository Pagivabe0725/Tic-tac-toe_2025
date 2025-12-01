import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * NotFound Component
 *
 * Displays a simple "Page Not Found" view whenever the user navigates
 * to an undefined route. Provides a button that redirects the user
 * back to the application's main page.
 */
@Component({
  selector: 'app-not-found',
  styles: `
    div{
      width:100%;
      height:100%;
      box-sizing:border-box;
      margin: 0;
      padding:0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    h1{
      padding:0;
      margin: 0;
      font-size: 5vw;
    }

    button{
      font-size:3vw;
      padding: 20px;
      border-radius:1000px;
      border: none; 
      color: var(--n-100);
      background-image: linear-gradient(to right bottom, var(--gradient-p-component), var(--gradient-a-component));
      text-shadow: 1px 1px 1px var(--p-40);
      font-weight: bolder;
      cursor: pointer;
    }

    button:hover{
      scale: 0.95;
    }
  `,
  template: `
    <div role="main" tabindex="-1">
      <h1 aria-label="Page not found">Page Not Found!!!</h1>
      <button
        aria-label="Go back to the Tic Tac Toe main page"
        (click)="backNavigation()"
      >
        Back
      </button>
    </div>
  `,
})
export class NotFound {
  /**
   * Router instance used for navigating programmatically.
   */
  #router: Router = inject(Router);

  /**
   * Navigates the user back to the main Tic-Tac-Toe page.
   */
  backNavigation(): void {
    this.#router.navigateByUrl('/tic-tac-toe');
  }
}
