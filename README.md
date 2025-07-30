Tournament Management System - Backend API
A comprehensive NestJS backend for managing tournament registrations, teams, players, matches, and payments.

### **Core Features:**
- **Team Registration** with player management (up to 15 players per team)
- **Payment Processing** using Stripe integration
- **Match Management** with scheduling, results, and league tables
- **Admin Dashboard** with full control over all entities
- **File Uploads** for team logos and player photos
- **Email Notifications** for confirmations and approvals
- **JWT Authentication** for admin access
- **RESTful API** with comprehensive Swagger documentation

### **Key Modules:**
1. **Authentication Module** - JWT-based admin authentication
2. **Teams Module** - Team registration, approval, and management
3. **Players Module** - Individual and bulk player management
4. **Matches Module** - Match scheduling, results, and standings
5. **Payments Module** - Stripe payment processing with webhooks
6. **Common Module** - Shared services like email and file handling

### **Database Design:**
- **PostgreSQL** with TypeORM
- **5 main entities**: Teams, Players, Matches, Payments, Admins
- **Proper relationships** and constraints
- **Enum types** for statuses and positions
- **Automatic seeding** with sample data

### **Advanced Features:**
- **File upload handling** with validation and storage
- **Email service** with HTML templates for notifications
- **Payment webhooks** for real-time payment status updates
- **League table generation** with points calculation
- **Comprehensive validation** using class-validator
- **Global error handling** and response transformation
- **Rate limiting** and security measures

### **Development Tools:**
- **Docker support** with docker-compose
- **Database migration** system
- **Seeding scripts** for sample data
- **Setup scripts** for easy installation
- **Comprehensive documentation** with API examples

## 🚀 **Quick Start:**

1. **Install dependencies**: `npm install`
2. **Setup environment**: Copy `.env.example` to `.env`
3. **Setup database**: `npm run db:setup`
4. **Start development**: `npm run start:dev`
5. **View API docs**: http://localhost:3000/api/docs

## 📊 **API Endpoints:**
- **32 teams registration** with approval workflow
- **Player management** (bulk upload supported)
- **Match scheduling** and results
- **Payment processing** with Stripe
- **Admin dashboard** endpoints
- **League table** generation
- **File uploads** for logos/photos

The backend has proper error handling, validation, security measures, and comprehensive documentation. It supports your exact requirements: 32 teams, ~15 players each, payment collection, match management and admin controls.