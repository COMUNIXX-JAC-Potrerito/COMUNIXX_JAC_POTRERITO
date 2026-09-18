import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { IdleService } from './services/idle.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('comunixx-frontend');

  constructor() {
    // Cierre de sesión por inactividad (seguridad).
    inject(IdleService).iniciar();
  }
}
