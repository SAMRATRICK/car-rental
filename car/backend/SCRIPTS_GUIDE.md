# Quick Scripts Reference Guide

All utility scripts have been organized in the `scripts/` folder.

## 🚀 Quick Commands

### View Users
```bash
npm run script:show-users              # Basic user info
npm run script:show-users-full         # With full names
```

### Password Management
```bash
npm run script:check-password          # Check password for 'samrat'
npm run script:fix-password            # Interactive password fix
node scripts/set-password.js <pass>    # Set specific password
```

### Testing
```bash
npm run script:test-email              # Test email configuration
npm run script:test-reset-flow         # Test password reset flow
```

### Data Management
```bash
npm run script:update-avatars          # Update profile pictures
npm run script:delete-all-users        # ⚠️ Delete all users
npm run script:check-profile-pics      # Check profile picture paths
npm run script:sync-profile-pics       # Sync DB with uploaded files
```

## 📖 Full Documentation

See `scripts/README.md` for detailed documentation of each script.

## 💡 Common Use Cases

### Debugging Login Issues
```bash
npm run script:show-users              # Check if user exists
npm run script:check-password          # Verify password hash
node scripts/set-password.js test123   # Reset password
```

### Setting Up Email
```bash
npm run script:test-email              # Verify SMTP works
```

### Database Reset
```bash
npm run script:delete-all-users        # Clear all users
npm run prisma:seed                    # Re-seed database
```

## ⚠️ Important Notes

- These scripts are for **development only**
- They directly access the database via Prisma
- They do NOT require the NestJS server to be running
- They are excluded from production builds (see `.dockerignore`)
