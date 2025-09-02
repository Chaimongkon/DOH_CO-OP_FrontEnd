# Windows Build Issues & Solutions

## 🐛 Common Issues

### 1. EPERM Error: Operation not permitted
```
Error: EPERM: operation not permitted, open 'D:\...\\.next\trace'
```

### 2. Build Timeout
```
Creating an optimized production build ...
[Process hangs and times out]
```

### 3. Document is not defined (SSR Error)
```
ReferenceError: document is not defined
```

---

## ✅ Solutions Applied

### 1. **Permission Fix Script**
Created `scripts/fix-permissions.js` to handle Windows-specific issues:

```bash
# Run permission fixes
npm run fix-permissions

# Build with permission fixes
npm run build:win

# Development with fixes
npm run dev:win
```

**What it does:**
- Removes problematic `.next` directory
- Clears npm cache
- Sets appropriate environment variables
- Provides Windows-specific optimizations

---

### 2. **Next.js Configuration Updates**

**File: `next.config.mjs`**

```javascript
// Windows file system fixes
webpack: (config) => {
  if (process.platform === 'win32') {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    };
  }
  return config;
}
```

**Performance optimizations:**
- Disabled telemetry
- Reduced memory usage
- Optimized bundle splitting
- Added polling for file watching

---

### 3. **SSR Compatibility Fixes**

**File: `src/lib/analytics.ts`**

```typescript
// Browser environment checks
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  this.initializeWebVitals();
  this.trackUserInteractions();
}

// Safe analytics instance creation
export const analytics = typeof window !== 'undefined' ? new Analytics() : null;
```

**File: `src/components/AnalyticsProvider.tsx`**

```typescript
// Null-safe analytics usage
if (analytics) {
  analytics.trackPageView(pathname);
}
```

---

### 4. **Environment Configuration**

**File: `.env.local.example`**

```env
# Performance optimization
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS="--max-old-space-size=4096"

# Database config
DATABASE_URL=mysql://username:password@localhost:3306/database_name
REDIS_URL=redis://localhost:6379
```

---

## 🚀 Recommended Workflow

### **Development:**
```bash
# Method 1: Use Windows-optimized command
npm run dev:win

# Method 2: Manual environment setup
set NEXT_TELEMETRY_DISABLED=1
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
```

### **Production Build:**
```bash
# Method 1: Use Windows-optimized build
npm run build:win

# Method 2: Manual cleanup + build
npm run fix-permissions
npm run build
```

### **Troubleshooting:**
```bash
# Clean everything
npm run clean

# Check for permission issues
npm run fix-permissions

# Verify environment
node -v
npm -v
```

---

## 🛠️ Alternative Solutions

### **1. Use WSL2 (Recommended)**
```bash
# Install WSL2 with Ubuntu
wsl --install Ubuntu

# Run development in WSL2
cd /mnt/d/path/to/project
npm run dev
```

### **2. Use Docker**
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### **3. Run as Administrator**
- Right-click terminal/PowerShell
- Select "Run as administrator"
- Navigate to project and run commands

---

## 📊 Performance Optimizations Applied

### **Memory Management:**
- `NODE_OPTIONS="--max-old-space-size=4096"`
- Webpack memory optimization
- Bundle splitting by vendor

### **File System:**
- Polling instead of native file watching
- Ignore node_modules in watchers
- Optimized cache management

### **Build Process:**
- Disabled unnecessary telemetry
- Removed console logs in production
- Optimized package imports

---

## 🔍 Monitoring & Debugging

### **Check Build Performance:**
```bash
# Analyze bundle
npm run analyze

# Time the build process
time npm run build

# Monitor memory usage
npm run build --verbose
```

### **Debug Permission Issues:**
```bash
# Check file permissions
icacls .next

# List running Node processes
tasklist | findstr node

# Kill problematic processes
taskkill /F /IM node.exe
```

---

## 🎯 Best Practices

### **1. Regular Cleanup**
```bash
# Weekly cleanup routine
npm run clean
npm ci
npm audit fix
```

### **2. Environment Management**
- Use `.env.local` for local settings
- Set NODE_OPTIONS globally in Windows
- Keep dependencies updated

### **3. Development Setup**
- Use fast SSD for project files
- Exclude project from Windows Defender
- Use Git Bash instead of Command Prompt

---

## ✅ Current Status

- ✅ **SSR Issues**: Fixed with browser environment checks
- ✅ **Permission Script**: Created and working
- ✅ **Configuration**: Optimized for Windows
- ⚠️ **Build Timeout**: May require manual intervention or alternative methods

**Note**: If build continues to timeout, recommend using WSL2 or Docker for development.