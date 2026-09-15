import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-publico',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './publico.html',
  styleUrl: './publico.scss',
})
export class Publico {}
