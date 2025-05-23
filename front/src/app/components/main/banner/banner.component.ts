import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  imageUrl: string;
  imageAlt: string;
  badge: {
    text: string;
    type: string;
  };
  features: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  bgClass: string;
}

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit, OnDestroy {
  currentSlide: number = 0;
  isPlaying: boolean = true;
  progressWidth: number = 0;

  router = inject(Router);

  private readonly SLIDE_DURATION = 2500;
  private readonly PROGRESS_UPDATE_RATE = 25;
  
  private autoPlayInterval?: number;
  private progressInterval?: number;

  slides: SlideData[] = [
    {
      id: 'iphone-16-pro',
      title: 'iPhone 16 Pro',
      subtitle: 'Innovation at Your Fingertips',
      description: 'Discover the perfect blend of elegance and technology. With Super Retina display, triple-camera system, and Face ID, every moment becomes extraordinary.',
      originalPrice: 136999,
      salePrice: 112999,
      discount: 21,
      imageUrl: 'iphone_16_pro.png',
      imageAlt: 'iPhone XS',
      badge: { text: 'PREMIUM', type: 'premium' },
      features: ['Express Delivery', 'AppleCare+', 'Trade-in Available'],
      ctaPrimary: 'Buy Now',  
      ctaSecondary: 'Compare Models',
      bgClass: 'slide-iphone'
    },
    {
      id: 'hp-pavilion',
      title: 'HP Pavilion Gaming',
      subtitle: 'Power Meets Performance',
      description: 'Experience ultimate gaming performance with Intel Core i7, RTX 3060, and lightning-fast SSD storage. Built for creators and gamers who demand excellence.',
      originalPrice: 129349,
      salePrice: 99999,
      discount: 23,
      imageUrl: 'https://i.imgur.com/iDwDQ4o.png',
      imageAlt: 'HP Pavilion Gaming Laptop',
      badge: { text: 'NEW ARRIVAL', type: 'new' },
      features: ['Free Shipping', '2-Year Warranty', '30-Day Returns'],
      ctaPrimary: 'Shop Now',
      ctaSecondary: 'Learn More',
      bgClass: 'slide-hp'
    },
    {
      id: 'macbook-pro',
      title: 'MacBook Pro M2',
      subtitle: 'Supercharged for Pros',
      description: 'Revolutionary M2 chip delivers incredible performance and battery life. Perfect for developers, designers, and creative professionals who push boundaries.',
      originalPrice: 215999,
      salePrice: 169900,
      discount: 15,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop',
      imageAlt: 'MacBook Pro M2',
      badge: { text: 'PRO SERIES', type: 'pro' },
      features: ['Free Engraving', 'Student Discount', '0% Financing'],
      ctaPrimary: 'Order Now',
      ctaSecondary: 'Customize',
      bgClass: 'slide-macbook'
    }
  ];

  ngOnInit(): void {
    this.startAutoPlay();
    this.startProgressTimer();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.stopProgressTimer();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.resetProgress();
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.resetProgress();
  }

  goToSlide(index: number): void {
    if (index !== this.currentSlide) {
      this.currentSlide = index;
      this.resetProgress();
    }
  }

  pauseCarousel(): void {
    this.isPlaying = false;
    this.stopAutoPlay();
    this.stopProgressTimer();
  }

  resumeCarousel(): void {
    this.isPlaying = true;
    this.startAutoPlay();
    this.startProgressTimer();
  }

  handlePrimaryAction(slide: SlideData): void {
    if(slide.title === 'iPhone 16 Pro') {
      this.router.navigate(['product/1']);
    }
    else if(slide.title === 'HP Pavilion Gaming') {
      Swal.fire({
        title: 'Product Unavailable',
        text: 'This product is currently unavailable.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
    else if(slide.title === 'MacBook Pro M2') {
      this.router.navigate(['product/3']);
    }
  }

  handleSecondaryAction(slide: SlideData): void {
    console.log(`Secondary action clicked for ${slide.title}`);
    Swal.fire({
      title: 'Feature Coming Soon',
      text: 'This feature is not yet available.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  private startAutoPlay(): void {
    if (!this.isPlaying) return;

    this.autoPlayInterval = window.setInterval(() => {
      this.nextSlide();
    }, this.SLIDE_DURATION);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = undefined;
    }
  }

  private startProgressTimer(): void {
    if (!this.isPlaying) return;

    const progressIncrement = 100 / (this.SLIDE_DURATION / this.PROGRESS_UPDATE_RATE);
    
    this.progressInterval = window.setInterval(() => {
      this.progressWidth = Math.min(this.progressWidth + progressIncrement, 100);
      
      if (this.progressWidth >= 100) {
        this.progressWidth = 0;
      }
    }, this.PROGRESS_UPDATE_RATE);
  }

  private stopProgressTimer(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }

  private resetProgress(): void {
    this.progressWidth = 0;
    if (this.isPlaying) {
      this.stopProgressTimer();
      this.startProgressTimer();
    }
  }
}