# Backend Utility Scripts

This folder contains standalone JavaScript utility scripts for development, testing, and database management.

## 📋 Table of Contents

- [Database Management](#database-management)
- [Password Management](#password-management)
- [Testing Scripts](#testing-scripts)
- [Data Migration](#data-migration)

---

## 🗄️ Database Management

### show-users.js
View all users in the database with basic information.

```bash
node scripts/show-users.js
```

**Output**: ID, Username, Email, Role

---

### show-users-with-fullname.js
View all users including the fullName field.

```bash
node scripts/show-users-with-fullname.js
```

**Output**: ID, Username, Full Name, Email, Role

---

### delete-all-users-simple.js
⚠️ **DANGER**: Deletes ALL users from the database.

```bash
node scripts/delete-all-users-simple.js
```

**Use case**: Reset database during development/testing

---

## 🔐 Password Management

### check-password.js
Debug password hashing issues for user "samrat".

```bash
node scripts/check-password.js
```

**What it does**:
- Checks if password "88889999" works
- Shows password hash
- Auto-fixes if password doesn't match
- Verifies the fix

---

### set-password.js
Manually set a user's password via command line.

```bash
node scripts/set-password.js <password>
```

**Example**:
```bash
node scripts/set-password.js MyNewPass123
```

**What it does**:
- Takes password as argument
- Hashes with bcrypt
- Updates database
- Verifies it works
- Shows login credentials

---

### fix-password.js
Interactive password fix utility with prompts.

```bash
node scripts/fix-password.js
```

**What it does**:
- Prompts for new password
- Detects and removes whitespace
- Updates password
- Shows formatted login credentials

---

## 🧪 Testing Scripts

### test-password-reset-flow.js
Test the complete password reset flow end-to-end.

```bash
node scripts/test-password-reset-flow.js
```

**What it tests**:
1. Current user state
2. Current password validity
3. Password reset simulation
4. New password verification
5. Old password invalidation

---

### test-email.js
Test email configuration and SMTP connection.

```bash
node scripts/test-email.js
```

**What it does**:
- Reads EMAIL_USER and EMAIL_PASSWORD from .env
- Verifies SMTP connection
- Sends test email with sample OTP
- Confirms delivery

**Requirements**: EMAIL_USER and EMAIL_PASSWORD must be set in .env

---

## 🔄 Data Migration

### update-profile-pictures.js
Update all users with personalized avatar URLs.

```bash
node scripts/update-profile-pictures.js
```

**What it does**:
- Loops through all users
- Generates avatar URL based on fullName or username
- Updates profilePicture field
- Uses ui-avatars.com API

---

## 📝 Usage Tips

### Quick Debugging Workflow

**Problem**: Login not working

```bash
# 1. Check if user exists
node scripts/show-users.js

# 2. Check password hash
node scripts/check-password.js

# 3. Fix password if needed
node scripts/set-password.js test123

# 4. Test the flow
node scripts/test-password-reset-flow.js
```

---

### Email Setup Verification

```bash
# Test email before implementing features
node scripts/test-email.js
```

---

## ⚙️ Requirements

All scripts require:
- Node.js installed
- Prisma Client generated (`npm run prisma:generate`)
- Database connection configured in `.env`
- Dependencies installed (`npm install`)

---

## 🚫 Production Note

These scripts are for **development only**. They are not part of the NestJS application and should not be deployed to production.

Add to `.dockerignore`:
```
scripts/
*.js
!dist/**/*.js
```

---

## 🔧 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### "Database connection error"
Check your `.env` file has correct `DATABASE_URL`

### "Email sending failed"
Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

---

## 📚 Learn More

These scripts demonstrate:
- Direct Prisma Client usage
- Bcrypt password hashing
- Nodemailer email sending
- Database queries and updates
- Command-line argument handling
