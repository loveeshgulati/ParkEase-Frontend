// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { fullName: string; email: string; password: string; phone: string; role: string; }
export interface LoginResponse { userId: number; fullName: string; email: string; role: string; accessToken: string; refreshToken: string; tokenExpiry: string; }
export interface UserProfile { userId: number; fullName: string; email: string; phone: string; role: string; status: string; vehiclePlate?: string; profilePicUrl?: string; isActive: boolean; createdAt: string; approvedAt?: string; rejectionReason?: string; }

// ─── Vehicle ──────────────────────────────────────────────────────────────────
export interface Vehicle { vehicleId: number; ownerId: number; licensePlate: string; make: string; model: string; color: string; vehicleType: string; isEV: boolean; isActive: boolean; registeredAt: string; }
export interface RegisterVehicleRequest { licensePlate: string; make: string; model: string; color: string; vehicleType: string; isEV: boolean; }

// ─── ParkingLot ───────────────────────────────────────────────────────────────
export interface ParkingLot { lotId: number; managerId: number; name: string; address: string; city: string; latitude: number; longitude: number; totalSpots: number; availableSpots: number; isOpen: boolean; openTime: string; closeTime: string; imageUrl?: string; approvalStatus: string; rejectionReason?: string; approvedAt?: string; createdAt: string; }
export interface NearbyLot { lotId: number; name: string; address: string; city: string; latitude: number; longitude: number; distanceKm: number; availableSpots: number; totalSpots: number; isOpen: boolean; openTime: string; closeTime: string; imageUrl?: string; }
export interface CreateLotRequest { name: string; address: string; city: string; latitude: number; longitude: number; openTime: string; closeTime: string; imageUrl?: string; }

// ─── Spot ─────────────────────────────────────────────────────────────────────
export interface Spot { spotId: number; lotId: number; spotNumber: string; floor: number; spotType: string; vehicleType: string; status: string; isHandicapped: boolean; isEVCharging: boolean; pricePerHour: number; createdAt: string; }
export interface AddSpotRequest { lotId: number; spotNumber: string; floor: number; spotType: string; vehicleType: string; pricePerHour: number; isHandicapped: boolean; isEVCharging: boolean; }
export interface BulkAddSpotRequest { lotId: number; floor: number; spotType: string; vehicleType: string; pricePerHour: number; isHandicapped: boolean; isEVCharging: boolean; count: number; prefix: string; }

// ─── Booking ──────────────────────────────────────────────────────────────────
export interface Booking { bookingId: number; userId: number; lotId: number; spotId: number; vehiclePlate: string; vehicleType: string; bookingType: string; status: string; startTime: string; endTime: string; checkInTime?: string; checkOutTime?: string; totalAmount: number; cancellationReason?: string; createdAt: string; }
export interface CreateBookingRequest { lotId: number; spotId: number; vehiclePlate: string; vehicleType: string; bookingType: string; startTime: string; endTime: string; }
export interface FareCalculation { bookingId: number; spotId: number; pricePerHour: number; hoursParked: number; totalAmount: number; note: string; }

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface Payment { paymentId: number; bookingId: number; userId: number; amount: number; status: string; mode: string; razorpayOrderId?: string; razorpayPaymentId?: string; currency: string; description?: string; paidAt?: string; refundedAt?: string; refundAmount?: number; refundReason?: string; createdAt: string; }
export interface ProcessPaymentRequest { bookingId: number; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string; mode: string; amount: number; description?: string; }

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification { notificationId: number; recipientId: number; title: string; message: string; type: string; channel: string; relatedId?: number; relatedType?: string; isRead: boolean; sentAt: string; }

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface ManagerDto { userId: number; fullName: string; email: string; phone: string; status: string; createdAt: string; approvedAt?: string; }
export interface DriverDto { userId: number; fullName: string; email: string; phone: string; status: string; vehiclePlate?: string; createdAt: string; }
export interface PendingManagerDto { userId: number; fullName: string; email: string; phone: string; registeredAt: string; status: string; }

// ─── API Wrapper ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> { success: boolean; message: string; data: T; errors?: string[]; }
