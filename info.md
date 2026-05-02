# System Architecture Documentation

## Overview

This is a modern e-commerce application for Kaftan fashion, built with a React frontend, Supabase backend, and integrated third-party services for payments, media storage, and email communications.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React SPA)   │◄──►│   (Supabase)    │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Vite + TS     │    │ • PostgreSQL    │    │ • Stripe        │
│ • React Router  │    │ • Auth/RLS      │    │ • Cloudinary    │
│ • Tailwind CSS  │    │ • Storage       │    │ • EmailJS       │
│ • React Query   │    │ • Edge Functions│    │ • Mailgun       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17 with shadcn/ui components
- **State Management**: React Context + React Query (TanStack Query)
- **Routing**: React Router DOM 6.30.1
- **UI Components**: Radix UI primitives with custom shadcn/ui
- **Animations**: Framer Motion 12.34.3
- **Forms**: React Hook Form with Zod validation

### Frontend Structure

#### Core Components
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── CartDrawer.tsx  # Shopping cart overlay
│   ├── SearchOverlay.tsx # Global search functionality
│   └── MobileBottomNav.tsx # Mobile navigation
├── contexts/           # Global state management
│   ├── AuthContext.tsx    # User authentication state
│   ├── CartContext.tsx    # Shopping cart state
│   └── WishlistContext.tsx # Wishlist management
├── pages/              # Route-based page components
│   ├── Index.tsx       # Homepage
│   ├── Shop.tsx        # Product listing
│   ├── Checkout.tsx    # Checkout process
│   └── admin/          # Admin dashboard pages
├── lib/                # Business logic services
│   ├── productService.ts
│   ├── cloudinaryService.ts
│   └── smtpService.ts
└── integrations/
    └── supabase/       # Database client
```

#### State Management Pattern
- **AuthContext**: Manages user authentication state using Supabase Auth
- **CartContext**: Handles shopping cart operations (add, remove, update quantities)
- **WishlistContext**: Manages product wishlists
- **React Query**: Caches and synchronizes server state (products, orders, etc.)

#### Routing Structure
```typescript
// Public Routes
/                    # Homepage
/shop               # Product catalog
/collections        # Product collections
/product/:id        # Product detail page
/checkout           # Checkout process
/login, /register   # User authentication

// Admin Routes
/admin/login        # Admin authentication
/admin/dashboard    # Admin main dashboard
/admin/products     # Product management
/admin/orders       # Order management
/admin/customers    # Customer management
/admin/analytics    # Sales analytics
```

## Backend Architecture

### Database: Supabase (PostgreSQL)

#### Core Tables
```sql
-- Products Management
products            # Product catalog
categories          # Product categories
collections         # Product collections
collection_products # Many-to-many relationship
inventory           # Stock management

-- Order Management
orders              # Customer orders
order_items         # Order line items
coupons             # Discount codes

-- User Management
customers           # Customer profiles
reviews             # Product reviews

-- Content Management
pages              # Custom pages (About, Contact, etc.)
header_footer      # Navigation and footer content
banner_content     # Homepage banners
settings           # Site configuration

-- Email & Notifications
email_templates    # Email template management
subscribers        # Newsletter subscribers
```

#### Security Features
- **Row Level Security (RLS)**: Fine-grained data access control
- **Authentication**: Supabase Auth with JWT tokens
- **Admin Role System**: Role-based access control for admin functions
- **API Security**: Service role keys for server operations

### Supabase Edge Functions
```typescript
supabase/functions/
├── send-order-confirmation/    # Order email notifications
├── process-payment/           # Stripe payment processing
├── generate-invoice/          # PDF invoice generation
└── analytics-tracking/        # Sales analytics collection
```

## External Services Integration

### 1. Payment Processing - Stripe
```typescript
// Configuration
VITE_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY (server-side)

// Features
- Credit card payments
- Apple Pay / Google Pay
- Payment intent creation
- Webhook handling for order confirmation
```

### 2. Media Storage - Cloudinary
```typescript
// Configuration
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_API_KEY
VITE_CLOUDINARY_API_SECRET

// Features
- Product image uploads
- Image optimization and CDN
- Automatic image resizing
- Video hosting support
```

### 3. Email Services

#### EmailJS (Client-side)
```typescript
// Configuration
VITE_EMAILJS_PUBLIC_KEY
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID

// Usage
- Contact form submissions
- Customer inquiries
- Auto-reply notifications
```

#### Mailgun (Server-side)
```typescript
// Configuration
VITE_MAILGUN_API_KEY
VITE_MAILGUN_DOMAIN

// Usage
- Order confirmation emails
- Shipping notifications
- Marketing campaigns
- Transactional emails
```

## Data Flow Architecture

### Product Catalog Flow
```
1. Frontend requests products → Supabase Query
2. Supabase returns product data with images
3. Frontend caches with React Query
4. Images served via Cloudinary CDN
5. User interactions update cart state
```

### Order Processing Flow
```
1. User adds items to cart (Client state)
2. Checkout → Stripe Payment Intent
3. Payment confirmation → Order creation in Supabase
4. Inventory update via Edge Function
5. Email notifications via EmailJS/Mailgun
6. Admin dashboard updates in real-time
```

### Authentication Flow
```
1. User login/signup → Supabase Auth
2. JWT token stored in localStorage
3. AuthContext updates global state
4. Protected routes check authentication
5. API calls include JWT in headers
6. Row Level Security enforced by Supabase
```

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Cloudinary automatic optimization
- **Caching Strategy**: React Query with stale-while-revalidate
- **Bundle Optimization**: Vite build optimizations
- **Smooth Scrolling**: Lenis library for 60fps scrolling

### Backend Optimizations
- **Database Indexing**: Optimized queries for products and orders
- **CDN Delivery**: Cloudinary CDN for media assets
- **Connection Pooling**: Supabase managed connections
- **Edge Functions**: Global deployment for low latency

## Security Architecture

### Frontend Security
- **Environment Variables**: Sensitive data in .env files
- **Input Validation**: Zod schemas for form validation
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: SameSite cookie policies

### Backend Security
- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **API Key Management**: Separate client/server keys
- **HTTPS Enforcement**: All communications encrypted

## Deployment Architecture

### Frontend Deployment
- **Platform**: Vercel (recommended) or Netlify
- **Build Process**: `npm run build` → Static assets
- **Environment**: Production environment variables
- **CDN**: Automatic global CDN distribution

### Backend Deployment
- **Platform**: Supabase (managed PostgreSQL)
- **Database**: Automated backups and point-in-time recovery
- **Edge Functions**: Global deployment network
- **Storage**: Automatic scaling and optimization

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Console logging + error boundaries
- **Performance Monitoring**: Vite build analysis
- **User Analytics**: Custom analytics tracking
- **Database Monitoring**: Supabase dashboard

### Business Analytics
```sql
-- Sales Analytics Dashboard
- Daily/Weekly/Monthly revenue
- Product performance metrics
- Customer acquisition data
- Inventory turnover rates
- Conversion funnel analysis
```

## Development Workflow

### Local Development
```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run test         # Unit tests

# Database
supabase start       # Local Supabase instance
supabase db push     # Apply migrations
supabase functions serve # Local edge functions
```

### Environment Configuration
```typescript
// .env.example
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_STRIPE_PUBLISHABLE_KEY=...
VITE_EMAILJS_PUBLIC_KEY=...
```

## Scalability Considerations

### Horizontal Scaling
- **Frontend**: Stateless deployment across CDN
- **Backend**: Supabase auto-scaling PostgreSQL
- **Storage**: Cloudinary elastic storage
- **Edge Functions**: Global edge network

### Database Scaling
- **Read Replicas**: For high-traffic product catalogs
- **Connection Pooling**: Efficient connection management
- **Index Optimization**: Query performance tuning
- **Archival Strategy**: Historical data management

## Future Enhancements

### Planned Features
- **Progressive Web App**: Offline functionality
- **Real-time Updates**: WebSocket integration
- **AI Recommendations**: Product suggestion engine
- **Multi-language Support**: Internationalization
- **Mobile App**: React Native development

### Technical Improvements
- **Microservices**: Service decomposition
- **GraphQL**: API optimization
- **Event Sourcing**: Audit trail implementation
- **Caching Layer**: Redis implementation
- **Search Engine**: Elasticsearch integration

---

This architecture provides a solid foundation for a scalable, secure, and maintainable e-commerce platform with modern development practices and comprehensive third-party integrations.
