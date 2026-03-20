# Order Tracking System

Backend service for OTP-based order placement, restaurant acceptance, delivery assignment, and live order status updates.

## Overview

This repository currently contains the `primary-backend` service and local infrastructure definitions. The service exposes an Express API backed by PostgreSQL via Prisma, uses Redis for OTP storage and transient order state, publishes order status events through Kafka, and broadcasts live updates with Socket.IO.

The order flow implemented in the codebase is:

- Customer requests an OTP and signs in.
- Customer places an order for an open restaurant.
- Restaurant accepts or rejects the order.
- Accepted orders are assigned to an online delivery agent.
- Delivery agents move orders from `ACCEPTED` to `PICKED` to `DELIVERED`.
- Customers can cancel only while the order is still `PLACED`.

## Tech Stack

- Node.js with TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- Redis
- Kafka
- Socket.IO
- Zod

## Project Structure

```text
.
├── docker-compose.yml
├── README.md
└── primary-backend
    ├── package.json
    ├── prisma
    │   ├── migrations
    │   └── schema.prisma
    ├── src
    │   ├── config.ts
    │   ├── index.ts
    │   ├── kafka
    │   ├── lib
    │   ├── middleware
    │   ├── prisma
    │   ├── routes
    │   ├── socket.ts
    │   └── types
    └── test
        └── ws-test.js
```

## Prerequisites

- Node.js and npm
- PostgreSQL
- Redis
- Kafka

For local development, `docker-compose.yml` provides PostgreSQL, Redis, ZooKeeper, and Kafka containers.

## Setup

1. Start the local services:

```bash
docker compose up -d
```

2. Install backend dependencies:

```bash
cd primary-backend
npm install
```

3. Create a local environment file from the sample:

```bash
cp .env.example .env
```

4. Apply Prisma schema changes and generate the client for your database.

5. Optionally seed sample data:

```bash
npm run seed
```

## Configuration

The backend reads these variables from `primary-backend/.env`:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/order_tracking
REDIS_URL=redis://localhost:6379
KAFKA_BROKER=localhost:9092
```

## Development Commands

From `primary-backend/`:

```bash
npm run build
npm run dev
npm run start
npm run seed
```

## API Endpoints

Base paths:

- `/api/v1/user`
- `/api/v1/order`

Authentication:

- `POST /api/v1/user/login`
- `POST /api/v1/user/login/customer/verify-otp`
- `POST /api/v1/user/login/delivery/verify-otp`
- `POST /api/v1/user/login/admin/verify-otp`

Order lifecycle:

- `POST /api/v1/order/place-order`
- `GET /api/v1/order/my-orders`
- `PATCH /api/v1/order/orders/:id/cancel`
- `PATCH /api/v1/order/orders/:id/accept`
- `PATCH /api/v1/order/orders/:id/reject`
- `PATCH /api/v1/order/orders/:id/status`

Operational views:

- `GET /api/v1/order/orders/restaurent/my-orders`
- `GET /api/v1/order/orders/delivery/my-orders`
- `GET /api/v1/order/all-orders/status`
- `GET /api/v1/order/delivery-available`
- `GET /api/v1/order/restaurent-available`
- `GET /api/v1/order/placed-orders`
- `GET /health`

Most order routes require a bearer token and role-specific access enforced by `authMiddleware` and `requireRole`.

## Example Requests

Request an OTP:

```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNo":"9999999999"}'
```

Verify a customer OTP:

```bash
curl -X POST http://localhost:3000/api/v1/user/login/customer/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNo":"9999999999","otp":"123456"}'
```

Place an order:

```bash
curl -X POST http://localhost:3000/api/v1/order/place-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer-token>" \
  -d '{
    "restaurentId":"<restaurant-id>",
    "totalPrice":450,
    "items":[
      {"name":"Burger","quantity":2,"price":150},
      {"name":"Fries","quantity":1,"price":150}
    ]
  }'
```

Update delivery status:

```bash
curl -X PATCH http://localhost:3000/api/v1/order/orders/<order-id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <delivery-token>" \
  -d '{"status":"PICKED"}'
```

## Architecture Notes

- `src/routes/user.ts` handles OTP login and role-based token issuance.
- `src/routes/order.ts` owns order placement, cancellation, acceptance, rejection, and delivery progression.
- `src/lib` contains shared clients and auth helpers.
- `src/kafka` publishes and consumes order status events.
- `src/socket.ts` exposes a Socket.IO server that lets clients join order-specific rooms.
- Kafka consumer updates are emitted on the `order-status-update` topic and forwarded to connected Socket.IO clients.

## Testing

There is no automated test script in `primary-backend/package.json` yet.

The repository includes a manual Socket.IO smoke script at `primary-backend/test/ws-test.js` that connects to `http://localhost:3000`, joins an order room, and logs live status events.

## Current Limitations

- The repository does not include an automated test suite.
- Prisma migration files in the repo should be kept in sync with schema changes before relying on a fresh environment setup.
- The root repository currently contains the backend service only; the previous frontend app has been removed.

## License

This repository does not currently include a root license file. The backend package is marked as `ISC` in `primary-backend/package.json`.
