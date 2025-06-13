import { Component, OnInit } from '@angular/core';
import { UserAddressService,UserAddress } from '../../../../services/user-address.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-address',
   imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.css']
})

export class UserAddressComponent implements OnInit {
  addressId?: number; // ✅ Allows it to be undefined until assigned
 
  addressForm: FormGroup;
  addresses: UserAddress[] = [];
  customerId: number = 1;  // Replace with actual customer ID from auth
  editingAddressId: number | null = null; // Track the address being edited
  authService: any;

constructor(private addressService: UserAddressService, private fb: FormBuilder,private http: HttpClient, private router : Router) {
    this.addressForm = this.fb.group({

      addressLine1: ['', Validators.required],
      addressLine2: [''],
      landmark: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India', Validators.required] ,// Remove disabled attribute
      postalCode: ['', [Validators.required, Validators.maxLength(10)]],
      isDefault: [false]
    });
  }
ngOnInit(): void {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      this.customerId = parseInt(decoded.CustomerId); // ✅ Set customer ID dynamically
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  } else {
    console.error("User not logged in. Please sign in.");
  }
  this.loadAddresses(); // Fetch addresses from DB

  // Load saved address from local storage for convenience
  const savedAddress = localStorage.getItem('savedAddress');
  if (savedAddress) {
    this.addressForm.patchValue(JSON.parse(savedAddress)); // Autofill form with saved data
  } else {
    // Check if the user has a default address in the database
    this.addressService.getAddresses(this.customerId).subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          this.addressForm.patchValue(defaultAddress);
          localStorage.setItem('savedAddress', JSON.stringify(defaultAddress)); // Store locally
        }
      },
      error: (error) => console.error('Error fetching addresses:', error)
    });
  }
}



  loadAddresses(): void {
    this.addressService.getAddresses(this.customerId).subscribe({
      next: (addresses) => this.addresses = addresses,
      error: (error) => console.error('Error fetching addresses:', error)
    });
  }
autofillCityAndState(): void {
  const postalCode = this.addressForm.get('postalCode')?.value;

  if (postalCode.length === 6) { // Ensure full postal code is entered
    this.http.get<{ Message: string; Status: string; PostOffice: Array<{ District: string; State: string }> }[]>(
      `https://api.postalpincode.in/pincode/${postalCode}`
    ).subscribe((response) => {
      if (response[0]?.Status === 'Success' && response[0]?.PostOffice?.length) {
        const city = response[0].PostOffice[0].District;
        const state = response[0].PostOffice[0].State;
        this.addressForm.patchValue({ city, state }); // Autofill both city and state
      } else {
        alert('Invalid postal code or no data found.');
      }
    });
  } else if (postalCode.length === 0) { // Reset city and state when postal code is cleared
    this.addressForm.patchValue({ city: '', state: '' });
  }
}



saveAddress(): void {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      const customerId =parseInt(decoded.CustomerId); // Extract CustomerId

     console.log("Extracted CustomerId:", customerId);

      if (this.addressForm.valid && customerId) {
        const address: UserAddress = {
          ...this.addressForm.value,
          customerId: customerId // Use extracted customer ID
        };

         console.log("Sending Address Data:", JSON.stringify(address)); // Debugging log
    if (address.isDefault) {
      localStorage.setItem('defaultAddress', JSON.stringify(address)); // Store default address
    }
        if (this.editingAddressId) {
          this.addressService.updateAddress(this.editingAddressId, address).subscribe({
            next: () => {
              this.loadAddresses();
              alert('Address updated successfully!');
              this.addressForm.reset();
              this.editingAddressId = null;
            },
            error: (error) => console.error('Error updating address:', error)
          });
        } else {
          this.addressService.addAddress(address).subscribe({
            next: () => {
              this.loadAddresses();
              alert('Address saved successfully!');
              localStorage.setItem('savedAddress', JSON.stringify(address));
              this.addressForm.reset();
            },
            error: (error) => console.error('Error saving address:', error)
          });
        }
      } else {
        alert("Customer ID not found in token.");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      alert("Invalid or expired token.");
    }
  } else {
    alert("User not logged in. Please sign in.");
  }
}



removeAddress(addressId: number): void {
  if (confirm('Are you sure you want to delete this address?')) {
    this.addressService.removeAddress(addressId).subscribe({
      next: () => {
        // ✅ Corrected frontend filter from customerId to addressId
        this.addresses = this.addresses.filter(addr => addr.addressId !== addressId);
        
        // ✅ Ensure deleted saved address is removed from localStorage
        const savedAddress = localStorage.getItem('savedAddress');
        if (savedAddress) {
          const savedAddressObj: UserAddress = JSON.parse(savedAddress);
          if (savedAddressObj.addressId === addressId) {
            localStorage.removeItem('savedAddress');
          }
        }

        alert('Address removed successfully!');
      },
      error: (error) => console.error('❌ Error removing address:', error)
    });
  }
}

  editAddress(address: UserAddress): void {
    this.editingAddressId = address.customerId;
    this.addressForm.patchValue(address);
  }
  cancelEdit(): void {
  this.editingAddressId = null; // Reset edit mode
  this.addressForm.reset(); // Clear the form
}


selectAddress(address: UserAddress): void {
  this.addressForm.patchValue(address); // Autofill the form
  localStorage.setItem('selectedAddress', JSON.stringify(address)); // Store the selected address
  this.router.navigate(['/cart']); // Redirect to view-cart component
}

  placeOrder(): void {
    if (this.addresses.length === 0) {
      alert('Please provide an address first!');
    } else {
      alert('Order placed successfully!');
    }
  }
}

