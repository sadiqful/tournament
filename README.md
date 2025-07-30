Tournament Management System.

A comprehensive NestJS backend for managing football tournament. This includes registrations, teams, players, matches and payments.

### **Core Features:**
- **Team Registration** with player management (up to 15 players per team)
- **Payment Processing** using Stripe integration
- **Match Management** with scheduling, results, and league tables
- **Admin Dashboard** with full control over all entities
- **File Uploads** for team logos and player photos
- **Email Notifications** for confirmations and approvals
- **League table generation** with points calculation
- **Rate limiting** and security measures

## 🚀 **Quick Start:**

1. **Install dependencies**: `npm install`
2. **Setup environment**: Copy `.env.example` to `.env`
3. **Setup database**: `npm run db:setup`
4. **Start development**: `npm run start:dev`
5. **View API docs**: http://localhost:3000/api/docs


The backend has proper error handling, validation, security measures, and comprehensive documentation. It supports your exact requirements: 32 teams, ~15 players each, payment collection, match management and admin controls.