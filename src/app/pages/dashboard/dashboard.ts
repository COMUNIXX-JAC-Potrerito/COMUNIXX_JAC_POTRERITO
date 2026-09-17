import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private auth = inject(AuthService);
  private router = inject(Router);

  esSuperadmin(): boolean {
    return this.auth.esSuperadmin();
  }

  salir() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
