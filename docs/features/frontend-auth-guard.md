# Frontend Auth Guard — Current State & Discussion

## Overview

This document describes the current authentication guard situation in the
frontend and serves as a starting point for designing a consistent, robust auth
guard strategy.

---

## How Authentication Works Today

### Token Storage

The JWT token is stored in `localStorage` under the key `local_session`:

```json
{
  "user": { "id": "...", "email": "...", "user_metadata": { "role": "..." } },
  "session": { "access_token": "...", "expires_in": 3600, ... }
}
```

### AuthContext (`frontend/context/AuthContext.tsx`)

This is the central auth provider. On mount:

1. It reads `local_session` from `localStorage`.
2. It calls `fetchUserProfile(user.id)` which hits `GET /users/:id`.

**`GET /users/:id` is JWT-guarded** (`@UseGuards(AuthGuard('jwt'))` in
`backend/src/users/users.controller.ts`). If the token is expired or invalid,
the backend returns **401**. This makes the profile fetch a natural server-side
token validity check — no separate verify endpoint is needed.

#### Before the recent changes

The `catch` block in `fetchUserProfile` silently swallowed all errors:

```typescript
catch {
    if (fallbackMeta) setProfile(fallbackMeta);
}
```

A 401 was indistinguishable from a network error — the app fell back to
metadata from the JWT (which was decoded at login time), and the session was
never cleared. The user appeared logged in while the token was actually invalid.

#### After the recent changes

The `catch` block now distinguishes 401 from other errors thanks to a new
`ApiError` class (`frontend/lib/api.ts`) that preserves the HTTP status code:

```typescript
catch (err: any) {
    if (err instanceof ApiError && err.status === 401) {
        // Token invalid/expired — clear everything
        localStorage.removeItem('local_session');
        setUser(null);
        setSession(null);
        setProfile(null);
    } else if (fallbackMeta) {
        setProfile(fallbackMeta);
    }
}
```

Any 401 response from any API call now throws an `ApiError` with `status: 401`,
but **only `fetchUserProfile` reacts to it by clearing the session**. This was
deliberate: arbitrary API calls that happen to return 401 (e.g., a product
fetch with wrong permissions) should not log the user out.

---

## How Each Route Handles Auth Today

### Public pages (no auth required)

| Route | Auth check | Behavior |
|---|---|---|
| `/` (catalog) | `if (!user) setShowLoginModal(true)` | Shows inline `LoginModal` overlay; no redirect |
| `/catalog/...` | None | Renders normally; works without auth |
| `/auth/login` | None | Login form |
| `/auth/register` | None | Registration form |
| `/auth/forgot-password` | None | Password recovery form |
| `/auth/reset-password` | None | Password reset form |
| `/map` | None | Renders normally |

### Protected pages

| Route | Auth check | Behavior |
|---|---|---|
| `/profile` | `if (!user) router.push('/auth/login')` | Redirects to login if no session |
| `/orders` | **None** | Renders with error if API calls fail |
| `/orders/[id]` | **None** | Renders with error if API calls fail |
| `/checkout` | **None** | Renders with error if API calls fail |

### Role-based pages

| Route | Auth check | Role check | Behavior |
|---|---|---|---|
| `/admin/**` | **New** `AdminLayout` | `profile.role !== 'admin'` redirects to `/` | Redirects to login if no session |
| `/produccion/**` | **None** | **None** | Renders with error if API calls fail |
| `/delivery/**` | **None** | **None** | Renders with error if API calls fail |

### The admin layout (`frontend/app/admin/layout.tsx`)

The admin is the only section that has a proper, centralized auth guard via the
Next.js App Router file-system layout mechanism:

```
app/admin/layout.tsx   ← automatically wraps all pages under /admin/
app/admin/page.tsx
app/admin/products/page.tsx
...
```

The admin layout:
1. Waits for `isLoading` to finish (AuthContext has settled).
2. If no `session` → redirects to `/auth/login`.
3. If `profile.role !== 'admin'` → redirects to `/`.
4. Otherwise renders children.

This works reactively: if the token expires while on an admin page, the next
page navigation re-runs the layout's effect. A full page refresh also triggers
the check via AuthContext's mount-time `fetchUserProfile`.

---

## Current Gaps

1. **`/orders`, `/orders/[id]`, `/checkout`** — no auth guard at all.
2. **`/produccion/**`, `/delivery/**`** — no auth guard and no role check.
3. **No shared, reusable mechanism** — each page that does check auth
   (`/profile`, `/`, `/admin/**`) uses a different pattern (inline redirect,
   inline modal, file-system layout).
4. **No token validity check on client-side navigation** — the profile fetch
   only runs on full page load (AuthContext mount). Navigating between protected
   pages does not re-verify the token.

---

## Previous Approach Considered (Deleted)

A reusable `ProtectedRoute` component was written and then deleted. It would
have worked as a JSX wrapper:

```tsx
<ProtectedRoute requireRole="admin" redirectTo="/auth/login">
  <PageContent />
</ProtectedRoute>
```

The admin layout could have been refactored to use it internally. The issue was
that applying it to every protected page is manual and easy to forget.

---

## Open Questions for Discussion

1. **Shared component vs route-group layout vs per-section layouts?**
   - A shared `ProtectedRoute` component is flexible but must be manually
     added to every page.
   - A route group `(protected)/layout.tsx` would cover `/orders`,
     `/checkout`, `/profile` automatically, but requires moving files.
   - Per-section layouts like `admin/layout.tsx` are automatic for each
     segment but duplicate the guard logic.

2. **Should token re-validation happen on every navigation?**
   - Currently only on full page load (AuthContext mount).
   - Layout effects run on mount, not on every client-side navigation within
     the same layout — unless a `key` prop tied to the pathname forces a
     re-mount.
   - Could the profile fetch be triggered on router events?

3. **Should arbitrary 401s ever clear the session?**
   - Current rule: only the explicit profile-fetch 401 clears the session.
   - A truly expired token will cause 401s on every API call. A network-level
     interceptor could catch them, but that risks false positives (e.g.,
     calling a protected endpoint without auth headers on purpose).

4. **Role-redirect UX for produccion/delivery pages?**
   - If a non-produccion user lands on `/produccion`, should they be
     redirected to `/` (like admin) or to `/auth/login`?
   - Should there be a "not authorized" page with a message?

5. **Should the admin layout be the canonical pattern?**
   - It uses Next.js file-system conventions and requires zero per-page
     changes within the segment.
   - It does not protect against client-side navigation where the token
     expires mid-session (only page reloads trigger the check).
   - Is this good enough, or do we need a more active mechanism (e.g.,
     periodic heartbeat, fetch interceptor)?

6. **Edge cases to handle**
   - Network error during profile fetch — keep session or clear it?
   - User deleted from DB while logged in — profile fetch returns 404, not
     401. Should this also clear the session?
   - Multiple tabs — if a user logs out in one tab, the other tab still has
     the localStorage session until its next mount.
