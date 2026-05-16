import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, Vehicle, RegisterVehicleRequest, ParkingLot, NearbyLot,
  CreateLotRequest, Spot, AddSpotRequest, BulkAddSpotRequest, Booking,
  CreateBookingRequest, FareCalculation, Payment, ProcessPaymentRequest,
  Notification, ManagerDto, DriverDto, PendingManagerDto, UserProfile
} from '../models';

// ─── Vehicle Service ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly url = `${environment.vehicleUrl}/vehicles`;
  constructor(private readonly http: HttpClient) {}

  getMyVehicles() { return this.http.get<ApiResponse<Vehicle[]>>(`${this.url}/my-vehicles`); }
  registerVehicle(req: RegisterVehicleRequest) { return this.http.post<ApiResponse<Vehicle>>(this.url, req); }
  updateVehicle(id: number, req: any) { return this.http.put<ApiResponse<Vehicle>>(`${this.url}/${id}`, req); }
  deleteVehicle(id: number) { return this.http.delete<ApiResponse<any>>(`${this.url}/${id}`); }
  getAllVehicles() { return this.http.get<ApiResponse<Vehicle[]>>(`${this.url}/all`); }
}

// ─── ParkingLot Service ───────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ParkingLotService {
  private readonly url = `${environment.parkingLotUrl}/lots`;
  constructor(private readonly http: HttpClient) {}

  searchByCity(city: string) { return this.http.get<ApiResponse<ParkingLot[]>>(`${this.url}/search`, { params: { city } }); }
  getNearby(lat: number, lng: number, radius = 5) { return this.http.get<ApiResponse<NearbyLot[]>>(`${this.url}/nearby`, { params: { lat, lng, radius } }); }
  getLotById(id: number) { return this.http.get<ApiResponse<ParkingLot>>(`${this.url}/${id}`); }
  getMyLots() { return this.http.get<ApiResponse<ParkingLot[]>>(`${this.url}/my-lots`); }
  getAllLots() { return this.http.get<ApiResponse<ParkingLot[]>>(`${this.url}/all`); }
  getPendingLots() { return this.http.get<ApiResponse<ParkingLot[]>>(`${this.url}/pending`); }
  createLot(req: CreateLotRequest) { return this.http.post<ApiResponse<ParkingLot>>(this.url, req); }
  updateLot(id: number, req: any) { return this.http.put<ApiResponse<ParkingLot>>(`${this.url}/${id}`, req); }
  deleteLot(id: number) { return this.http.delete<ApiResponse<any>>(`${this.url}/${id}`); }
  toggleLot(id: number) { return this.http.put<ApiResponse<ParkingLot>>(`${this.url}/${id}/toggle`, {}); }
  approveLot(id: number) { return this.http.put<ApiResponse<ParkingLot>>(`${this.url}/${id}/approve`, {}); }
  rejectLot(id: number, reason: string) { return this.http.put<ApiResponse<ParkingLot>>(`${this.url}/${id}/reject`, { reason }); }
  getLotsByManager(managerId: number) { return this.http.get<ApiResponse<ParkingLot[]>>(`${this.url}/manager/${managerId}`); }
}

// ─── Spot Service ─────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SpotService {
  private readonly url = `${environment.spotUrl}/spots`;
  constructor(private readonly http: HttpClient) {}

  getSpotsByLot(lotId: number) { return this.http.get<ApiResponse<Spot[]>>(`${this.url}/lot/${lotId}`); }
  getAvailableSpots(lotId: number) { return this.http.get<ApiResponse<Spot[]>>(`${this.url}/lot/${lotId}/available`); }
  getSpotById(id: number) { return this.http.get<ApiResponse<Spot>>(`${this.url}/${id}`); }
  addSpot(req: AddSpotRequest) { return this.http.post<ApiResponse<Spot>>(this.url, req); }
  addBulkSpots(req: BulkAddSpotRequest) { return this.http.post<ApiResponse<any>>(`${this.url}/bulk`, req); }
  updateSpot(id: number, req: any) { return this.http.put<ApiResponse<Spot>>(`${this.url}/${id}`, req); }
  deleteSpot(id: number) { return this.http.delete<ApiResponse<any>>(`${this.url}/${id}`); }
}

// ─── Booking Service ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly url = `${environment.bookingUrl}/bookings`;
  constructor(private readonly http: HttpClient) {}

  createBooking(req: CreateBookingRequest) { return this.http.post<ApiResponse<Booking>>(this.url, req); }
  getMyBookings() { return this.http.get<ApiResponse<Booking[]>>(`${this.url}/my-bookings`); }
  getBookingById(id: number) { return this.http.get<ApiResponse<Booking>>(`${this.url}/${id}`); }
  cancelBooking(id: number, reason?: string) { return this.http.put<ApiResponse<Booking>>(`${this.url}/${id}/cancel`, { reason }); }
  checkIn(id: number) { return this.http.put<ApiResponse<Booking>>(`${this.url}/${id}/checkin`, {}); }
  checkOut(id: number) { return this.http.put<ApiResponse<Booking>>(`${this.url}/${id}/checkout`, {}); }
  extendBooking(id: number, newEndTime: string) { return this.http.put<ApiResponse<Booking>>(`${this.url}/${id}/extend`, { newEndTime }); }
  getFare(id: number) { return this.http.get<ApiResponse<FareCalculation>>(`${this.url}/${id}/fare`); }
  getBookingsByLot(lotId: number) { return this.http.get<ApiResponse<Booking[]>>(`${this.url}/lot/${lotId}`); }
  getActiveBookingsByLot(lotId: number) { return this.http.get<ApiResponse<Booking[]>>(`${this.url}/lot/${lotId}/active`); }
  forceCheckout(id: number) { return this.http.put<ApiResponse<Booking>>(`${this.url}/${id}/force-checkout`, {}); }
  getAllBookings() { return this.http.get<ApiResponse<Booking[]>>(`${this.url}/all`); }
}

// ─── Payment Service ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly url = `${environment.paymentUrl}/payments`;
  constructor(private readonly http: HttpClient) {}

  processPayment(req: ProcessPaymentRequest) { return this.http.post<ApiResponse<Payment>>(`${this.url}/process`, req); }
  getMyPayments() { return this.http.get<ApiResponse<Payment[]>>(`${this.url}/my-payments`); }
  getPaymentById(id: number) { return this.http.get<ApiResponse<Payment>>(`${this.url}/${id}`); }
  getPaymentByBooking(bookingId: number) { return this.http.get<ApiResponse<Payment>>(`${this.url}/booking/${bookingId}`); }
  refundPayment(paymentId: number, reason: string) { return this.http.post<ApiResponse<Payment>>(`${this.url}/refund`, { paymentId, reason }); }
  getReceipt(id: number) { return this.http.get<ApiResponse<string>>(`${this.url}/${id}/receipt`); }
  getAllPayments() { return this.http.get<ApiResponse<Payment[]>>(`${this.url}/all`); }
  getPlatformRevenue(from: string, to: string) { return this.http.get<ApiResponse<any>>(`${this.url}/platform/revenue`, { params: { from, to } }); }
  getRevenueByLot(lotId: number, from: string, to: string) { return this.http.get<ApiResponse<any>>(`${this.url}/revenue/${lotId}`, { params: { from, to } }); }
}

// ─── Notification Service ─────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly url = `${environment.notificationUrl}/notifications`;
  constructor(private readonly http: HttpClient) {}

  getMyNotifications() { return this.http.get<ApiResponse<Notification[]>>(`${this.url}`); }
  getUnreadCount() { return this.http.get<ApiResponse<number>>(`${this.url}/unread-count`); }
  markAsRead(id: number) { return this.http.put<ApiResponse<any>>(`${this.url}/${id}/read`, {}); }
  markAllRead() { return this.http.put<ApiResponse<any>>(`${this.url}/read-all`, {}); }
  deleteNotification(id: number) { return this.http.delete<ApiResponse<any>>(`${this.url}/${id}`); }
}

// ─── Admin Service ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly url = `${environment.authUrl}/admin`;
  constructor(private readonly http: HttpClient) {
    console.log('AdminService: Initialized with URL:', this.url);
    console.log('AdminService: Environment authUrl:', environment.authUrl);
  }

  // Managers
  getPendingManagers() { 
    console.log('AdminService: getPendingManagers called, URL:', `${this.url}/managers/pending`);
    return this.http.get<ApiResponse<PendingManagerDto[]>>(`${this.url}/managers/pending`); 
  }
  getAllManagers() { 
    console.log('AdminService: getAllManagers called, URL:', `${this.url}/managers`);
    return this.http.get<ApiResponse<ManagerDto[]>>(`${this.url}/managers`); 
  }
  approveManager(id: number) { return this.http.put<ApiResponse<any>>(`${this.url}/managers/${id}/approve`, {}); }
  rejectManager(id: number, reason: string) { return this.http.put<ApiResponse<any>>(`${this.url}/managers/${id}/reject`, { reason }); }
  suspendManager(id: number, reason: string) { return this.http.put<ApiResponse<any>>(`${this.url}/managers/${id}/suspend`, { reason }); }
  reactivateManager(id: number) { return this.http.put<ApiResponse<any>>(`${this.url}/managers/${id}/reactivate`, {}); }
  deleteManager(id: number) { return this.http.delete<ApiResponse<any>>(`${this.url}/managers/${id}`); }

  // Drivers
  getAllDrivers() { return this.http.get<ApiResponse<DriverDto[]>>(`${this.url}/drivers`); }
  suspendDriver(id: number, reason: string) { return this.http.put<ApiResponse<any>>(`${this.url}/drivers/${id}/suspend`, { reason }); }
  reactivateDriver(id: number) { return this.http.put<ApiResponse<any>>(`${this.url}/drivers/${id}/reactivate`, {}); }
  deleteDriver(id: number) { return this.http.delete<ApiResponse<any>>(`${this.url}/drivers/${id}`); }

  // Platform
  getAllUsers() { return this.http.get<ApiResponse<UserProfile[]>>(`${this.url}/users`); }
}
