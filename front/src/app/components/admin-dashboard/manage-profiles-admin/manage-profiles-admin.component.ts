import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageProfilesService } from '../../../../services/manageProfilesServices/manage-profiles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-profiles-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-profiles-admin.component.html',
  styleUrl: './manage-profiles-admin.component.css'
})
export class ManageProfilesAdminComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';

  constructor(private manageProfilesService: ManageProfilesService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.manageProfilesService.getAllUsers().subscribe({
      next: (users: any) => {
        console.log('Received users:', users);
        this.users = Array.isArray(users) ? users : [];
        this.filteredUsers = [...this.users]; // Initialize filtered users
        this.loading = false;
        
        // Success toast
        if (this.users.length > 0) {
          this.filterUsers(); // Apply current search filter
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Loaded ${this.users.length} users successfully`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#f8f9fa',
            color: '#495057'
          });
        }
      },
      error: (error: any) => {
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        console.error('Error loading users:', error);
        this.users = [];
        this.filteredUsers = []; // Clear filtered users too
        
        // Error toast
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to load users',
          text: 'Please check your connection and try again',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          background: '#f8d7da',
          color: '#721c24'
        });
      }
    });
  }

  // Search functionality
  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.filterUsers();
  }

  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      this.filteredUsers = this.users.filter(user => 
        user.name?.toLowerCase().includes(searchTermLower) ||
        user.email?.toLowerCase().includes(searchTermLower) ||
        user.customerId?.toString().includes(searchTermLower)
      );
    }

    // Show search results toast
    if (this.searchTerm.trim() && this.filteredUsers.length === 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'No users found',
        text: `No users match "${this.searchTerm}"`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#fff3cd',
        color: '#856404'
      });
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Search cleared',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }

  // Highlight search terms in text
  highlightSearchTerm(text: string): string {
    if (!text || !this.searchTerm.trim()) {
      return text || '';
    }
    
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    const regex = new RegExp(`(${searchTermLower})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  async changeUserRole(userId: number, newRole: string): Promise<void> {
    const user = this.users.find(u => u.customerId === userId);
    const userName = user?.name || 'Unknown User';
    
    // Confirmation dialog
    const result = await Swal.fire({
      title: 'Change User Role',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>User:</strong> ${userName}</p>
          <p><strong>Current Role:</strong> ${user?.role || 'Unknown'}</p>
          <p><strong>New Role:</strong> ${newRole}</p>
        </div>
        <p style="color: #856404; font-size: 14px; margin-top: 15px;">
          Are you sure you want to change this user's role?
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, change to ${newRole}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      // Show loading toast
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Updating user role...',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.manageProfilesService.changeUserRole(userId, newRole).subscribe({
        next: () => {
          // Update the user's role in the local array
          const userIndex = this.users.findIndex(u => u.customerId === userId);
          if (userIndex !== -1) {
            this.users[userIndex].role = newRole;
          }
          
          // Also update filtered users
          const filteredUserIndex = this.filteredUsers.findIndex(u => u.customerId === userId);
          if (filteredUserIndex !== -1) {
            this.filteredUsers[filteredUserIndex].role = newRole;
          }
          
          // Success toast
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Role Updated Successfully!',
            text: `${userName} is now a ${newRole}`,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            background: '#d4edda',
            color: '#155724'
          });
        },
        error: (error: any) => {
          console.error('Error changing user role:', error);
          
          // Error toast
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Failed to update role',
            text: 'Please try again or contact support',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            background: '#f8d7da',
            color: '#721c24'
          });
        }
      });
    }
  }

  async changeUserStatus(userId: number): Promise<void> {
    const user = this.users.find(u => u.customerId === userId);
    const userName = user?.name || 'Unknown User';
    const currentStatus = (user?.status || 'inactive').toLowerCase();
    const newStatus = currentStatus === 'active' ? 'Inactive' : 'Active';
    const isActivating = newStatus === 'Active';
    
    // Confirmation dialog with different styling based on action
    const result = await Swal.fire({
      title: `${isActivating ? 'Activate' : 'Deactivate'} User`,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>User:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
          <p><strong>Current Status:</strong> ${currentStatus}</p>
          <p><strong>New Status:</strong> ${newStatus}</p>
        </div>
        <p style="color: ${isActivating ? '#155724' : '#721c24'}; font-size: 14px; margin-top: 15px;">
          ${isActivating 
            ? 'This user will regain access to their account.' 
            : 'This user will lose access to their account.'}
        </p>
      `,
      icon: isActivating ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isActivating ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${newStatus.toLowerCase()} user`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: !isActivating,
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      // Show loading toast
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `${isActivating ? 'Activating' : 'Deactivating'} user...`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.manageProfilesService.changeUserStatus(userId).subscribe({
        next: () => {
          // Update the user's status in the local array
          const userIndex = this.users.findIndex(u => u.customerId === userId);
          if (userIndex !== -1) {
            this.users[userIndex].status = newStatus;
            // Also update userStatus if it exists
            this.users[userIndex].userStatus = isActivating ? 1 : 0;
          }
          
          // Also update filtered users
          const filteredUserIndex = this.filteredUsers.findIndex(u => u.customerId === userId);
          if (filteredUserIndex !== -1) {
            this.filteredUsers[filteredUserIndex].status = newStatus;
            this.filteredUsers[filteredUserIndex].userStatus = isActivating ? 1 : 0;
          }
          
          // Success toast
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `User ${newStatus} Successfully!`,
            text: `${userName} has been ${newStatus.toLowerCase()}`,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            background: isActivating ? '#d4edda' : '#fff3cd',
            color: isActivating ? '#155724' : '#856404'
          });
        },
        error: (error: any) => {
          console.error('Error changing user status:', error);
          
          // Error toast
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Failed to update status',
            text: 'Please try again or contact support',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            background: '#f8d7da',
            color: '#721c24'
          });
        }
      });
    }
  }

  refreshUsers(): void {
    // Show loading toast for refresh
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Refreshing users...',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    this.loadUsers();
  }
}