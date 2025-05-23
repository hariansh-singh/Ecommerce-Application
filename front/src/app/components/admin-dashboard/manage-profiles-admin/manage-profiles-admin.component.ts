import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageProfilesService } from '../../../../services/manageProfilesServices/manage-profiles.service';

@Component({
  selector: 'app-manage-profiles-admin',
  imports: [CommonModule],
  templateUrl: './manage-profiles-admin.component.html',
  styleUrl: './manage-profiles-admin.component.css'
})
export class ManageProfilesAdminComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private manageProfilesService: ManageProfilesService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.manageProfilesService.getAllUsers().subscribe({
      next: (users : any) => {
        console.log('Received users:', users); // Debug log
        this.users = Array.isArray(users) ? users : [];
        this.loading = false;
      },
      error: (error : any) => {
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        console.error('Error loading users:', error);
        this.users = []; // Ensure users is always an array
      }
    });
  }

  changeUserRole(userId: number, newRole: string): void {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      this.manageProfilesService.changeUserRole(userId, newRole).subscribe({
        next: () => {
          // Update the user's role in the local array
          const userIndex = this.users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            this.users[userIndex].role = newRole;
          }
          alert(`User role changed to ${newRole} successfully!`);
        },
        error: (error : any) => {
          alert('Failed to change user role. Please try again.');
          console.error('Error changing user role:', error);
        }
      });
    }
  }

  changeUserStatus(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    const currentStatus = (user?.status || 'inactive').toLowerCase();
    const newStatus = currentStatus === 'active' ? 'Inactive' : 'Active';
    
    if (confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      this.manageProfilesService.changeUserStatus(userId).subscribe({
        next: () => {
          // Update the user's status in the local array
          const userIndex = this.users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            this.users[userIndex].status = newStatus;
          }
          alert(`User status changed to ${newStatus} successfully!`);
        },
        error: (error : any) => {
          alert('Failed to change user status. Please try again.');
          console.error('Error changing user status:', error);
        }
      });
    }
  }

  refreshUsers(): void {
    this.loadUsers();
  }
}