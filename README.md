# cookie-consent-manager

A lightweight, framework-agnostic module for collecting and storing cookie consent preferences. It provides a cookie banner and preference management modal that can support KVKK/GDPR compliance workflows.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/cookie-consent-manager.svg)](https://www.npmjs.com/package/cookie-consent-manager)

---

## Table of Contents

- [Core Principle](#core-principle)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
  - [Vanilla HTML (UMD)](#1-vanilla-html-umd)
  - [ESM / Bundler](#2-esm--bundler)
  - [Localized Category Definitions](#3-localized-category-definitions)
  - [Adding a Language](#4-adding-a-language)
  - [Laravel Blade Integration](#5-laravel-blade-integration)
  - [Reading Cookies Server-Side](#6-reading-cookies-server-side)
- [API Reference](#api-reference)
  - [Static Methods](#static-methods)
  - [Configuration (CookieConsentConfig)](#configuration-cookieconsentconfig)
  - [Category Configuration (CategoryConfig)](#category-configuration-categoryconfig)
  - [Cookie Item (CookieItem)](#cookie-item-cookieitem)
  - [Theme Configuration (ThemeConfig)](#theme-configuration-themeconfig)
  - [Consent Payload (ConsentPayload)](#consent-payload-consentpayload)
- [Written Cookies](#written-cookies)
- [Callback Lifecycle](#callback-lifecycle)
- [CSP Compatibility](#csp-compatibility)
- [Header Image](#header-image)
- [Internationalization (i18n)](#internationalization-i18n)
- [Developer Responsibility](#developer-responsibility)
- [License](#license)

---

## Core Principle

> **This package only collects the user's cookie consent preferences and stores them as consent cookies.** It does not inject, remove, delete, or block any third-party script, cookie, or network request. Developers are responsible for loading their own integrations conditionally by reading the preference cookies or using the package callbacks.

This package is a preference collection tool. It can support KVKK/GDPR compliance workflows, but it is not a legal compliance guarantee by itself.

---

## Installation

```bash
npm install cookie-consent-manager
```

---

## Quick Start

```html
<script src="node_modules/cookie-consent-manager/dist/cookie-consent-manager.umd.js"></script>
<script>
  CookieConsentManager.init({
    language: 'en',
    categories: [
      {
        id: 'required',
        required: true,
        title: 'Required Cookies',
        description: 'These cookies are required for the core functions of the website.',
        cookies: [
          { name: 'XSRF-TOKEN', provider: 'Site', purpose: 'Security', expiry: 'Session', party: 'first' }
        ]
      },
      {
        id: 'analytics',
        title: 'Analytics Cookies',
        description: 'These cookies help us understand how our website is used.',
        cookies: [
          { name: '_ga', provider: 'Google Analytics', purpose: 'Visitor analytics', expiry: '2 years', party: 'third' }
        ]
      }
    ],
    policyUrl: '/cookie-policy.pdf',
    onReady(payload) {
      if (payload?.preferences.analytics) loadAnalytics();
    },
    onSave({ preferences }) {
      if (preferences.analytics) loadAnalytics();
    }
  });
</script>
```

---

## Usage Examples

### 1. Vanilla HTML (UMD)

The UMD build exposes a global `CookieConsentManager` object. It can be used directly with a `<script>` tag.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example Site</title>
</head>
<body>
  <h1>My Website</h1>

  <script src="node_modules/cookie-consent-manager/dist/cookie-consent-manager.umd.js"></script>
  <script>
    CookieConsentManager.init({
      language: 'en',
      categories: [
        {
          id: 'required',
          required: true,
          title: 'Required Cookies',
          description: 'These cookies are required for the core functions of the website and cannot be disabled.',
          cookies: [
            { name: 'XSRF-TOKEN', provider: 'Site', purpose: 'Security', expiry: 'Session', party: 'first' }
          ]
        },
        {
          id: 'analytics',
          title: 'Analytics Cookies',
          description: 'These cookies help us understand how our website is used.',
          cookies: [
            { name: '_ga', provider: 'Google Analytics', purpose: 'Visitor analytics', expiry: '2 years', party: 'third' }
          ]
        }
      ],
      policyUrl: '/cookie-policy.pdf',
      onReady(payload) {
        if (payload?.preferences.analytics) loadAnalytics();
      },
      onSave({ preferences }) {
        if (preferences.analytics) loadAnalytics();
      }
    });

    function loadAnalytics() {
      if (window.__analyticsLoaded) return;
      window.__analyticsLoaded = true;

      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
      script.async = true;
      document.head.appendChild(script);
    }
  </script>
</body>
</html>
```

### 2. ESM / Bundler

Use the ESM build with modern bundlers such as Vite, Webpack, or Rollup.

```typescript
import CookieConsentManager from 'cookie-consent-manager';

CookieConsentManager.init({
  language: 'en',
  categories: [
    {
      id: 'required',
      required: true,
      title: 'Required Cookies',
      description: 'These cookies are essential for the basic functions of the website.',
      cookies: [
        { name: 'XSRF-TOKEN', provider: 'Site', purpose: 'Security', expiry: 'Session', party: 'first' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      description: 'These cookies help us understand how our website is used.',
      cookies: [
        { name: '_ga', provider: 'Google Analytics', purpose: 'Visitor analytics', expiry: '2 years', party: 'third' }
      ]
    }
  ],
  policyUrl: '/cookie-policy.pdf',
  onAccept({ preferences }) {
    if (preferences.analytics) loadAnalytics();
  },
  onReject() {
    removeAnalytics();
  }
});
```

### 3. Localized Category Definitions

Category and cookie text can be defined as either a plain `string` for one language or an object such as `{ tr: '...', en: '...' }` for multiple languages.

```typescript
CookieConsentManager.init({
  language: 'en',
  categories: [
    {
      id: 'analytics',
      title: { en: 'Analytics Cookies', de: 'Analyse-Cookies' },
      description: {
        en: 'These cookies help us understand how our website is used.',
        de: 'Diese Cookies helfen uns zu verstehen, wie unsere Website genutzt wird.'
      },
      cookies: [
        {
          name: '_ga',
          provider: { en: 'Google Analytics', de: 'Google Analytics' },
          purpose: { en: 'Analytics', de: 'Analyse' },
          expiry: { en: '2 years', de: '2 Jahre' },
          party: 'third'
        }
      ]
    }
  ]
});
```

Switch language at runtime:

```typescript
CookieConsentManager.setLanguage('tr');
```

### 4. Adding a Language

Use the `translations` option to override existing languages or add a new UI language. The type is `Record<string, DeepPartial<TranslationSet>>`, so you may provide only the keys you want to override. Missing keys fall back to built-in translations.

```typescript
CookieConsentManager.init({
  language: 'de',
  translations: {
    de: {
      banner: {
        description: 'Wir verwenden Cookies, um Ihnen die bestmogliche Erfahrung auf unserer Website zu bieten. {policyLink}',
        acceptAll: 'Alle akzeptieren',
        rejectAll: 'Alle ablehnen',
        manage: 'Verwalten',
        ariaLabel: 'Cookie-Einwilligung'
      },
      modal: {
        title: 'Cookie-Einstellungen',
        requiredNote: 'Diese Cookies sind fur die Grundfunktionen der Website erforderlich.',
        optionalNote: 'Diese Cookies helfen uns zu verstehen, wie unsere Website genutzt wird.',
        savePreferences: 'Einstellungen speichern',
        acceptAll: 'Alle akzeptieren',
        rejectAll: 'Alle ablehnen',
        policyLink: 'Um die Cookie-Richtlinie anzuzeigen,',
        policyClick: 'klicken Sie hier',
        policyDocument: 'Cookie-Richtlinie',
        close: 'Schliessen'
      },
      table: {
        cookieName: 'Cookie-Name',
        provider: 'Anbieter',
        description: 'Beschreibung',
        purpose: 'Zweck',
        expiry: 'Gultigkeit',
        party: 'Partei',
        firstParty: 'Erste Partei',
        thirdParty: 'Dritte Partei',
        session: 'Sitzung',
        permanent: 'Dauerhaft'
      }
    }
  },
  categories: [
    {
      id: 'analytics',
      title: { de: 'Analyse-Cookies' },
      description: { de: 'Diese Cookies helfen uns, die Nutzung unserer Website zu verstehen.' },
      cookies: [
        {
          name: '_ga',
          provider: { de: 'Google Analytics' },
          purpose: { de: 'Besucheranalyse' },
          expiry: { de: '2 Jahre' },
          party: 'third'
        }
      ]
    }
  ]
});
```

### 5. Laravel Blade Integration

This package is not Laravel-specific, but it can be used in a Blade layout like any other browser-side script.

```blade
{{-- resources/views/layouts/app.blade.php --}}

<script src="{{ asset('vendor/cookie-consent-manager/cookie-consent-manager.umd.js') }}"></script>
<script>
  CookieConsentManager.init({
    language: 'en',
    categories: @json($cookieCategories),
    policyUrl: '{{ asset("storage/cookies/policy.pdf") }}',
    onReady(payload) {
      if (payload?.preferences.analytics) {
        window.dispatchEvent(new CustomEvent('cookie-preferences:analytics-accepted'));
      }
    },
    onSave({ preferences }) {
      if (preferences.analytics) {
        window.dispatchEvent(new CustomEvent('cookie-preferences:analytics-accepted'));
      }
    }
  });
</script>
```

Passing categories from a controller:

```php
public function index()
{
    return view('app', [
        'cookieCategories' => [
            [
                'id' => 'required',
                'required' => true,
                'title' => 'Required Cookies',
                'description' => 'These cookies are required for the core functions of the website.',
                'cookies' => [
                    ['name' => 'XSRF-TOKEN', 'provider' => 'Site', 'purpose' => 'Security', 'expiry' => 'Session', 'party' => 'first']
                ]
            ],
            [
                'id' => 'analytics',
                'title' => 'Analytics Cookies',
                'description' => 'These cookies collect usage statistics.',
                'cookies' => [
                    ['name' => '_ga', 'provider' => 'Google Analytics', 'purpose' => 'Analytics', 'expiry' => '2 years', 'party' => 'third']
                ]
            ]
        ]
    ]);
}
```

### 6. Reading Cookies Server-Side

The package only writes preference cookies. You can read those cookies server-side to decide whether to render or load optional integrations.

**Generic cookie example:**

```http
Cookie: ccm_decision=accepted_all; ccm_preferences=%7B%22analytics%22%3Atrue%7D
```

Cookie values are URL-encoded when written by the browser. When reading raw cookies server-side, decode the value before parsing JSON.

**Generic PHP example:**

```php
$raw = $_COOKIE['ccm_preferences'] ?? null;
$preferences = $raw ? json_decode(urldecode($raw), true) : [];

if ($preferences['analytics'] ?? false) {
    // Load analytics scripts.
}
```

**Laravel example:**

```php
$raw = request()->cookie('ccm_preferences');
$preferences = $raw ? json_decode(urldecode($raw), true) : [];

if ($preferences['analytics'] ?? false) {
    // Load analytics scripts.
}
```

```php
$decision = request()->cookie('ccm_decision');

if ($decision === 'accepted_all') {
    // Load all optional third-party scripts.
}
```

Example middleware pattern:

```php
class CheckCookieConsent
{
    public function handle($request, Closure $next)
    {
        $raw = $request->cookie('ccm_preferences');
        $preferences = $raw ? json_decode(urldecode($raw), true) : [];

        View::share('cookieConsent', [
            'analytics' => $preferences['analytics'] ?? false,
            'marketing' => $preferences['marketing'] ?? false,
        ]);

        return $next($request);
    }
}
```

> In the browser, `CookieConsentManager.getPreferences()` returns decoded preferences. On the server, raw cookie values may still require `urldecode` because the browser writes the JSON value in URL-encoded form.

> Some server-side frameworks process cookies through middleware, parsers, signing, or encryption layers. If you read `ccm_preferences` on the server, verify how your framework exposes client-written cookies.

---

## API Reference

### Static Methods

| Method | Description |
|--------|-------------|
| `CookieConsentManager.init(config)` | Starts the banner. If stored consent exists, `onReady` receives a `ConsentPayload`; otherwise the banner is shown and `onReady` receives `null`. Calling `init` again destroys the previous instance first. |
| `CookieConsentManager.destroy()` | Removes the banner/modal DOM, removes injected styles, and resets the instance. It does not delete consent cookies. |
| `CookieConsentManager.setLanguage(lang)` | Changes the UI language at runtime. The active banner/modal is recreated. |
| `CookieConsentManager.getPreferences()` | Returns stored preferences, or `null` if there is no valid consent. |
| `CookieConsentManager.reset()` | Deletes preference cookies and shows the banner again. |

---

### Configuration (CookieConsentConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `categories` | `CategoryConfig[]` | - | **Required.** Cookie categories shown to the user. |
| `domain` | `string` | `undefined` | Cookie domain. If omitted, cookies are host-only, which is recommended for localhost/IP usage. |
| `path` | `string` | `'/'` | Cookie path. |
| `cookieExpiry` | `number` | `365` | Consent cookie lifetime in days. |
| `cookiePrefix` | `string` | `'ccm_'` | Prefix used for consent cookie names. |
| `sameSite` | `'Lax' \| 'Strict' \| 'None'` | `'Lax'` | SameSite attribute. `SameSite=None` requires `Secure` in modern browsers, so it should be used over HTTPS. For local HTTP development, prefer `SameSite=Lax`. |
| `secure` | `boolean \| 'auto'` | `'auto'` | Secure attribute. `'auto'` enables Secure automatically on HTTPS pages. If `sameSite: 'None'` is selected, Secure is treated as required and is added automatically. |
| `policyVersion` | `string` | `undefined` | Policy version. If it changes, existing consent becomes invalid and the banner is shown again. |
| `language` | `string` | `'tr'` | UI language. Built-in languages are `'tr'` and `'en'`. |
| `translations` | `Record<string, DeepPartial<TranslationSet>>` | `{}` | UI translation overrides or new language definitions. |
| `theme` | `ThemeConfig` | - | Visual theme options. |
| `styleMode` | `'inline' \| 'nonce'` | `'inline'` | CSS injection mode. `external` is not supported in v1. |
| `styleNonce` | `string` | `undefined` | CSP nonce value used with `styleMode: 'nonce'`. |
| `policyUrl` | `string` | `undefined` | URL of the cookie policy document. |
| `onReady` | `(payload \| null) => void` | - | Called once during initialization. Receives `payload` if valid consent exists, otherwise `null`. |
| `onSave` | `(payload) => void` | - | Called after every save action: accept all, reject all, or custom preferences. |
| `onAccept` | `(payload) => void` | - | Called only when the user selects "Accept All". |
| `onReject` | `(payload) => void` | - | Called only when the user selects "Reject All". |
| `onChange` | `(payload) => void` | - | Called only when the user saves custom preferences. |

---

### Category Configuration (CategoryConfig)

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Category identifier. It is used as the key in the preferences object. |
| `required` | `boolean` | If `true`, the category cannot be disabled and is always accepted. |
| `title` | `LocalizedString` | Category title. A `string` or an object such as `{ tr: '...', en: '...' }`. |
| `description` | `LocalizedString` | Category description. |
| `cookies` | `CookieItem[]` | List of cookies in this category. Displayed in the details table. |

---

### Cookie Item (CookieItem)

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Cookie name. |
| `provider` | `LocalizedString` | Cookie provider. |
| `description` | `LocalizedString` | Optional cookie description. |
| `purpose` | `LocalizedString` | Cookie purpose. |
| `expiry` | `LocalizedString` | Cookie lifetime. |
| `party` | `'first' \| 'third'` | First-party or third-party cookie. |

---

### Theme Configuration (ThemeConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `primaryColor` | `string` | `'#FF671D'` | Primary color used for buttons and toggles. |
| `secondaryColor` | `string` | `undefined` | Optional secondary accent color. |
| `textColor` | `string` | `'#272727'` | Text color. |
| `backgroundColor` | `string` | `'#ffffff'` | Background color. |
| `position` | `'bottom' \| 'top'` | `'bottom'` | Banner position. |
| `borderRadius` | `string` | `'20px'` | Border radius. |
| `headerImage` | `'default' \| 'none' \| string` | `'default'` | Modal header image. See [Header Image](#header-image). |

---

### Consent Payload (ConsentPayload)

All callbacks receive this `payload` object:

```typescript
interface ConsentPayload {
  decision: 'accepted_all' | 'rejected_all' | 'custom';
  preferences: Record<string, boolean>;    // { required: true, analytics: false }
  acceptedCategories: string[];            // ['required', 'analytics']
  rejectedCategories: string[];            // ['marketing']
  savedAt: string;                         // ISO timestamp
  policyVersion?: string;                  // Policy version
}
```

---

## Written Cookies

When the user saves a choice, the following cookies are written with the default `ccm_` prefix:

| Cookie | Value | Example |
|--------|-------|---------|
| `ccm_decision` | `accepted_all`, `rejected_all`, or `custom` | `accepted_all` |
| `ccm_preferences` | JSON preferences object | `%7B%22required%22%3Atrue%2C%22analytics%22%3Afalse%7D` |
| `ccm_saved_at` | ISO timestamp | `2026-04-28T12:00:00.000Z` |
| `ccm_policy_version` | Configured policy version | `1.2` |

If `cookiePrefix` is changed, cookie names change accordingly, for example `myapp_decision`.

---

## Callback Lifecycle

```text
init() is called
  |
  |-- Stored consent EXISTS -> onReady(payload)
  |
  `-- Stored consent MISSING -> onReady(null) + banner is shown
                                |
              ---------------------------------------
              |                  |                  |
        Accept All          Reject All       Save Preferences
              |                  |                  |
        onSave(payload)    onSave(payload)    onSave(payload)
        onAccept(payload)  onReject(payload)  onChange(payload)
```

- **`onReady`** is called during `init()`. It receives a payload when valid consent exists, otherwise `null`.
- **`onSave`** is called after every save action: accept, reject, or custom preferences. It is a good place for synchronization or common side effects.
- **`onAccept`** is called only when the user selects "Accept All".
- **`onReject`** is called only when the user selects "Reject All".
- **`onChange`** is called only when the user saves custom preferences.

> **Note:** Callbacks, especially `onReady`, may be triggered more than once, for example after `setLanguage()`. Script loader callbacks should be idempotent.

---

## CSP Compatibility

The package supports two CSS injection modes for Content Security Policy (CSP) compatibility.

### Default Mode (Inline)

`styleMode: 'inline'` injects CSS as a `<style>` tag. This works in most projects.

**Apache:**

```apache
Header always set Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline';"
```

**Nginx:**

```nginx
add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline';" always;
```

### Nonce Mode

Use `styleMode: 'nonce'` when your CSP `style-src` directive uses a nonce. Pass the nonce through `styleNonce`.

```typescript
CookieConsentManager.init({
  styleMode: 'nonce',
  styleNonce: document.querySelector('meta[name="csp-nonce"]')?.content || '',
  categories: [/* ... */]
});
```

**Apache:**

```apache
Header always set Content-Security-Policy "default-src 'self'; style-src 'self' 'nonce-%{CSP_NONCE}e';"
```

**Nginx:**

```nginx
add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'nonce-$csp_nonce';" always;
```

> **Note:** Strict `style-src 'self'` projects that disallow both inline styles and nonce-based styles require external CSS. External CSS mode is not supported in v1. Use nonce mode when possible.

---

## Header Image

The modal can display a decorative header image. It can be configured in three ways:

| Value | Description |
|-------|-------------|
| `'default'` | Uses the cookie-themed SVG image embedded in the package. No asset path or extra setup is required. |
| `'none'` | Removes the header image and shows text only. |
| `'https://...'` or any image URL | Uses a custom image URL. |

```typescript
CookieConsentManager.init({
  theme: {
    headerImage: 'none'
  },
  categories: [/* ... */]
});
```

```typescript
CookieConsentManager.init({
  theme: {
    headerImage: 'https://example.com/cookie-banner.png'
  },
  categories: [/* ... */]
});
```

---

## Internationalization (i18n)

### Built-In Languages

The package includes built-in UI translations for `tr` and `en`. You can use these languages without providing translation files.

### Resolution Priority

```text
User-defined translations -> built-in translation (tr / en) -> en fallback
```

1. **User-defined translations** from the `translations` option have the highest priority.
2. **Built-in translations** fill missing keys. If the selected language is not built in, English is used.
3. **English fallback** is used if no translation can be resolved from another source.

### Overriding an Existing Language

You only need to provide the keys you want to change. Missing keys are filled from the built-in translations:

```typescript
CookieConsentManager.init({
  language: 'en',
  translations: {
    en: {
      banner: {
        acceptAll: 'Allow All',
        rejectAll: 'Decline All'
      }
    }
  },
  categories: [/* ... */]
});
```

### Category and Cookie Text

Category and cookie text values use the `LocalizedString` type. Use a plain `string` for a single language, or an object for multiple languages:

```typescript
// Single language
title: 'Analytics Cookies'

// Multiple languages
title: { en: 'Analytics Cookies', de: 'Analyse-Cookies' }
```

The resolver looks for the selected `language` key first. If it cannot find it, it uses the first available value in the object.

---

## Developer Responsibility

> **This package does not manage your scripts.** You are expected to follow these rules:

1. **Do not statically add optional scripts to HTML.** Do not place analytics, advertising, social media, or other optional third-party scripts directly in the page before consent logic runs.

2. **Load scripts based on preferences.** Use `onReady`, `onSave`, `onAccept`, or the `ccm_preferences` cookie to conditionally load optional integrations:

```typescript
CookieConsentManager.init({
  categories: [
    { id: 'analytics', title: 'Analytics', description: '...', cookies: [] },
    { id: 'marketing', title: 'Marketing', description: '...', cookies: [] }
  ],
  onReady(payload) {
    if (payload?.preferences.analytics) loadAnalytics();
    if (payload?.preferences.marketing) loadMarketingPixels();
  },
  onSave({ preferences }) {
    if (preferences.analytics) loadAnalytics();
    else removeAnalytics();

    if (preferences.marketing) loadMarketingPixels();
    else removeMarketingPixels();
  }
});
```

3. **The package does not inject, remove, delete, or block scripts, cookies, or network requests.** It only collects the user's preference and stores it as cookies. Script and integration management remains the developer's responsibility.

4. **Use server-side checks when needed.** In addition to client-side checks, you can read the `ccm_preferences` cookie server-side and control script rendering there. This can be a more predictable approach for CSP-heavy projects.

---

## License

[MIT](./LICENSE) &copy; Zasetsu
