# BillWise AI Nexus API Documentation

## Overview

The BillWise AI Nexus API provides comprehensive endpoints for managing medical billing operations, patient data, collections, and analytics.

## Base URL

```
https://your-domain.com/api
```

## Authentication

All API endpoints require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "billing_staff"
    },
    "token": "jwt-token"
  }
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

### Patients

#### GET /patients
Retrieve a list of patients with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for name or email
- `sort` (string): Sort field (default: 'created_at')
- `order` (string): Sort order ('asc' or 'desc')

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "(555) 123-4567",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

#### POST /patients
Create a new patient record.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "address": "123 Main St",
  "insurance_id": "INS123"
}
```

#### PUT /patients/:id
Update an existing patient record.

#### DELETE /patients/:id
Delete a patient record.

### Billing Statements

#### GET /billing/statements
Retrieve billing statements with filtering.

**Query Parameters:**
- `status` (string): Filter by status (pending, paid, overdue, cancelled)
- `patient_id` (string): Filter by patient ID
- `date_from` (string): Start date (ISO format)
- `date_to` (string): End date (ISO format)

#### POST /billing/statements
Create a new billing statement.

**Request Body:**
```json
{
  "patient_id": "uuid",
  "amount": 1000.50,
  "due_date": "2024-02-01",
  "description": "Medical services",
  "status": "pending"
}
```

### Collections

#### GET /collections/accounts
Retrieve collection accounts.

#### POST /collections/accounts
Create a new collection account.

#### GET /collections/activities
Retrieve collection activities for an account.

#### POST /collections/activities
Create a new collection activity.

### Authorization Requests

#### GET /authorizations/requests
Retrieve authorization requests.

#### POST /authorizations/requests
Create a new authorization request.

**Request Body:**
```json
{
  "patient_id": "uuid",
  "procedure_code": "99213",
  "description": "Office visit",
  "requested_amount": 150.00,
  "status": "pending"
}
```

### Payment Plans

#### GET /payments/plans
Retrieve payment plans.

#### POST /payments/plans
Create a new payment plan.

**Request Body:**
```json
{
  "patient_id": "uuid",
  "total_amount": 1000.00,
  "monthly_payment": 100.00,
  "start_date": "2024-01-01",
  "status": "active"
}
```

### Analytics

#### GET /analytics/dashboard
Retrieve dashboard analytics data.

**Response:**
```json
{
  "data": {
    "totalRevenue": 50000.00,
    "outstandingBalance": 15000.00,
    "collectionRate": 0.85,
    "averageDaysToPayment": 25,
    "topDenialReasons": [
      {
        "reason": "Prior Authorization Required",
        "count": 45,
        "percentage": 0.35
      }
    ],
    "monthlyTrends": [
      {
        "month": "2024-01",
        "revenue": 25000.00,
        "collections": 20000.00
      }
    ]
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to 1000 requests per hour per user.

## Pagination

All list endpoints support pagination:

- `page`: Page number (1-based)
- `limit`: Items per page (max 100)
- `total`: Total number of items
- `hasMore`: Whether more pages exist

## Filtering and Sorting

Most endpoints support filtering and sorting:

- `search`: Text search across relevant fields
- `sort`: Field to sort by
- `order`: Sort direction ('asc' or 'desc')
- Date ranges: `date_from` and `date_to` parameters

## Webhooks

The API supports webhooks for real-time notifications:

- `billing.statement.created`
- `billing.statement.updated`
- `collections.account.created`
- `authorizations.request.approved`
- `authorizations.request.denied`

## SDKs

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- PHP
- Java

## Support

For API support, contact:
- Email: api-support@billwise.com
- Documentation: https://docs.billwise.com
- Status Page: https://status.billwise.com
