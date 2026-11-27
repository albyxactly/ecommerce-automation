# E-commerce Automation (Assessment II – Task 3)

End-to-end Playwright + TypeScript suite for [automationexercise.com](https://automationexercise.com) using the Page Object Model, custom fixtures, structured logging, and HTML reporting.

## Scope

**Happy path**

1. Sign Up
2. Login (logout → login cycle)
3. Search product
4. Select product
5. Add to Cart
6. Cart validation
7. Checkout with **fake payment UI only** (demo site — not a real purchase)

**Negative / edge scenarios**

- Invalid login credentials
- Duplicate signup email
- Empty signup email validation
- Invalid product search
- Cart remove + persistence across navigation
- Checkout payment required-field validation
- Back/nav during checkout preserves cart
- Guest checkout prompts Register/Login

## Prerequisites

- Node.js 18+
- Chromium (installed via Playwright)

```bash
npm install
npx playwright install chromium
```

## Configuration

Copy `.env.example` → `.env`:

| Variable | Purpose |
|---|---|
| `TEST_ENV` | `qa` / `staging` / `prod` (all point at the demo host) |
| `HEADLESS` | `true` / `false` |
| `WORKERS` | Parallel workers (default `2`) |
| `DEFAULT_TIMEOUT` / `NAVIGATION_TIMEOUT` | Timeouts in ms |
| `SCREENSHOT_ON_FAILURE` / `VIDEO_ON_FAILURE` / `TRACE_ON_RETRY` | Artifacts |

Environment profiles live in `config/environments.ts`.
`features.allowPurchase` is always `false`; `useFakePayment` enables demo payment UI only.

## Run tests

```bash
# Full suite (parallel workers from .env)
npm test

# Happy path only
npm run test:happy

# Negative / edge only
npm run test:negative

# Headed browser
npm run test:headed

# Playwright UI mode
npm run test:ui

# Typecheck
npm run lint:types
```

## Reports & artifacts

| Artifact | Location |
|---|---|
| HTML report | `reports/html` — open with `npm run report` |
| JSON results | `reports/results.json` |
| Winston logs | `reports/logs/test-run.log`, `errors.log` |
| Failure screenshots | `screenshots/` + Playwright attachments |
| Videos / traces | `test-results/` (retain-on-failure / on-first-retry) |

## Project structure

```
ecommerce-automation/
├── config/environments.ts
├── test-data/users.json
├── test-data/products.json
├── src/
│   ├── pages/          # POM (Base, Home, SignupLogin, AccountInfo, Products, Detail, Cart, Checkout)
│   ├── fixtures/       # Custom Playwright fixtures
│   ├── helpers/        # Reusable business flows
│   └── utils/          # Logger, test data, screenshots, error handling
├── tests/
│   ├── happy-path/
│   └── negative/
└── playwright.config.ts
```

## Safety note

This suite targets the **public demo** site only. Payment steps use clearly fake card data for UI confirmation and are gated by environment flags so they are never treated as a real monetary purchase.

## Test results

All **8** Playwright tests pass against `https://automationexercise.com` (Chromium, 2 parallel workers).
