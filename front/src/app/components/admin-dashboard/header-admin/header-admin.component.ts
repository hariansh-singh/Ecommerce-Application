import { Component, inject, OnInit, HostListener, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-20px)'
      })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1'
      })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class HeaderAdminComponent implements OnInit, AfterViewInit {
  userData: any;
  authService = inject(AuthService);
  router = inject(Router);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  
  isScrolled = false;
  menuState = 'collapsed';
  activeLink = '/admindashboard';

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
    if (this.isScrolled) {
      this.renderer.addClass(this.el.nativeElement.querySelector('.glass-navbar'), 'scrolled');
    } else {
      this.renderer.removeClass(this.el.nativeElement.querySelector('.glass-navbar'), 'scrolled');
    }
  }

  ngOnInit(): void {
    let _token: any = this.authService.getToken();
    this.userData = jwtDecode(_token);
    this.activeLink = this.router.url;
    
    // Initialize animations for menu items with delay
    setTimeout(() => {
      this.animateMenuItems();
    }, 500);
  }

  ngAfterViewInit(): void {
    // Add ripple effect to buttons
    this.setupRippleEffect();
  }

  setupRippleEffect() {
    const buttons = this.el.nativeElement.querySelectorAll('.exit-button, .menu-link');
    
    buttons.forEach((button: HTMLElement) => {
      this.renderer.listen(button, 'click', (event) => {
        const ripple = this.renderer.createElement('span');
        const rect = button.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.renderer.addClass(ripple, 'ripple');
        this.renderer.setStyle(ripple, 'top', `${y}px`);
        this.renderer.setStyle(ripple, 'left', `${x}px`);
        
        this.renderer.appendChild(button, ripple);
        
        setTimeout(() => {
          this.renderer.removeChild(button, ripple);
        }, 600);
      });
    });
  }

  animateMenuItems() {
    const menuItems = this.el.nativeElement.querySelectorAll('.nav-item');
    
    menuItems.forEach((item: HTMLElement, index: number) => {
      setTimeout(() => {
        this.renderer.addClass(item, 'animated');
      }, index * 100);
    });
  }

  toggleMenu() {
    this.menuState = this.menuState === 'collapsed' ? 'expanded' : 'collapsed';
  }

  setActiveLink(path: string) {
    this.activeLink = path;
  }

  redirectToHome() {
    // Add exit animation
    const navbar = this.el.nativeElement.querySelector('.glass-navbar');
    this.renderer.addClass(navbar, 'exit-animation');
    
    // Delay navigation to allow animation to complete
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 300);
  }
  
  // Get shortened user name for responsive display
  getShortenedName(): string {
    if (!this.userData?.["FullName"]) return '';
    
    const fullName = this.userData["FullName"];
    if (fullName.length <= 15) return fullName;
    
    const names = fullName.split(' ');
    if (names.length > 1) {
      return `${names[0]} ${names[names.length-1].charAt(0)}.`;
    }
    
    return fullName.substring(0, 15) + '...';
  }
}