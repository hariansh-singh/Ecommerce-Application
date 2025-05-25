import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageProfilesService } from '../../../../services/manageProfilesServices/manage-profiles.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

interface User {
  customerId: number;
  name: string;
  email: string;
  role: string;
  status: string;
  userStatus: number;
  registeredAt: string;
  lastLoginDate?: string;
}

@Component({
  selector: 'app-manage-profiles-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-profiles-admin.component.html',
  styleUrl: './manage-profiles-admin.component.css'
})
export class ManageProfilesAdminComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';
  currentAdmin: any = null;
  currentAdminId: number | null = null;

  // Filter properties
  selectedRoleFilter: string = '';
  selectedStatusFilter: string = '';

  // Sort properties
  sortBy: string = 'name';
  sortOrder: string = 'asc';

  // Search debouncing
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Animation state
  isRefreshing = false;

  authService: any = inject(AuthService);

  constructor(private manageProfilesService: ManageProfilesService) { 
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyAllFilters();
    });
  }

  ngOnInit(): void {
    this.loadCurrentAdminInfo();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Track by function for better performance
  trackByUserId(index: number, user: User): number {
    return user.customerId;
  }

  // Get user initials for avatar
  getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Get stats for dashboard
  getActiveUsersCount(): number {
    return this.users.filter(user => 
      (user.userStatus || '') === 1
    ).length;
  }

  getAdminUsersCount(): number {
    return this.users.filter(user => 
      (user.role || '').toLowerCase() === 'admin'
    ).length;
  }

  // Load current admin information from localStorage or session
  loadCurrentAdminInfo(): void {
    try {
      const adminData: any = this.authService.decodedTokenData();
      if (adminData) {
        this.currentAdmin = adminData;
        this.currentAdminId = adminData["customerId"];
        console.log('Current admin loaded from storage:', this.currentAdmin);
        console.log("User status is: ", adminData["UserStatus"]);
      } else {
        console.warn('No admin data found in storage');
      }
    } catch (error) {
      console.error('Error loading admin info from storage:', error);
      
      this.showToast({
        icon: 'warning',
        title: 'Admin verification failed',
        text: 'Some features may be restricted',
        background: '#fff3cd',
        color: '#856404'
      });
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.manageProfilesService.getAllUsers().subscribe({
      next: (users: any) => {
        console.log('Received users:', users);
        this.users = Array.isArray(users) ? users : [];
        this.applyAllFilters();
        
        // If we don't have current admin info, try to find it in the users list
        if (!this.currentAdmin && this.currentAdminId) {
          this.currentAdmin = this.users.find(user => 
            (user.customerId === this.currentAdminId || user.customerId === this.currentAdminId) && 
            (user.role || '').toLowerCase() === 'admin'
          );
          if (this.currentAdmin) {
            console.log('Found current admin in users list:', this.currentAdmin);
          }
        }
        
        this.loading = false;
        
        // Success toast
        if (this.users.length > 0) {
          this.showToast({
            icon: 'success',
            title: `Successfully loaded ${this.users.length} users`,
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
        this.filteredUsers = [];
        
        this.showToast({
          icon: 'error',
          title: 'Failed to load users',
          text: 'Please check your connection and try again',
          background: '#f8d7da',
          color: '#721c24',
          timer: 5000
        });
      }
    });
  }

  // Refresh users with animation
  refreshUsers(): void {
    this.isRefreshing = true;
    this.showLoadingToast('Refreshing user data...');
    
    setTimeout(() => {
      this.loadUsers();
      this.isRefreshing = false;
    }, 1000); // Small delay for better UX
  }

  // Enhanced toast notification system
  private showToast(options: {
    icon: 'success' | 'error' | 'warning' | 'info';
    title: string;
    text?: string;
    background?: string;
    color?: string;
    timer?: number;
  }): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: options.icon,
      title: options.title,
      text: options.text,
      showConfirmButton: false,
      timer: options.timer || 3000,
      timerProgressBar: true,
      background: options.background || '#f8f9fa',
      color: options.color || '#495057',
      customClass: {
        popup: 'animated-toast'
      }
    });
  }

  // Show loading toast
  private showLoadingToast(title: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Check if admin can modify this user (user created after admin)
  canModifyUser(user: User): boolean {
    if (!this.currentAdmin || !this.currentAdmin["RegisteredAt"]) {
      return false;
    }

    if (!user.registeredAt) {
      return false;
    }

    const adminCreationDate = new Date(this.currentAdmin["RegisteredAt"]);
    const userCreationDate = new Date(user.registeredAt);

    return userCreationDate > adminCreationDate;
  }

  // Get tooltip message for disabled buttons
  getDisabledTooltip(user: User): string {
    if (!this.currentAdmin || !this.currentAdmin["RegisteredAt"]) {
      return 'Unable to verify admin permissions';
    }
    
    if (!user.registeredAt) {
      return 'User creation date unavailable - modification restricted';
    }

    const adminCreationDate = new Date(this.currentAdmin["RegisteredAt"]);
    const userCreationDate = new Date(user.registeredAt);

    if (userCreationDate <= adminCreationDate) {
      return `This user was created before you (${new Date(user.registeredAt).toLocaleDateString()}). You can only modify users created after ${adminCreationDate.toLocaleDateString()}.`;
    }

    return 'Modification not allowed';
  }

  // Enhanced search functionality with debouncing
  onSearchChange(event: any): void {
    const value = event.target.value;
    this.searchSubject.next(value);
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.applyAllFilters();
  }

  // Apply search filter
  applySearchFilter(users: User[]): User[] {
    if (!this.searchTerm.trim()) {
      return users;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower) ||
      user.customerId?.toString().includes(searchTermLower)
    );
  }

  // Apply role and status filters
  applyFilters(): void {
    this.applyAllFilters();
  }

  applyRoleStatusFilter(users: User[]): User[] {
    let filtered = users;

    // Apply role filter
    if (this.selectedRoleFilter) {
      filtered = filtered.filter(user => 
        (user.role || '').toLowerCase() === this.selectedRoleFilter.toLowerCase()
      );
    }

    // Apply status filter
    if (this.selectedStatusFilter) {
      filtered = filtered.filter(user => 
        (user.status || '').toLowerCase() === this.selectedStatusFilter.toLowerCase()
      );
    }

    return filtered;
  }

  // Apply sorting
  applySorting(): void {
    this.applyAllFilters();
  }

  // Sort users
  sortUsers(users: User[]): User[] {
    return users.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (this.sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'role':
          aValue = (a.role || '').toLowerCase();
          bValue = (b.role || '').toLowerCase();
          break;
        case 'status':
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
          break;
        case 'registeredAt':
          aValue = new Date(a.registeredAt || 0).getTime();
          bValue = new Date(b.registeredAt || 0).getTime();
          break;
        case 'lastLoginDate':
          aValue = new Date(a.lastLoginDate || 0).getTime();
          bValue = new Date(b.lastLoginDate || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Apply all filters and sorting
  applyAllFilters(): void {
    let filtered = [...this.users];
    
    // Apply search filter
    filtered = this.applySearchFilter(filtered);
    
    // Apply role and status filters
    filtered = this.applyRoleStatusFilter(filtered);
    
    // Apply sorting
    filtered = this.sortUsers(filtered);
    
    this.filteredUsers = filtered;
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRoleFilter = '';
    this.selectedStatusFilter = '';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.applyAllFilters();
    
    this.showToast({
      icon: 'info',
      title: 'Filters cleared',
      text: 'All filters have been reset',
      background: '#f0f9ff',
      color: '#0369a1'
    });
  }

  // Highlight search terms in text
  highlightSearchTerm(text: string): string {
    if (!this.searchTerm.trim() || !text) {
      return text;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    const regex = new RegExp(`(${this.escapeRegExp(searchTermLower)})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  // Escape special regex characters
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Change user role
  changeUserRole(customerId: number, newRole: string): void {
    const user = this.users.find(u => u.customerId === customerId);
    
    if (!user) {
      this.showToast({
        icon: 'error',
        title: 'User not found',
        background: '#f8d7da',
        color: '#721c24'
      });
      return;
    }

    if (!this.canModifyUser(user)) {
      this.showToast({
        icon: 'warning',
        title: 'Access denied',
        text: 'You can only modify users created after you',
        background: '#fff3cd',
        color: '#856404'
      });
      return;
    }

    // Show confirmation dialog
    Swal.fire({
      title: 'Confirm Role Change',
      text: `Are you sure you want to change ${user.name}'s role to ${newRole.toUpperCase()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, change role',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performRoleChange(customerId, newRole);
      }
    });
  }

  private performRoleChange(customerId: number, newRole: string): void {
    this.showLoadingToast('Updating user role...');
    
    this.manageProfilesService.changeUserRole(customerId, newRole).subscribe({
      next: (response: any) => {
        // Update local user data
        const userIndex = this.users.findIndex(u => u.customerId === customerId);
        if (userIndex !== -1) {
          this.users[userIndex].role = newRole;
          this.applyAllFilters();
        }
        
        this.showToast({
          icon: 'success',
          title: 'Role updated successfully',
          text: `User role changed to ${newRole.toUpperCase()}`,
          background: '#d1fae5',
          color: '#065f46'
        });
      },
      error: (error: any) => {
        console.error('Error changing user role:', error);
        this.showToast({
          icon: 'error',
          title: 'Failed to update role',
          text: 'Please try again later',
          background: '#f8d7da',
          color: '#721c24'
        });
      }
    });
  }

  // Change user status (activate/deactivate)
  changeUserStatus(customerId: number): void {
    const user = this.users.find(u => u.customerId === customerId);
    
    if (!user) {
      this.showToast({
        icon: 'error',
        title: 'User not found',
        background: '#f8d7da',
        color: '#721c24'
      });
      return;
    }

    if (!this.canModifyUser(user)) {
      this.showToast({
        icon: 'warning',
        title: 'Access denied',
        text: 'You can only modify users created after you',
        background: '#fff3cd',
        color: '#856404'
      });
      return;
    }

    const isActive = user.userStatus === 1;
    const action = isActive ? 'deactivate' : 'activate';
    const newStatus = isActive ? 0 : 1;

    // Show confirmation dialog
    Swal.fire({
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      text: `Are you sure you want to ${action} ${user.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isActive ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performStatusChange(customerId, newStatus);
      }
    });
  }

  private performStatusChange(customerId: number, newStatus: number): void {
    const action = newStatus === 1 ? 'Activating' : 'Deactivating';
    this.showLoadingToast(`${action} user...`);
    
    this.manageProfilesService.changeUserStatus(customerId).subscribe({
      next: (response: any) => {
        // Update local user data
        const userIndex = this.users.findIndex(u => u.customerId === customerId);
        if (userIndex !== -1) {
          this.users[userIndex].userStatus = newStatus;
          this.users[userIndex].status = newStatus === 1 ? 'active' : 'inactive';
          this.applyAllFilters();
        }
        
        const statusText = newStatus === 1 ? 'activated' : 'deactivated';
        this.showToast({
          icon: 'success',
          title: `User ${statusText} successfully`,
          background: newStatus === 1 ? '#d1fae5' : '#fee2e2',
          color: newStatus === 1 ? '#065f46' : '#991b1b'
        });
      },
      error: (error: any) => {
        console.error('Error changing user status:', error);
        this.showToast({
          icon: 'error',
          title: 'Failed to update status',
          text: 'Please try again later',
          background: '#f8d7da',
          color: '#721c24'
        });
      }
    });
  }
}