import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Services (private)
  private authService = inject(AuthService);

  // Auth signals
  protected currentUser = this.authService.currentUser;
  protected userName = this.authService.userName;
  protected userTenant = this.authService.userTenant;
  protected tenantName = this.authService.tenantName;

  // Da utilizzare quando si mostra lista di sensori 
  ngOnInit(): void {
    // Refresh dei dati quando reinizializzo il component
    this.authService.refreshProfile().subscribe();
  }

  logout(): void {
    this.authService.logout();
  }
}