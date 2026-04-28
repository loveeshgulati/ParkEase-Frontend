import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/api.services';
import { Payment } from '../../../core/models';

@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>My Payments 💳</h1></div>

    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <!-- Manual Payment Form -->
    <div class="card mb-3" *ngIf="showPayForm">
      <div class="card-header"><h3>Process Payment for Booking #{{ payBookingId }}</h3></div>
      <form (ngSubmit)="processPayment()">
        <div class="form-group">
          <label>Payment Mode</label>
          <select [(ngModel)]="payMode" name="payMode" class="form-control">
            <option value="CARD">Card</option>
            <option value="UPI">UPI</option>
            <option value="WALLET">Wallet</option>
            <option value="CASH">Cash</option>
          </select>
        </div>
        <div class="form-group">
          <label>Amount (₹)</label>
          <input type="number" [(ngModel)]="payAmount" name="payAmount" class="form-control" readonly />
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Processing...' : 'Pay Now' }}
          </button>
          <button type="button" class="btn btn-outline" (click)="showPayForm = false">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Receipt Modal -->
    <div class="modal-overlay" *ngIf="showReceipt" (click)="showReceipt = false">
      <div class="modal receipt-modal" (click)="$event.stopPropagation()">
        <pre class="receipt-text">{{ receiptText }}</pre>
        <button class="btn btn-outline btn-block" (click)="showReceipt = false">Close</button>
      </div>
    </div>

    <!-- Payments List -->
    <div class="payments-list">
      <div *ngFor="let p of payments" class="payment-card">
        <div class="payment-header">
          <span class="payment-id">Payment #{{ p.paymentId }}</span>
          <span class="badge" [class]="getStatusClass(p.status)">{{ p.status }}</span>
        </div>
        <div class="payment-body">
          <div class="payment-row">
            <span>Booking</span><span>#{{ p.bookingId }}</span>
          </div>
          <div class="payment-row">
            <span>Amount</span><span><strong>₹{{ p.amount }}</strong></span>
          </div>
          <div class="payment-row">
            <span>Mode</span><span>{{ p.mode }}</span>
          </div>
          <div class="payment-row" *ngIf="p.razorpayPaymentId">
            <span>Txn ID</span><span class="text-mono">{{ p.razorpayPaymentId }}</span>
          </div>
          <div class="payment-row" *ngIf="p.paidAt">
            <span>Paid At</span><span>{{ p.paidAt | date:'medium' }}</span>
          </div>
          <div class="payment-row" *ngIf="p.refundAmount">
            <span>Refund</span><span class="text-success">₹{{ p.refundAmount }}</span>
          </div>
        </div>
        <div class="payment-actions">
          <button class="btn btn-sm btn-primary" *ngIf="p.status === 'PENDING'" (click)="openPayForm(p)">
            💳 Pay Now
          </button>
          <button class="btn btn-sm btn-outline" *ngIf="p.status === 'PAID'" (click)="viewReceipt(p.paymentId)">
            🧾 Receipt
          </button>
          <button class="btn btn-sm btn-warning" *ngIf="p.status === 'PAID'" (click)="requestRefund(p.paymentId)">
            💸 Refund
          </button>
        </div>
      </div>

      <div class="empty-state" *ngIf="payments.length === 0">
        No payment records found.
      </div>
    </div>
  `
})
export class MyPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  showPayForm = false; loading = false; msg = ''; error = '';
  payBookingId = 0; payAmount = 0; payMode = 'CARD';
  showReceipt = false; receiptText = '';

  constructor(private paymentService: PaymentService) {}

  ngOnInit() { this.load(); }

  load() {
    this.paymentService.getMyPayments().subscribe(r => { if (r.success) this.payments = r.data; });
  }

  openPayForm(payment: Payment) {
    this.payBookingId = payment.bookingId;
    this.payAmount = payment.amount;
    this.showPayForm = true;
  }

  processPayment() {
    this.loading = true; this.error = '';
    const req = {
      bookingId: this.payBookingId,
      razorpayOrderId: 'manual_order_' + Date.now(),
      razorpayPaymentId: 'manual_pay_' + Date.now(),
      razorpaySignature: 'manual',
      mode: this.payMode,
      amount: this.payAmount,
      description: `Manual payment for booking #${this.payBookingId}`
    };
    this.paymentService.processPayment(req).subscribe({
      next: r => {
        this.loading = false;
        if (r.success) { this.msg = `Payment of ₹${r.data.amount} successful!`; this.showPayForm = false; this.load(); }
        else this.error = r.message;
      },
      error: err => { this.loading = false; this.error = err.error?.message || 'Payment failed'; }
    });
  }

  viewReceipt(id: number) {
    this.paymentService.getReceipt(id).subscribe(r => {
      if (r.success) { this.receiptText = r.data; this.showReceipt = true; }
    });
  }

  requestRefund(id: number) {
    const reason = prompt('Reason for refund:');
    if (!reason) return;
    this.paymentService.refundPayment(id, reason).subscribe(r => {
      if (r.success) { this.msg = `Refund of ₹${r.data.refundAmount} processed`; this.load(); }
      else this.error = r.message;
    });
  }

  getStatusClass(s: string) {
    return { 'badge-success': s === 'PAID', 'badge-warning': s === 'PENDING', 'badge-danger': s === 'FAILED', 'badge-primary': s === 'REFUNDED' };
  }
}
