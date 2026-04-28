import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  private paymentUrl = `${environment.paymentUrl}/payments`;

  constructor(private http: HttpClient) {}

  createOrder(amount: number, receipt: string): Observable<any> {
    console.log('📋 Creating Razorpay order:', { amount, receipt, paymentUrl: this.paymentUrl });
    return this.http.post(`${this.paymentUrl}/create-order`, {
      amount,
      receipt
    });
  }

  processPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.paymentUrl}/process`, paymentData);
  }

  openRazorpayCheckout(order: any, bookingId: number): Promise<any> {
    console.log('🔪 Initializing Razorpay checkout with order:', order);
    
    return new Promise((resolve, reject) => {
      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        console.error('❌ Razorpay SDK not loaded');
        reject(new Error('Razorpay SDK not loaded. Please check your internet connection.'));
        return;
      }

      const options = {
        key: 'rzp_test_SiRpuNKvp8UlQJ', // Test key ID
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'ParkEase',
        description: `Parking fee for Booking #${bookingId}`,
        order_id: order.id,
        handler: (response: any) => {
          console.log('✅ Razorpay payment successful:', response);
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Razorpay modal dismissed');
            reject(new Error('Payment cancelled by user'));
          },
          escape: false,
          backdropclose: false
        },
        prefill: {
          contact: '',
          email: ''
        },
        theme: {
          color: '#3399cc'
        },
        notes: {
          booking_id: bookingId.toString()
        }
      };

      console.log('🚀 Opening Razorpay modal...');
      try {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error('❌ Error opening Razorpay modal:', error);
        reject(new Error('Failed to open payment modal: ' + (error as Error).message));
      }
    });
  }
}
