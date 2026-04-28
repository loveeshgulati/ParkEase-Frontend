import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, PaymentService } from '../../../core/services/api.services';
import { RazorpayService } from '../../../core/services/razorpay.service';
import { Booking } from '../../../core/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>My Bookings 📋</h1>
    </div>

    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <!-- Filter Tabs -->
    <div class="tab-bar mb-3">
      <button class="tab-btn" [class.active]="activeTab === 'all'" (click)="setTab('all')">All</button>
      <button class="tab-btn" [class.active]="activeTab === 'active'" (click)="setTab('active')">Active</button>
      <button class="tab-btn" [class.active]="activeTab === 'reserved'" (click)="setTab('reserved')">Reserved</button>
      <button class="tab-btn" [class.active]="activeTab === 'completed'" (click)="setTab('completed')">Completed</button>
      <button class="tab-btn" [class.active]="activeTab === 'cancelled'" (click)="setTab('cancelled')">Cancelled</button>
    </div>

    <div class="bookings-list">
      <div *ngFor="let b of filteredBookings" class="booking-card">
        <div class="booking-header">
          <span class="booking-id">#{{ b.bookingId }}</span>
          <span class="badge" [class]="getStatusClass(b.status)">{{ b.status }}</span>
        </div>

        <div class="booking-body">
          <div class="booking-row">
            <span>🚗 Plate</span><span><strong>{{ b.vehiclePlate }}</strong></span>
          </div>
          <div class="booking-row">
            <span>🅿️ Spot</span><span>Spot #{{ b.spotId }}</span>
          </div>
          <div class="booking-row">
            <span>📅 From</span><span>{{ b.startTime | date:'medium' }}</span>
          </div>
          <div class="booking-row">
            <span>📅 To</span><span>{{ b.endTime | date:'medium' }}</span>
          </div>
          <div class="booking-row" *ngIf="b.checkInTime">
            <span>✅ Check-in</span><span>{{ b.checkInTime | date:'medium' }}</span>
          </div>
          <div class="booking-row" *ngIf="b.checkOutTime">
            <span>🏁 Check-out</span><span>{{ b.checkOutTime | date:'medium' }}</span>
          </div>
          <div class="booking-row" *ngIf="b.totalAmount > 0">
            <span>💰 Amount</span><span><strong>₹{{ b.totalAmount }}</strong></span>
          </div>
          <div class="booking-row" *ngIf="b.cancellationReason">
            <span>❌ Reason</span><span>{{ b.cancellationReason }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="booking-actions">
          <button class="btn btn-sm btn-success" *ngIf="b.status === 'RESERVED'" (click)="checkIn(b.bookingId)">
            ✅ Check In
          </button>
          <button class="btn btn-sm btn-primary" *ngIf="b.status === 'ACTIVE'" (click)="checkOut(b.bookingId)">
            🏁 Check Out
          </button>
          <button class="btn btn-sm btn-warning" *ngIf="b.status === 'RESERVED' || b.status === 'ACTIVE'" (click)="openExtend(b)">
            ⏱️ Extend
          </button>
          <button class="btn btn-sm btn-danger" *ngIf="b.status === 'RESERVED'" (click)="cancel(b.bookingId)">
            ❌ Cancel
          </button>
        </div>
      </div>

      <div class="empty-state" *ngIf="filteredBookings.length === 0">
        No bookings found for "{{ activeTab }}"
      </div>
    </div>

    <!-- Extend Modal -->
    <div class="modal-overlay" *ngIf="showExtendModal" (click)="showExtendModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Extend Booking #{{ extendBookingId }}</h3>
        <div class="form-group">
          <label>New End Time</label>
          <input type="datetime-local" [(ngModel)]="newEndTime" class="form-control" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" (click)="confirmExtend()">Extend</button>
          <button class="btn btn-outline" (click)="showExtendModal = false">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  activeTab = 'all';
  msg = ''; error = '';
  showExtendModal = false;
  extendBookingId = 0;
  newEndTime = '';

  constructor(
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private razorpayService: RazorpayService
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.bookingService.getMyBookings().subscribe(r => {
      if (r.success) { this.bookings = r.data; this.setTab(this.activeTab); }
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'all') this.filteredBookings = this.bookings;
    else this.filteredBookings = this.bookings.filter(b => b.status.toLowerCase() === tab);
  }

  checkIn(id: number) {
    this.bookingService.checkIn(id).subscribe(r => {
      if (r.success) { this.msg = 'Checked in successfully! ✅'; this.load(); }
      else this.error = r.message;
    });
  }

  async checkOut(id: number) {
    console.log('🚀 Starting checkout for booking:', id);
    this.error = '';
    
    try {
      // Get booking details to calculate amount
      const booking = this.bookings.find(b => b.bookingId === id);
      if (!booking) {
        this.error = 'Booking not found';
        console.error('❌ Booking not found:', id);
        return;
      }

      // Calculate actual fare based on booking duration and spot rate
      console.log('💰 Calculating fare for booking:', id);
      this.bookingService.getFare(id).subscribe({
        next: (fareResponse) => {
          if (fareResponse.success) {
            const amount = fareResponse.data.totalAmount;
            console.log('💰 Calculated amount:', amount);
            this.proceedWithPayment(id, amount);
          } else {
            this.error = fareResponse.message;
            console.error('❌ Fare calculation failed:', fareResponse.message);
          }
        },
        error: (err) => {
          this.error = 'Failed to calculate fare: ' + err.message;
          console.error('❌ Fare calculation error:', err);
        }
      });
    } catch (error) {
      this.error = 'Checkout failed: ' + (error as Error).message;
      console.error('❌ Checkout error:', error);
    }
  }

  proceedWithPayment(id: number, amount: number) {
    console.log('💳 Proceeding with payment for booking:', id, 'amount:', amount);
    
    // Create Razorpay order
    console.log('📋 Creating Razorpay order...');
    this.razorpayService.createOrder(amount, `checkout_${id}`).subscribe({
      next: async (orderResponse) => {
        console.log('📦 Order response:', orderResponse);
        if (orderResponse.success) {
          try {
            console.log('🔪 Opening Razorpay checkout...');
            // Check if Razorpay is available
            if (typeof (window as any).Razorpay === 'undefined') {
              this.error = 'Razorpay not loaded. Please refresh the page.';
              console.error('❌ Razorpay not loaded');
              return;
            }

            // Open Razorpay checkout
            const paymentResponse = await this.razorpayService.openRazorpayCheckout(
              orderResponse.data, 
              id
            );
            console.log('💳 Payment response:', paymentResponse);

            // Process payment after successful Razorpay payment
            console.log('⚙️ Processing payment...');
            const paymentRequest = {
              bookingId: id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              mode: 'CARD',
              amount: amount,
              description: `Parking fee for Booking #${id}`
            };
            console.log('📤 Payment request:', paymentRequest);
            
            this.paymentService.processPayment(paymentRequest).subscribe({
              next: (paymentResult) => {
                console.log('✅ Payment result:', paymentResult);
                if (paymentResult.success) {
                  console.log('💰 Payment processed successfully, checking for notifications...');
                  // Trigger a notification refresh
                  setTimeout(() => {
                    console.log('🔄 Refreshing notifications...');
                    // This will trigger real-time notification if SignalR is working
                  }, 1000);
                  
                  // Payment successful, now complete checkout
                  console.log('🏁 Completing checkout...');
                  this.bookingService.checkOut(id).subscribe(r => {
                    if (r.success) { 
                      this.msg = `Checked out! Total: ₹${r.data.totalAmount}`; 
                      this.load(); 
                    }
                    else this.error = r.message;
                  });
                } else {
                  this.error = paymentResult.message;
                  console.error('❌ Payment failed:', paymentResult.message);
                }
              },
              error: (err) => {
                this.error = 'Payment processing failed: ' + err.message;
                console.error('❌ Payment processing error:', err);
              }
            });
          } catch (error) {
            this.error = 'Payment cancelled or failed: ' + (error as Error).message;
            console.error('❌ Payment error:', error);
          }
        } else {
          this.error = orderResponse.message;
          console.error('❌ Order creation failed:', orderResponse.message);
        }
      },
      error: (err) => {
        this.error = 'Failed to create payment order: ' + err.message;
        console.error('❌ Order creation error:', err);
      }
    });
  }

  cancel(id: number) {
    if (confirm('Cancel this booking?')) {
      this.bookingService.cancelBooking(id, 'Cancelled by user').subscribe(r => {
        if (r.success) { this.msg = 'Booking cancelled'; this.load(); }
        else this.error = r.message;
      });
    }
  }

  
  
  openExtend(booking: Booking) {
    this.extendBookingId = booking.bookingId;
    this.newEndTime = booking.endTime.slice(0, 16);
    this.showExtendModal = true;
  }

  confirmExtend() {
    this.bookingService.extendBooking(this.extendBookingId, new Date(this.newEndTime).toISOString()).subscribe(r => {
      if (r.success) { this.msg = 'Booking extended!'; this.showExtendModal = false; this.load(); }
      else this.error = r.message;
    });
  }

  getStatusClass(s: string) {
    return {
      'badge-success': s === 'COMPLETED',
      'badge-primary': s === 'ACTIVE',
      'badge-warning': s === 'RESERVED',
      'badge-danger': s === 'CANCELLED' || s === 'EXPIRED'
    };
  }
}
