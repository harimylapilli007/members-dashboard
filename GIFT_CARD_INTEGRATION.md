# Gift Card Integration with Zenoti API

## Overview
This document describes the gift card integration implemented using the Zenoti API endpoint for creating gift cards.

## API Endpoint
- **URL**: `https://api.zenoti.com/v1/invoices/gift_cards`
- **Method**: POST
- **Authorization**: API Key authentication

## Implementation Details

### Backend API (`/api/giftcards/create`)
- **File**: `app/api/giftcards/create/route.ts`
- **Purpose**: Creates gift cards via Zenoti API
- **Validation**: 
  - Required fields: amount, recipient name, recipient email
  - Amount limits: ₹100 - ₹100,000
  - Email format validation
  - Positive number validation

### Frontend Integration (`/app/gift-cards/page.tsx`)
- **Features**:
  - Amount selection (preset or custom)
  - Occasion selection with dynamic loading from Zenoti
  - Recipient details form
  - Gift card design selection
  - Delivery option selection
  - Form validation and error handling
  - Integration with existing payment system

## API Payload Structure

```json
{
  "center_id": "92d41019-c790-4668-9158-a693e531c1a4",
  "amount": 1000,
  "recipient_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "mobile_phone": "+1234567890"
  },
  "message": "Happy Birthday!",
  "occasion_id": "birthday",
  "delivery_option": "immediate",
  "notes": "Gift card created via website - Occasion: birthday"
}
```

## Flow
1. User fills out gift card form
2. Frontend validates form data
3. Backend API validates and creates gift card via Zenoti
4. On success, redirects to payment page with invoice ID
5. User completes payment through existing payment gateway
6. Gift card is delivered to recipient

## Error Handling
- Form validation errors displayed to user
- API errors logged and returned with user-friendly messages
- Rate limiting and duplicate submission prevention

## Security
- API key stored securely in environment variables
- Input validation and sanitization
- HTTPS communication with Zenoti API

## Testing
To test the integration:
1. Navigate to `/gift-cards`
2. Fill out the form with valid data
3. Submit and verify gift card creation
4. Check payment flow integration

## Dependencies
- Next.js API routes
- Zenoti API integration
- Existing payment system
- Form validation and error handling 