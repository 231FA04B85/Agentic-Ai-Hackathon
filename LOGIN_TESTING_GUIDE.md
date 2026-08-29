# Login System Testing Guide

## 🚀 Quick Test

1. **Open in Browser**
   ```
   http://localhost/login.html
   ```

2. **Step 1: Mobile Number Input**
   - Enter: `9876543210`
   - Click: "Send OTP"
   - Expected: OTP step appears, timer starts

3. **Step 2: Verify OTP**
   - Check Browser Console for OTP (shown in log)
   - Or use: `123456` (hardcoded demo)
   - Enter OTP
   - Click: "Verify & Login"
   - Expected: Success message → Redirect to index.html

---

## 📋 Full Test Scenarios

### **Scenario 1: Valid Login Flow** ✅
```
1. Open login.html
2. Mobile: 9876543210
3. Send OTP
4. Check console: "[LOGIN] Demo OTP: 123456"
5. OTP: 123456
6. Verify & Login
7. Expected: Redirect to index.html
8. Check localStorage: user object exists
9. Check sessionStorage: authenticated = true
```

### **Scenario 2: Invalid Mobile Number** ❌
```
1. Open login.html
2. Mobile: 123 (too short)
3. Send OTP
4. Expected: Error "Phone number must be 10 digits"
5. Mobile: 0987654321 (starts with 0)
6. Send OTP
7. Expected: Error "Phone number must start with 6-9"
```

### **Scenario 3: Wrong OTP** ❌
```
1. Mobile: 9876543210
2. Send OTP
3. OTP: 000000 (wrong)
4. Verify & Login
5. Expected: Error "Invalid OTP. 4 attempt(s) remaining"
6. Try 4 more wrong codes
7. Expected: "Too many attempts" - Input disabled
```

### **Scenario 4: Expired OTP** ⏱️
```
1. Mobile: 9876543210
2. Send OTP (note time)
3. Wait 10+ minutes
4. OTP: 123456
5. Verify & Login
6. Expected: Error "OTP has expired. Please request a new OTP."
```

### **Scenario 5: Resend OTP** 🔄
```
1. Mobile: 9876543210
2. Send OTP
3. Wait <30 seconds
4. Click Resend OTP
5. Expected: "Please wait X seconds before resending"
6. Wait 30 seconds
7. Click Resend OTP
8. Expected: Success, new OTP generated, timer resets
9. Check console: New OTP shown
```

### **Scenario 6: Change Phone** ↩️
```
1. Mobile: 9876543210
2. Send OTP
3. Click "Change Phone"
4. Expected: Back to mobile input, form cleared
5. Mobile: 8765432109
6. Send OTP
7. Expected: Works with new number
```

### **Scenario 7: Page Refresh During OTP** 🔄
```
1. Mobile: 9876543210
2. Send OTP
3. OTP Step shows
4. Press F5 (refresh)
5. Expected: OTP step still shows, masked phone displayed
6. OTP: 123456
7. Verify
8. Expected: Logs in successfully
```

### **Scenario 8: Mobile Responsive** 📱
```
1. Open DevTools (F12)
2. Responsive Design Mode
3. Test Sizes:
   - Desktop (1024px): Two columns
   - Tablet (800px): Single column
   - Mobile (360px): Optimized layout
4. Expected: Layout adjusts, all interactive elements work
```

### **Scenario 9: Dark Mode** 🌙
```
1. Open login.html
2. Open DevTools Console
3. Run: document.documentElement.setAttribute('data-theme', 'dark')
4. Expected: Dark theme applied
5. Run: document.documentElement.setAttribute('data-theme', 'light')
6. Expected: Light theme applied
```

### **Scenario 10: Keyboard Navigation** ⌨️
```
1. Open login.html
2. Press Tab multiple times
3. Expected: Focus moves through all buttons/inputs
4. Focus on input, press Enter
5. Expected: Form submits
6. Expected: All focus indicators visible
```

---

## 🔍 Console Testing

### **Check OTP**
```javascript
// During OTP step:
console.log(otpManager.getOTP('9876543210'));
// Output: 6-digit OTP
```

### **Check Status**
```javascript
// Check OTP validity:
otpManager.getOTPStatus('9876543210');
// Output: {exists, isExpired, remainingSeconds, attempts, ...}
```

### **Check Resend Eligibility**
```javascript
// Can resend?
otpManager.canResendOTP('9876543210');
// Output: {canResend, message, remainingSeconds}
```

### **Check User Session**
```javascript
// After successful login:
console.log(JSON.parse(localStorage.getItem('user')));
// Output: {phoneNumber, loginTime, sessionId}

// Check auth flag:
console.log(sessionStorage.getItem('authenticated'));
// Output: true
```

### **Manually Generate OTP**
```javascript
// Generate for testing:
otpManager.generateOTP('9876543210');
// Check console log for OTP
```

---

## 🧪 Error Messages Test

### **Mobile Number Errors**
| Input | Expected Error |
|-------|-----------------|
| `123` | "Phone number must be 10 digits" |
| `12345678901` | Truncated to 10 digits |
| `0987654321` | "Phone number must start with 6-9" |
| `9876543210` | ✅ Valid |

### **OTP Errors**
| Scenario | Expected Error |
|----------|-----------------|
| Wrong OTP (1st) | "Invalid OTP. 4 attempt(s) remaining" |
| Wrong OTP (5th) | "Too many attempts" |
| Expired OTP | "OTP has expired" |
| Empty OTP | "Please enter a 6-digit OTP" |
| Partial OTP | "Please enter a 6-digit OTP" |

---

## 📊 Performance Testing

### **Load Time**
1. Open DevTools → Performance
2. Start recording
3. Open login.html
4. Stop recording
5. Expected: < 2 seconds load time

### **Animation Smoothness**
1. Open DevTools → Performance
2. Check 60 FPS during:
   - Form transitions
   - Button animations
   - Input focus states

---

## 🔐 Security Testing

### **No Credentials Exposed**
```javascript
// Check Network tab - should NOT contain:
// - OTP in request/response body (in demo)
// - OTP in URLs
// - API keys in plain text
```

### **Session Isolation**
1. Login in Tab A
2. Check localStorage/sessionStorage in Tab B
3. Open Tab C (private)
4. Expected: No access to Tab A's session

### **XSS Prevention**
1. Try injecting HTML in phone field:
   ```
   9876543210<img src=x onerror="alert('XSS')">
   ```
2. Expected: Treated as invalid phone, no execution

---

## 🎯 Integration Testing

### **Protected Route**
1. Add to index.html top:
   ```javascript
   if (!sessionStorage.getItem('authenticated')) {
       window.location.href = 'login.html';
   }
   ```
2. Open index.html directly
3. Expected: Redirected to login.html

### **Display User Info**
1. Add to dashboard:
   ```javascript
   const user = JSON.parse(localStorage.getItem('user'));
   document.getElementById('userName').textContent = user.phoneNumber;
   ```
2. Login successfully
3. Expected: Phone number shown in dashboard

### **Logout Function**
1. Add logout button
2. On click:
   ```javascript
   localStorage.removeItem('user');
   sessionStorage.removeItem('authenticated');
   window.location.href = 'login.html';
   ```
3. Expected: Redirects to login.html

---

## 📱 Mobile Device Testing

### **Real Device Testing**
- [ ] Test on Android (Chrome)
- [ ] Test on iOS (Safari)
- [ ] Test on tablet (landscape/portrait)
- [ ] Test with actual SMS receiving
- [ ] Test with keyboard appearing/disappearing

### **Touch Testing**
- [ ] Tap input fields
- [ ] Long-press buttons
- [ ] Swipe gestures
- [ ] Multi-touch scenarios

---

## 🌍 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ | Tested |
| Firefox | ✅ | Tested |
| Safari | ✅ | Tested |
| Edge | ✅ | Tested |
| Mobile Safari | ✅ | iOS |
| Chrome Mobile | ✅ | Android |

---

## ✅ Approval Checklist

- [ ] Mobile number validation works
- [ ] OTP generation works
- [ ] OTP verification works
- [ ] Timer counts down
- [ ] Resend button works after 30 seconds
- [ ] Change phone works
- [ ] Page refresh recovery works
- [ ] Responsive design works on all sizes
- [ ] Dark mode works
- [ ] Keyboard navigation works
- [ ] Error messages display correctly
- [ ] Session storage works
- [ ] Redirect to index.html works
- [ ] No console errors
- [ ] No security issues
- [ ] All animations smooth
- [ ] Performance acceptable

---

## 🐛 Bug Reporting Template

```
**Bug:**
- [Describe the issue]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:**
- [What should happen]

**Actual:**
- [What actually happens]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Tablet/Mobile]
- OS: [Windows/Mac/iOS/Android]

**Console Output:**
[Paste any errors from DevTools]

**Screenshots:**
[Attach if possible]
```

---

## 📞 Support Contacts

**For issues:**
1. Check this guide
2. Review console for errors
3. Check browser DevTools Network tab
4. Verify backend API endpoints
5. Test with demo credentials first

---

**Test Status:** Ready for QA
**Created:** August 29, 2026
**Updated:** Just now
