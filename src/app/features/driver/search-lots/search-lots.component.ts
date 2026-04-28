import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParkingLotService } from '../../../core/services/api.services';
import { ParkingLot, NearbyLot } from '../../../core/models';

@Component({
  selector: 'app-search-lots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Find Parking 🔍</h1></div>

    <!-- Search by City -->
    <div class="card mb-3">
      <div class="card-header"><h3>Search by City</h3></div>
      <div class="search-bar">
        <input type="text" [(ngModel)]="city" class="form-control" placeholder="Enter city name..." (keyup.enter)="searchByCity()" />
        <button class="btn btn-primary" (click)="searchByCity()" [disabled]="loading">Search</button>
      </div>
    </div>

    <!-- Nearby Lots -->
    <div class="card mb-3">
      <div class="card-header"><h3>Nearby Lots 📍</h3></div>
      <div class="form-row">
        <div class="form-group">
          <label>Latitude</label>
          <input type="number" [(ngModel)]="lat" class="form-control" step="any" placeholder="28.6139" />
        </div>
        <div class="form-group">
          <label>Longitude</label>
          <input type="number" [(ngModel)]="lng" class="form-control" step="any" placeholder="77.2090" />
        </div>
        <div class="form-group">
          <label>Radius (km)</label>
          <select [(ngModel)]="radius" class="form-control">
            <option [value]="1">1 km</option>
            <option [value]="2">2 km</option>
            <option [value]="5">5 km</option>
            <option [value]="10">10 km</option>
          </select>
        </div>
        <div class="form-group align-end">
          <button class="btn btn-primary" (click)="useMyLocation()">📍 Use My Location</button>
          <button class="btn btn-outline ml-1" (click)="searchNearby()">Search</button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <!-- City Results -->
    <div *ngIf="cityResults.length > 0">
      <h3>Lots in "{{ city }}" ({{ cityResults.length }})</h3>
      <div class="lots-grid">
        <div *ngFor="let lot of cityResults" class="lot-card" (click)="viewLot(lot.lotId)">
          <div class="lot-header">
            <h4>{{ lot.name }}</h4>
            <span class="badge" [class]="lot.isOpen ? 'badge-success' : 'badge-danger'">{{ lot.isOpen ? 'Open' : 'Closed' }}</span>
          </div>
          <p class="lot-address">📍 {{ lot.address }}</p>
          <div class="lot-info">
            <span>🕐 {{ lot.openTime }} - {{ lot.closeTime }}</span>
            <span>🅿️ {{ lot.availableSpots }}/{{ lot.totalSpots }} available</span>
          </div>
          <button class="btn btn-primary btn-block mt-2" [disabled]="!lot.isOpen">
            {{ lot.isOpen ? 'Book Now' : 'Currently Closed' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Nearby Results -->
    <div *ngIf="nearbyResults.length > 0">
      <h3>Nearby Lots ({{ nearbyResults.length }} within {{ radius }}km)</h3>
      <div class="lots-grid">
        <div *ngFor="let lot of nearbyResults" class="lot-card" (click)="viewLot(lot.lotId)">
          <div class="lot-header">
            <h4>{{ lot.name }}</h4>
            <span class="badge badge-primary">{{ lot.distanceKm }} km away</span>
          </div>
          <p class="lot-address">📍 {{ lot.address }}, {{ lot.city }}</p>
          <div class="lot-info">
            <span>🕐 {{ lot.openTime }} - {{ lot.closeTime }}</span>
            <span>🅿️ {{ lot.availableSpots }}/{{ lot.totalSpots }} spots</span>
          </div>
          <button class="btn btn-primary btn-block mt-2" [disabled]="!lot.isOpen">
            {{ lot.isOpen ? 'Book Now' : 'Closed' }}
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="searched && cityResults.length === 0 && nearbyResults.length === 0" class="empty-state">
      No parking lots found. Try a different search.
    </div>
  `
})
export class SearchLotsComponent {
  city = ''; lat = 0; lng = 0; radius = 5;
  cityResults: ParkingLot[] = [];
  nearbyResults: NearbyLot[] = [];
  loading = false; error = ''; searched = false;

  constructor(private lotService: ParkingLotService, private router: Router) {}

  searchByCity() {
    if (!this.city.trim()) return;
    this.loading = true; this.searched = true; this.nearbyResults = [];
    this.lotService.searchByCity(this.city).subscribe({
      next: r => { this.loading = false; if (r.success) this.cityResults = r.data; else this.error = r.message; },
      error: () => { this.loading = false; this.error = 'Search failed'; }
    });
  }

  searchNearby() {
    this.loading = true; this.searched = true; this.cityResults = [];
    this.lotService.getNearby(this.lat, this.lng, this.radius).subscribe({
      next: r => { this.loading = false; if (r.success) this.nearbyResults = r.data; },
      error: () => { this.loading = false; this.error = 'Nearby search failed'; }
    });
  }

  useMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.lat = pos.coords.latitude;
        this.lng = pos.coords.longitude;
        this.searchNearby();
      }, () => { this.error = 'Could not get location. Enter manually.'; });
    }
  }

  viewLot(id: number) { this.router.navigate(['/driver/lots', id]); }
}
