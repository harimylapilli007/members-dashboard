# Booking API Endpoints

This document describes the API endpoints for managing spa bookings in the membership dashboard.

## Base URL
All endpoints are relative to `/api/bookings/`

## Endpoints

### 1. Get User Bookings
**GET** `/api/bookings/user`

Fetches all bookings for a specific guest.

#### Query Parameters
- `guestId` (required): The unique identifier of the guest

#### Example Request
```
GET /api/bookings/user?guestId=12345678-1234-1234-1234-123456789012
```

#### Example Response
```json
{
  "success": true,
  "appointments": [
    {
      "appointment_group_id": "group-123",
      "appointment_services": [
        {
          "appointment_id": "appointment-123",
          "appointment_status": 0,
          "start_time": "2024-01-15T10:00:00Z",
          "service": {
            "name": "Swedish Massage",
            "duration": 60
          }
        }
      ],
      "center": {
        "id": "center-123"
      },
      "price": {
        "final": 2500
      },
      "invoice_id": "invoice-123"
    }
  ],
  "count": 1
}
```

#### Error Responses
- `400`: Missing or invalid guest ID
- `401`: Authentication failed
- `404`: Guest not found
- `500`: Server error

---

### 2. Cancel Booking
**PUT** `/api/bookings/cancel`

Cancels a specific appointment.

#### Request Body
```json
{
  "appointmentId": "appointment-123",
  "reason": "Cancelled by customer"
}
```

#### Parameters
- `appointmentId` (required): The unique identifier of the appointment to cancel
- `reason` (optional): Reason for cancellation (default: "Cancelled by customer")

#### Example Request
```json
PUT /api/bookings/cancel
Content-Type: application/json

{
  "appointmentId": "appointment-123",
  "reason": "Schedule conflict"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "result": {
    "cancellation_id": "cancel-123"
  }
}
```

#### Error Responses
- `400`: Missing or invalid appointment ID, or reason too long
- `401`: Authentication failed
- `404`: Appointment not found
- `409`: Appointment cannot be cancelled at this time
- `500`: Server error

---

### 3. Create Booking
**POST** `/api/bookings`

Creates a new booking (existing endpoint).

#### Request Body
```json
{
  "centerId": "center-123",
  "serviceId": "service-123",
  "date": "2024-01-15",
  "time": "10:00 AM",
  "guestId": "guest-123"
}
```

#### Example Response
```json
{
  "success": true,
  "bookingId": "booking-123",
  "message": "Booking confirmed successfully"
}
```

## Client-Side Utilities

The application includes utility functions in `app/utils/bookings-api.ts` for easier integration:

### `fetchUserBookings(guestId: string): Promise<Booking[]>`
Fetches user bookings with proper error handling.

### `cancelBooking(appointmentId: string, reason?: string): Promise<boolean>`
Cancels a booking with proper error handling.

### `createBooking(bookingData): Promise<{ bookingId: string }>`
Creates a new booking with proper error handling.

## Error Handling

All endpoints return consistent error responses with:
- `success`: boolean indicating success/failure
- `message`: human-readable error message
- Appropriate HTTP status codes

## Authentication

All endpoints require the `ZENOTI_API_KEY` environment variable to be set for authentication with the Zenoti API.

## Rate Limiting

The API uses the existing `fetchWithRetry` utility which includes:
- Exponential backoff for failed requests
- Request queuing to prevent too many concurrent requests
- Automatic retries for network errors
- Request timeouts (30 seconds)

## Caching

The API uses LRU caching with:
- Maximum 500 cached items
- 5-minute TTL (Time To Live)
- Cache keys generated based on request parameters 