import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer-admin',
  templateUrl: './footer-admin.component.html',
  styleUrls: ['./footer-admin.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FooterAdminComponent {
  currentYear: number = new Date().getFullYear();
  
  // For newsletter subscription functionality
  email: string = '';
  
  // Animation controller
  isVisible: boolean = false;
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Check if footer is in viewport to trigger animations
    const footer = document.querySelector('.footer');
    if (footer) {
      const rect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        this.isVisible = true;
      }
    }
  }
  
  subscribeToNewsletter() {
    // Here you would implement actual newsletter subscription logic
    if (this.email && this.validateEmail(this.email)) {
      console.log('Subscribing email:', this.email);
      alert('Thank you for subscribing!');
      this.email = '';
    } else {
      alert('Please enter a valid email address');
    }
  }
  
  validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }
}