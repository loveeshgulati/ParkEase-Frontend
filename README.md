# ParkEase Frontend — Angular 17

Simple Angular 17 frontend for the ParkEase microservices backend.

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/           ← auth, admin, manager, driver guards
│   │   ├── interceptors/     ← JWT interceptor
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── api.services.ts   ← all API services
│   │   └── models.ts             ← all TypeScript interfaces
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/
│   │   │   ├── admin-dashboard/
│   │   │   ├── manage-managers/
│   │   │   ├── manage-drivers/
│   │   │   ├── manage-lots/
│   │   │   └── manage-bookings/
│   │   ├── manager/
│   │   │   ├── manager-dashboard/
│   │   │   ├── my-lots/
│   │   │   ├── manage-spots/
│   │   │   └── lot-bookings/
│   │   ├── driver/
│   │   │   ├── driver-dashboard/
│   │   │   ├── search-lots/
│   │   │   ├── lot-detail/
│   │   │   ├── my-vehicles/
│   │   │   ├── my-bookings/
│   │   │   └── my-payments/
│   │   └── shared/
│   │       └── navbar/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
└── environments/
    └── environment.ts
```

---

## Low-Level Design (LLD) Architectural Diagram

### 1. Structural Class & Data Flow Interaction (UML Class Map)

The following diagram maps the low-level interactions across components, guards, services, and models, illustrating the exact sequence of data flow during client-server operations.

```mermaid
classDiagram
    direction TB

    %% Angular App Config & Root Router
    class AppRoutes {
        +routes: Routes
        <<Configuration>>
    }

    class AppConfig {
        +appConfig: ApplicationConfig
        <<Configuration>>
    }

    %% Security & Guards
    class AuthGuards {
        +authGuard()
        +adminGuard()
        +managerGuard()
        +driverGuard()
        <<Guard>>
    }

    %% Interceptors
    class AuthInterceptor {
        +authInterceptor(req, next)
        <<Interceptor>>
    }

    %% Feature Components
    class LoginComponent {
        +loginForm: FormGroup
        +onSubmit()
    }
    class RegisterComponent {
        +registerForm: FormGroup
        +onSubmit()
    }
    class DriverDashboardComponent {
        +vehicles: Vehicle[]
        +activeBookings: Booking[]
        +ngOnInit()
    }
    class ManagerDashboardComponent {
        +lots: ParkingLot[]
        +revenue: any
        +ngOnInit()
    }
    class AdminDashboardComponent {
        +managers: PendingManagerDto[]
        +ngOnInit()
    }

    %% Services
    class AuthService {
        -currentUserSubject: BehaviorSubject
        +currentUser: UserProfile
        +login(credentials)
        +register(userData)
        +logout()
    }

    class VehicleService {
        -url: string
        +getMyVehicles()
        +registerVehicle(req)
        +deleteVehicle(id)
    }

    class ParkingLotService {
        -url: string
        +searchByCity(city)
        +getNearby(lat, lng)
        +getMyLots()
        +approveLot(id)
    }

    class SpotService {
        -url: string
        +getSpotsByLot(lotId)
        +getAvailableSpots(lotId)
        +addSpot(req)
    }

    class BookingService {
        -url: string
        +createBooking(req)
        +getMyBookings()
        +checkIn(id)
        +checkOut(id)
    }

    class RazorpayService {
        -paymentUrl: string
        +createOrder(amount, receipt)
        +openRazorpayCheckout(order, bookingId)
    }

    class SignalrService {
        -hubConnection: HubConnection
        -notificationSubject: BehaviorSubject
        +startConnection()
        +stopConnection()
    }

    %% Flow Associations
    AppConfig --> AppRoutes : Binds Route Configuration
    AppRoutes --> AuthGuards : Protects Routes via Role Guards
    AuthGuards --> AuthService : Queries Current Logged-in User Session

    %% Component to Service Associations
    LoginComponent --> AuthService : Authenticates via
    RegisterComponent --> AuthService : Registers via
    DriverDashboardComponent --> VehicleService : Fetches Vehicles
    DriverDashboardComponent --> BookingService : Fetches Bookings
    DriverDashboardComponent --> RazorpayService : Launches Payments
    ManagerDashboardComponent --> ParkingLotService : Manages Lots
    ManagerDashboardComponent --> SpotService : Configures Spots
    AdminDashboardComponent --> AuthService : Supervise Managers

    %% Service to Outgoing Interceptor Pipeline
    VehicleService ..> AuthInterceptor : Injected Auth Token
    ParkingLotService ..> AuthInterceptor : Injected Auth Token
    SpotService ..> AuthInterceptor : Injected Auth Token
    BookingService ..> AuthInterceptor : Injected Auth Token

    %% SignalR Dynamic Notification updates
    SignalrService --> DriverDashboardComponent : Pushes live popups
    SignalrService --> ManagerDashboardComponent : Pushes occupancy updates
```

---

### 2. Client-Server Outgoing Request Pipeline (Sequence Design)

This low-level sequence diagram demonstrates how an outgoing HTTP call is built, dynamically decorated with security headers, and executed against your .NET Microservices API Gateway:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client UI Component
    participant Svc as Angular Service (e.g. BookingService)
    participant Int as AuthInterceptor
    participant Env as Environment Config
    participant API as .NET Microservices Backend

    User->>Svc: Invokes API call method (e.g., createBooking())
    Svc->>Env: Pulls API endpoint URL base configuration
    Env-->>Svc: Returns API base URL
    Svc->>Int: Generates outgoing HttpClient request object
    Note over Int: interceptor catches request before execution
    Int->>Int: Retrieves JWT accessToken from local state storage
    Int->>Int: Clones request, adding header: 'Authorization: Bearer <JWT>'
    Int->>API: Forwards authorized, decorated request to port gateway
    API-->>Int: Returns JSON response package
    Int-->>Svc: Returns JSON observable payload stream
    Svc-->>User: Component receives data & updates view dynamically
```

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Run development server
ng serve

# App opens at http://localhost:4200
```

---

## Backend Service URLs (environment.ts)

```typescript
authUrl:         'http://localhost:7002/api/v1'
vehicleUrl:      'http://localhost:7004/api/v1'
parkingLotUrl:   'http://localhost:5003/api/v1'
spotUrl:         'http://localhost:5002/api/v1'
bookingUrl:      'http://localhost:5001/api/v1'
paymentUrl:      'http://localhost:5006/api/v1'
notificationUrl: 'http://localhost:5008/api/v1'
```

Update these if your services run on different ports.

---

## Default Admin Credentials

```
Email:    admin@parkease.com
Password: Admin@123
```

---

## Pages by Role

### Admin
| Page | Route |
|------|-------|
| Dashboard | /admin |
| Manage Managers | /admin/managers |
| Manage Drivers | /admin/drivers |
| Manage Lots | /admin/lots |
| All Bookings | /admin/bookings |

### Manager
| Page | Route |
|------|-------|
| Dashboard | /manager |
| My Lots | /manager/lots |
| Manage Spots | /manager/lots/:id/spots |
| Lot Bookings | /manager/bookings |

### Driver
| Page | Route |
|------|-------|
| Dashboard | /driver |
| Find Parking | /driver/search |
| Lot Detail + Book | /driver/lots/:id |
| My Vehicles | /driver/vehicles |
| My Bookings | /driver/bookings |
| My Payments | /driver/payments |

---

## CORS Fix for Backend

If you see CORS errors, make sure each backend service has CORS enabled.
All services already have `AllowAll` CORS policy in `Program.cs`.

---

## Build for Production

```bash
ng build --configuration production
# Output in dist/parkease-frontend/
```
