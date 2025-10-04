import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private authService = inject(AuthService);
  
  ngOnInit(): void {
    // Check auth status on app initialization
    this.authService.checkAuthStatus().subscribe({
      next: () => {
        // User is authenticated
        console.log('User authenticated');
      },
      error: () => {
        // User is not authenticated or token expired
        console.log('User not authenticated');
      }
    });
  }
}
