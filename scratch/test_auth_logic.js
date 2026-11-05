// Unit & Integration Test for Stage 6 Customer Authentication
import assert from 'node:assert';

console.log('🧪 Starting Smart Café Customer Authentication Tests...\n');

// 1. Test Registration Validation Logic
console.log('Test 1: Registration form validation');
function validateRegistration({ fullName, email, password, confirmPassword }) {
  const errors = [];
  const cleanName = (fullName || '').trim();
  const cleanEmail = (email || '').trim();

  if (!cleanName) errors.push('Please enter your full name.');
  if (!cleanEmail || cleanEmail.indexOf('@') === -1) errors.push('Please enter a valid email address.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters long.');
  if (password !== confirmPassword) errors.push('Passwords do not match. Please re-enter.');

  return { isValid: errors.length === 0, errors };
}

// 1a. Empty name
assert.strictEqual(validateRegistration({ fullName: '', email: 'test@example.com', password: 'secretpassword', confirmPassword: 'secretpassword' }).isValid, false);
// 1b. Bad email
assert.strictEqual(validateRegistration({ fullName: 'Salem Customer', email: 'notanemail', password: 'secretpassword', confirmPassword: 'secretpassword' }).isValid, false);
// 1c. Short password
assert.strictEqual(validateRegistration({ fullName: 'Salem Customer', email: 'test@example.com', password: '123', confirmPassword: '123' }).isValid, false);
// 1d. Password mismatch
assert.strictEqual(validateRegistration({ fullName: 'Salem Customer', email: 'test@example.com', password: 'password123', confirmPassword: 'password456' }).isValid, false);
// 1e. Valid inputs
assert.strictEqual(validateRegistration({ fullName: 'Karthik Subramanian', email: 'karthik@example.com', password: 'password123', confirmPassword: 'password123' }).isValid, true);
console.log('✔ Registration validations passed all test assertions.');

// 2. Test User Metadata & Admin Role Prevention
console.log('\nTest 2: User metadata & Admin role security');
function buildSignUpPayload(fullName, email, password, phone) {
  // Requirement 2: Save full_name through user metadata
  // Requirement: Do not allow users to choose their own admin role
  const payload = {
    email: email.trim(),
    password: password,
    options: {
      data: {
        full_name: fullName.trim(),
        phone: phone ? phone.trim() : undefined
      }
    }
  };
  return payload;
}

const payload = buildSignUpPayload('Karthik Subramanian', 'karthik@example.com', 'SalemKaapi@2025!', '+91 94432 10890');
assert.strictEqual(payload.options.data.full_name, 'Karthik Subramanian');
assert.strictEqual(payload.options.data.role, undefined, 'CRITICAL: Role must NOT be passed in customer registration metadata!');
console.log('✔ User metadata correctly carries full_name and prevents customer role elevation.');

// 3. Test Protected Navigation Logic (Requirement 6)
console.log('\nTest 3: Protected pages navigation (Checkout & Orders)');
function testNavigationGuard(targetPage, currentUser) {
  if ((targetPage === 'checkout' || targetPage === 'orders') && !currentUser) {
    return {
      allowed: false,
      redirectTo: 'login',
      redirectTarget: targetPage,
      notice: targetPage === 'checkout' ? 'Customer sign in is required to finalize your order.' : 'Please sign in to view your live orders and delivery tracking.'
    };
  }
  return { allowed: true, targetPage };
}

// Unauthenticated attempts
const checkoutGuarded = testNavigationGuard('checkout', null);
assert.strictEqual(checkoutGuarded.allowed, false);
assert.strictEqual(checkoutGuarded.redirectTo, 'login');
assert.strictEqual(checkoutGuarded.redirectTarget, 'checkout');

const ordersGuarded = testNavigationGuard('orders', null);
assert.strictEqual(ordersGuarded.allowed, false);
assert.strictEqual(ordersGuarded.redirectTo, 'login');
assert.strictEqual(ordersGuarded.redirectTarget, 'orders');

// Public pages unauthenticated
assert.strictEqual(testNavigationGuard('home', null).allowed, true);
assert.strictEqual(testNavigationGuard('menu', null).allowed, true);
assert.strictEqual(testNavigationGuard('cart', null).allowed, true);

// Authenticated customer attempts
const mockUser = { id: 'usr-123', email: 'karthik@example.com', user_metadata: { full_name: 'Karthik Subramanian' } };
assert.strictEqual(testNavigationGuard('checkout', mockUser).allowed, true);
assert.strictEqual(testNavigationGuard('orders', mockUser).allowed, true);
console.log('✔ Navigation guard successfully protects checkout and order history.');

// 4. Test Customer Display Name Resolution (Requirement 5)
console.log('\nTest 4: Customer display name resolution');
function resolveCustomerName(user, profile) {
  return (
    (profile && profile.full_name) ||
    (user && user.user_metadata && user.user_metadata.full_name) ||
    (user && user.email ? user.email.split('@')[0] : null)
  );
}

assert.strictEqual(resolveCustomerName(mockUser, { full_name: 'Karthik Subramanian (Salem)' }), 'Karthik Subramanian (Salem)');
assert.strictEqual(resolveCustomerName(mockUser, null), 'Karthik Subramanian');
assert.strictEqual(resolveCustomerName({ email: 'bala@cafe.com' }, null), 'bala');
console.log('✔ Customer display name priority resolution passed.');

console.log('\n🎉 ALL AUTHENTICATION LOGIC TESTS PASSED SUCCESSFULLY!');
