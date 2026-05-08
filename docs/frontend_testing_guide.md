# Frontend Testing Guide — PJ Air

## The short answer to your questions

| Question | Answer |
|---|---|
| Do they simulate a browser? | **Partly.** Unit/integration tests run in Node using a fake DOM (jsdom). Only E2E tools spin up a real browser. |
| Do they simulate the server? | **No.** You mock `fetch` or your `api` module. The backend never runs during unit/integration tests. |
| Are we forced to test E2E in a real browser anyway? | **No** — for most things. You only need E2E for flows that rely on real navigation, cookies, or full-page rendering. |

---

## The Frontend Testing Pyramid

```
         ▲
        / \       E2E (Playwright)
       /   \      "Does the full flow work in a real browser?"
      /─────\
     /       \    Integration (RTL)
    /         \   "Do my components + contexts work together?"
   /───────────\
  /             \  Unit (Vitest/Jest)
 /               \ "Does this pure function/hook return the right value?"
/─────────────────\
```

Unlike the backend where everything is deterministic (NestJS services, DB), the frontend has an extra concern: **the DOM** — things render, buttons appear, text changes. React Testing Library (RTL) is the standard way to test this *without* a real browser.

---

## Standard Toolchain for a Next.js Project

| Tool | What it does | Analogy from your backend |
|---|---|---|
| **Vitest** (or Jest) | Test runner, assertions, coverage | Jest in NestJS |
| **@testing-library/react** | Renders components in a fake DOM, lets you query/click them | Supertest for HTTP |
| **@testing-library/user-event** | Simulates real user input (typing, clicking) | Sending a request body |
| **jsdom** | The fake DOM/browser environment that runs in Node | SQLite in-memory DB |
| **msw** (Mock Service Worker) | Intercepts `fetch` calls and returns fake responses | Mocking a NestJS service |
| **Playwright** | Launches a REAL browser for true E2E | Your existing E2E tests |

---

## What Does "Fake DOM" Mean?

When you run `vitest` or `jest`, your tests run in **Node.js** — not a browser. To make React work, the test environment uses **jsdom**, which is a JavaScript implementation of the browser's DOM/window/document APIs.

This means:
- `document.querySelector(...)` works ✅
- `localStorage.setItem(...)` works ✅
- CSS actually rendering visually ❌ (it's not a real browser)
- Real network requests ❌ (you must mock `fetch`)

**For `AuthContext` and `CartContext` specifically**, jsdom is enough — they use `localStorage` and React state, which jsdom handles perfectly.

---

## What Are We Supposed to Cover?

Looking at *your* codebase, here's what's worth testing at each level:

### 🔵 Unit Tests — Pure Logic, No DOM

These are the easiest. No React, no rendering. Just pure functions.

**Your best candidates:**
- `lib/products.ts` — The `PRODUCTS` array (data integrity: do all items have required fields?)
- `CartContext.tsx` price calculation functions — `getRawSubtotal`, `getDiscountedSubtotal`, `getFinalTotal`
- `lib/api.ts` — `handleResponse` behavior (throws on non-ok, parses JSON, handles empty body)

### 🟡 Integration Tests — Components + Hooks Together (RTL)

These render a real React tree in jsdom and interact with it like a user would.

**Your best candidates:**
- `CartContext` — Add item, update quantity, remove item, check totals with discounts
- `AuthContext` — Does it read `localStorage` on mount? Does `signOut` clear state?
- `LanguageContext` — Does `setLocale` change the `t` translations object?
- `useApiCall` hook — Does it set `loading → data` on success? `loading → error` on failure?
- `LoginForm` / `RegisterForm` components — Do they show validation errors? Do they call the API?

### 🔴 E2E Tests — Playwright (Real Browser)

Only needed for flows that require real navigation, cookies, or Next.js server-side behavior.

**Candidates in your project:**
- Full login flow → redirect to catalog
- Adding to cart → navigating to checkout → seeing correct totals
- Admin-only page access (role-based redirect)

> **Verdict:** You can cover 80% of confidence with unit + integration tests. E2E is reserved for the 3-4 critical user flows.

---

## Concrete Code Examples From YOUR Project

### Example 1: Unit Test — `CartContext` Price Calculations

The price logic in `CartContext` is pure math applied to state. You can extract and test it directly.

```typescript
// frontend/__tests__/cart-pricing.test.ts
import { describe, it, expect } from 'vitest';

// The logic we're testing (extracted from CartContext):
function getRawSubtotal(
  cart: { id: number; price: number; originalPrice: number; quantity: number }[],
  productDiscounts: { product_id: number; special_price?: number; discount_percentage?: number }[]
) {
  return cart.reduce((total, item) => {
    let itemPrice = item.originalPrice || item.price;
    const pd = productDiscounts.find(d => Number(d.product_id) === Number(item.id));
    if (pd) {
      if (pd.special_price)        itemPrice = Number(pd.special_price);
      else if (pd.discount_percentage) itemPrice = itemPrice * (1 - Number(pd.discount_percentage) / 100);
    }
    return total + itemPrice * item.quantity;
  }, 0);
}

describe('Cart pricing', () => {
  it('sums items at their original price with no discounts', () => {
    const cart = [
      { id: 1, price: 4.95, originalPrice: 4.95, quantity: 2 },
      { id: 2, price: 3.25, originalPrice: 3.25, quantity: 1 },
    ];
    expect(getRawSubtotal(cart, [])).toBe(13.15);
  });

  it('applies a product-specific percentage discount', () => {
    const cart = [{ id: 1, price: 10, originalPrice: 10, quantity: 1 }];
    const discounts = [{ product_id: 1, discount_percentage: 20 }]; // 20% off
    expect(getRawSubtotal(cart, discounts)).toBe(8);
  });

  it('applies a special_price override instead of percentage', () => {
    const cart = [{ id: 1, price: 10, originalPrice: 10, quantity: 3 }];
    const discounts = [{ product_id: 1, special_price: 7 }]; // fixed price of 7
    expect(getRawSubtotal(cart, discounts)).toBe(21); // 7 × 3
  });
});
```

### Example 2: Unit Test — `lib/api.ts` Error Handling

```typescript
// frontend/__tests__/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api.get()', () => {
  beforeEach(() => mockFetch.mockClear());

  it('returns parsed JSON on a 200 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ name: 'Cookie Croissant' }),
    });

    const result = await api.get('/products/1');
    expect(result).toEqual({ name: 'Cookie Croissant' });
  });

  it('throws an Error with the server message on a non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ message: 'Not found' }),
    });

    await expect(api.get('/products/999')).rejects.toThrow('Not found');
  });

  it('handles an empty body without crashing', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '' });
    const result = await api.get('/healthz');
    expect(result).toEqual({});
  });
});
```

### Example 3: Integration Test — `AuthContext` with RTL

This is where it gets interesting. You **render** the provider, interact with it, and check the DOM.

```typescript
// frontend/__tests__/AuthContext.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock the api module so we don't make real HTTP calls
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      profile: { name: 'Test User' },
      role: 'client',
      general_discount: 0,
      delivery_fee: 0,
      productDiscounts: [],
    }),
  },
}));

// A tiny helper component that reads the context and shows values in the DOM
function AuthDisplay() {
  const { user, isLoading, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.email : 'no-user'}</span>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no user when localStorage is empty', async () => {
    await act(async () => render(<AuthProvider><AuthDisplay /></AuthProvider>));

    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('restores user from localStorage on mount', async () => {
    localStorage.setItem('local_session', JSON.stringify({
      user: { id: 'u1', email: 'test@test.com', user_metadata: {} },
      session: { access_token: 'tok' },
    }));

    await act(async () => render(<AuthProvider><AuthDisplay /></AuthProvider>));

    expect(screen.getByTestId('user').textContent).toBe('test@test.com');
  });

  it('clears user and localStorage on signOut', async () => {
    localStorage.setItem('local_session', JSON.stringify({
      user: { id: 'u1', email: 'test@test.com', user_metadata: {} },
      session: {},
    }));

    await act(async () => render(<AuthProvider><AuthDisplay /></AuthProvider>));

    // Click sign out
    await act(async () => screen.getByText('Sign Out').click());

    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(localStorage.getItem('local_session')).toBeNull();
  });
});
```

### Example 4: Integration Test — `useApiCall` Hook

```typescript
// frontend/__tests__/useApiCall.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiCall } from '@/hooks/useApiCall';

describe('useApiCall', () => {
  it('starts in loading state when immediate=true', () => {
    const fn = vi.fn(() => new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useApiCall(fn, true));
    expect(result.current.loading).toBe(true);
  });

  it('sets data on success', async () => {
    const fn = vi.fn().mockResolvedValue({ id: 1, name: 'Croissant' });
    const { result } = renderHook(() => useApiCall(fn, true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({ id: 1, name: 'Croissant' });
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useApiCall(fn, true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('can be triggered manually when immediate=false', async () => {
    const fn = vi.fn().mockResolvedValue([1, 2, 3]);
    const { result } = renderHook(() => useApiCall(fn, false));

    expect(result.current.loading).toBe(false); // didn't auto-fetch
    expect(fn).not.toHaveBeenCalled();

    await act(async () => result.current.execute());

    expect(result.current.data).toEqual([1, 2, 3]);
  });
});
```

---

## How to Set It Up

Everything above runs with **Vitest** (preferred for Next.js + Vite-ecosystem) + React Testing Library. Here's what needs to be installed:

```bash
cd frontend
npm install --save-dev vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Add a `vitest.config.ts` to `frontend/`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',        // fake browser DOM
    globals: true,               // no need to import describe/it/expect
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }, // match your tsconfig @/ alias
  },
});
```

Add `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom'; // adds matchers like .toBeInTheDocument()
```

Add the test script to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

## Do We Still Need Manual E2E Testing?

**Mostly no**, if you have good integration tests. But there are scenarios only a real browser can catch:

| Scenario | Unit/RTL covers it? | Needs real browser? |
|---|---|---|
| CartContext price math | ✅ Yes | No |
| AuthContext localStorage read | ✅ Yes (jsdom) | No |
| Login form validation UX | ✅ Yes (RTL) | No |
| Next.js server-side redirect (middleware) | ❌ No | Yes (Playwright) |
| Google Maps rendering | ❌ No | Yes |
| Supabase OAuth popup | ❌ No | Yes |
| Cart persists across page navigation | Partially | Better with Playwright |

**Recommended split:**
- ~80% of tests: Vitest + RTL (fast, run in CI in seconds)
- ~20%: 3-5 Playwright E2E scenarios for the most critical user journeys (login, checkout, admin access)

---

## Priority Order for This Project

1. **`CartContext` pricing** — most complex business logic, pure math, easy to get wrong silently
2. **`useApiCall`** — used everywhere, needs all 3 states covered (loading, success, error)
3. **`lib/api.ts`** — error handling and JSON parsing edge cases
4. **`AuthContext`** — session restore, signOut, role propagation
5. **`LanguageContext`** — locale priority (user pref > admin default)
6. **`LoginForm` / `RegisterForm`** — validation and API call triggering
7. **Playwright E2E** — login flow, checkout flow, admin-only page guard
