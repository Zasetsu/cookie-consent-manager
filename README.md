# cookie-consent-manager

Çerçeve bağımsız, hafif çerez onay tercihi toplama ve saklama modülü. KVKK ve GDPR uyumluluğunu destekleyen tercih toplama aracı olarak çerez banner'ı ve tercih yönetim paneli sunar.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/cookie-consent-manager.svg)](https://www.npmjs.com/package/cookie-consent-manager)

---

## İçindekiler

- [Temel İlke](#temel-i̇lke)
- [Kurulum](#kurulum)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Kullanım Örnekleri](#kullanım-örnekleri)
  - [Vanilla HTML (UMD)](#1-vanilla-html-umd)
  - [ESM / Bundler](#2-esm--bundler)
  - [Çok Dilli Kategori Tanımlama](#3-çok-dilli-kategori-tanimlama)
  - [Yeni Dil Ekleme](#4-yeni-dil-ekleme)
  - [Laravel Blade Entegrasyonu](#5-laravel-blade-entegrasyonu)
  - [Sunucu Tarafında Çerez Okuma](#6-sunucu-tarafinda-cerez-okuma)
- [API Referansı](#api-referansı)
  - [Statik Metotlar](#statik-metotlar)
  - [Yapılandırma (CookieConsentConfig)](#yapilandirma-cookieconsentconfig)
  - [Kategori Yapılandırması (CategoryConfig)](#kategori-yapilandirmasi-categoryconfig)
  - [Çerez Öğesi (CookieItem)](#cerez-ogesi-cookieitem)
  - [Tema Yapılandırması (ThemeConfig)](#tema-yapilandirmasi-themeconfig)
  - [Onay Verisi (ConsentPayload)](#onay-verisi-consentpayload)
- [Yazılan Çerezler](#yazilan-cerezler)
- [Geri Çağırma (Callback) Yaşam Döngüsü](#geri-cagirma-callback-yasam-dongusu)
- [CSP Uyumluluğu](#csp-uyumlulugu)
- [Başlık Görseli (Header Image)](#başlik-gorseli-header-image)
- [Çoklu Dil (i18n) Çözümleme](#çoklu-dil-i18n-cözümleme)
- [Geliştirici Sorumluluğu](#geliştirici-sorumlulugu)
- [Lisans](#lisans)

---

## Temel İlke

> **Bu paket yalnızca kullanıcının çerez onay tercihlerini toplar ve kalıcı çerez olarak saklar.** Herhangi bir üçüncü parti betiği enjekte etmez, kaldırmaz veya engellemez. Geliştirici, tercih çerezlerini okuyarak veya callback'leri kullanarak kendi betiklerini koşullu olarak yükler.

---

## Kurulum

```bash
npm install cookie-consent-manager
```

---

## Hızlı Başlangıç

```html
<script src="node_modules/cookie-consent-manager/dist/cookie-consent-manager.umd.js"></script>
<script>
  CookieConsentManager.init({
    language: 'tr',
    categories: [
      {
        id: 'required',
        required: true,
        title: 'Gerekli Çerezler',
        description: 'Bu çerezler web sitesinin temel işlevleri için gereklidir.',
        cookies: [
          { name: 'XSRF-TOKEN', provider: 'Site', purpose: 'Güvenlik', expiry: 'Oturum', party: 'first' }
        ]
      },
      {
        id: 'analytics',
        title: 'Analitik Çerezler',
        description: 'Bu çerezler, web sitemizin nasıl kullanıldığını anlamamıza yardımcı olur.',
        cookies: [
          { name: '_ga', provider: 'Google Analytics', purpose: 'Ziyaretçi analizi', expiry: '2 yıl', party: 'third' }
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

## Kullanım Örnekleri

### 1. Vanilla HTML (UMD)

UMD derlemesi, `CookieConsentManager` global değişkenini oluşturur. Doğrudan `<script>` etiketi ile kullanılabilir.

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Örnek Site</title>
</head>
<body>
  <h1>Web Sitem</h1>

  <script src="node_modules/cookie-consent-manager/dist/cookie-consent-manager.umd.js"></script>
  <script>
    CookieConsentManager.init({
      language: 'tr',
      categories: [
        {
          id: 'required',
          required: true,
          title: 'Gerekli Çerezler',
          description: 'Bu çerezler web sitesinin temel işlevleri için gereklidir ve devre dışı bırakılamaz.',
          cookies: [
            { name: 'XSRF-TOKEN', provider: 'Site', purpose: 'Güvenlik', expiry: 'Oturum', party: 'first' }
          ]
        },
        {
          id: 'analytics',
          title: 'Analitik Çerezler',
          description: 'Bu çerezler, web sitemizin nasıl kullanıldığını anlamamıza yardımcı olur.',
          cookies: [
            { name: '_ga', provider: 'Google Analytics', purpose: 'Ziyaretçi analizi', expiry: '2 yıl', party: 'third' }
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

Vite, Webpack, Rollup gibi modern derleyiciler ile kullanım:

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

### 3. Çok Dilli Kategori Tanımlama

Kategori ve çerez metinleri, `string` (tek dil) veya `{ tr: '...', en: '...' }` (çok dil) olarak tanımlanabilir:

```typescript
CookieConsentManager.init({
  language: 'tr',
  categories: [
    {
      id: 'analytics',
      title: { tr: 'Analitik Çerezler', en: 'Analytics Cookies' },
      description: {
        tr: 'Bu çerezler, web sitemizin nasıl kullanıldığını anlamamıza yardımcı olur.',
        en: 'These cookies help us understand how our website is used.'
      },
      cookies: [
        {
          name: '_ga',
          provider: { tr: 'Google Analitik', en: 'Google Analytics' },
          purpose: { tr: 'Analiz', en: 'Analytics' },
          expiry: { tr: '2 yıl', en: '2 years' },
          party: 'third'
        }
      ]
    }
  ]
});
```

Dil değişimi:

```typescript
CookieConsentManager.setLanguage('en'); // Arayüz ve kategori metinleri İngilizceye geçer
```

### 4. Yeni Dil Ekleme

`translations` alanı ile mevcut dillerin üzerine yazabilir veya tamamen yeni bir dil ekleyebilirsiniz. Tüm `TranslationSet` anahtarlarını sağlamanız gerekir:

```typescript
CookieConsentManager.init({
  language: 'de',
  translations: {
    de: {
      banner: {
        description: 'Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten.',
        acceptAll: 'Alle akzeptieren',
        rejectAll: 'Alle ablehnen',
        manage: 'Verwalten'
      },
      modal: {
        title: 'Cookie-Einstellungen',
        requiredNote: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich.',
        optionalNote: 'Diese Cookies helfen uns zu verstehen, wie unsere Website genutzt wird.',
        savePreferences: 'Einstellungen speichern',
        acceptAll: 'Alle akzeptieren',
        rejectAll: 'Alle ablehnen',
        policyLink: 'Um die Cookie-Richtlinie anzuzeigen,',
        policyClick: 'klicken Sie hier',
        policyDocument: 'Cookie-Aufklärungstext'
      },
      table: {
        cookieName: 'Cookie-Name',
        provider: 'Anbieter',
        description: 'Beschreibung',
        purpose: 'Zweck',
        expiry: 'Gültigkeit',
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

### 5. Laravel Blade Entegrasyonu

```blade
{{-- resources/views/layouts/app.blade.php --}}

<script src="{{ asset('vendor/cookie-consent-manager/cookie-consent-manager.umd.js') }}"></script>
<script>
  CookieConsentManager.init({
    language: 'tr',
    categories: @json($cookieCategories),
    policyUrl: '{{ asset("storage/cerez/politika.pdf") }}',
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

Kategorileri denetleyiciden göndermek için:

```php
public function index()
{
    return view('app', [
        'cookieCategories' => [
            [
                'id' => 'required',
                'required' => true,
                'title' => 'Gerekli Çerezler',
                'description' => 'Bu çerezler web sitesinin temel işlevleri için gereklidir.',
                'cookies' => [
                    ['name' => 'XSRF-TOKEN', 'provider' => 'Site', 'purpose' => 'Güvenlik', 'expiry' => 'Oturum', 'party' => 'first']
                ]
            ],
            [
                'id' => 'analytics',
                'title' => 'Analitik Çerezler',
                'description' => 'Bu çerezler kullanım istatistiklerini toplar.',
                'cookies' => [
                    ['name' => '_ga', 'provider' => 'Google Analytics', 'purpose' => 'Analiz', 'expiry' => '2 yıl', 'party' => 'third']
                ]
            ]
        ]
    ]);
}
```

### 6. Sunucu Tarafında Çerez Okuma

Paket yalnızca tercih çerezlerini yazar; sunucu tarafında bu çerezleri okuyarak betik yüklemesini kontrol edebilirsiniz.

**Genel örnek (herhangi bir framework):**

```
Cookie: ccm_decision=accepted_all; ccm_preferences=%7B%22analytics%22%3Atrue%7D
```

Cookie değeri URL-encoded olarak yazılır. Okurken önce `urldecode`, sonra `json_decode` uygulayın.

**Laravel örneği:**

```php
$preferences = json_decode(urldecode(request()->cookie('ccm_preferences')), true);

if ($preferences['analytics'] ?? false) {
    // Analitik betiklerini yükle
}
```

```php
$decision = request()->cookie('ccm_decision');

if ($decision === 'accepted_all') {
    // Tüm üçüncü parti betikleri yükle
}
```

Middleware ile otomatik kontrol:

```php
class CheckCookieConsent
{
    public function handle($request, Closure $next)
    {
        $preferences = json_decode(urldecode($request->cookie('ccm_preferences')), true);
        View::share('cookieConsent', [
            'analytics' => $preferences['analytics'] ?? false,
            'marketing' => $preferences['marketing'] ?? false,
        ]);

        return $next($request);
    }
}
```

> **Tarayıcıda `CookieConsentManager.getPreferences()` decoded JSON döner.** Ancak server-side framework raw cookie okuyorsa `urldecode` gerekebilir çünkü cookie değeri URL-encoded olarak yazılır.

> **Bazı server-side framework'ler** client-side yazılan cookie'leri kendi cookie middleware, parser veya encryption katmanlarıyla farklı işleyebilir. Server tarafında `ccm_preferences` okunacaksa framework'ün raw cookie okuma davranışı kontrol edilmelidir.

---

## API Referansı

### Statik Metotlar

| Metot | Açıklama |
|-------|----------|
| `CookieConsentManager.init(config)` | Banner'ı başlatır. Daha önce onay verilmişse `onReady` callback'ine `ConsentPayload` gönderilir; verilmemişse banner gösterilir ve `onReady`'ye `null` gönderilir. Tekrar çağrılırsa önceki örnek yok edilir. |
| `CookieConsentManager.destroy()` | Banner/modal DOM'dan kaldırılır, stiller silinir, örnek sıfırlanır. Çerezler silinmez. |
| `CookieConsentManager.setLanguage(lang)` | Çalışma zamanında arayüz dilini değiştirir. Banner/modal yeniden oluşturulur. |
| `CookieConsentManager.getPreferences()` | Kaydedilmiş tercihleri döndürür. Onay yoksa `null` döner. |
| `CookieConsentManager.reset()` | Tercih çerezlerini siler ve banner'ı yeniden gösterir. |

---

### Yapılandırma (CookieConsentConfig)

| Özellik | Tür | Varsayılan | Açıklama |
|---------|-----|-----------|----------|
| `categories` | `CategoryConfig[]` | — | **Zorunlu.** Çerez kategorileri. |
| `domain` | `string` | `undefined` | Çerez domain'i. Boş bırakılırsa host-only çerez olur (localhost/IP için önerilir). |
| `path` | `string` | `'/'` | Çerez yolu. |
| `cookieExpiry` | `number` | `365` | Çerez geçerlilik süresi (gün). |
| `cookiePrefix` | `string` | `'ccm_'` | Çerez adı ön eki. |
| `sameSite` | `'Lax' \| 'Strict' \| 'None'` | `'Lax'` | SameSite özniteliği. `SameSite=None` modern tarayıcılarda `Secure` gerektirir; üretimde HTTPS kullanılmalıdır. Yerel HTTP geliştirmede `SameSite=Lax` tercih edilmelidir. |
| `secure` | `boolean \| 'auto'` | `'auto'` | Secure özniteliği. `'auto'` HTTPS sayfalarında otomatik `true` olur. `sameSite: 'None'` seçildiğinde `Secure` otomatik olarak `true` kabul edilir. |
| `policyVersion` | `string` | `undefined` | Politika versiyonu. Değişirse mevcut onay geçersiz olur ve banner yeniden gösterilir. |
| `language` | `string` | `'tr'` | Arayüz dili. `'tr'` ve `'en'` dahili olarak mevcuttur. |
| `translations` | `Record<string, DeepPartial<TranslationSet>>` | `{}` | Dil geçersiz kılmaları veya yeni dil tanımları. |
| `theme` | `ThemeConfig` | — | Görsel tema ayarları. |
| `styleMode` | `'inline' \| 'nonce'` | `'inline'` | CSS enjeksiyon yöntemi. (`external` v1'de desteklenmemektedir.) |
| `styleNonce` | `string` | `undefined` | CSP nonce değeri (`styleMode: 'nonce'` ile kullanılır). |
| `policyUrl` | `string` | `undefined` | Çerez politikası belgesi bağlantısı. |
| `onReady` | `(payload \| null) => void` | — | Başlangıçta bir kez çağrılır. Onay varsa `payload`, yoksa `null`. |
| `onSave` | `(payload) => void` | — | Her kaydetme işleminde çağrılır (tümü kabul, tümü reddet, özel). |
| `onAccept` | `(payload) => void` | — | Yalnızca "Tümünü Kabul Et" seçildiğinde çağrılır. |
| `onReject` | `(payload) => void` | — | Yalnızca "Tümünü Reddet" seçildiğinde çağrılır. |
| `onChange` | `(payload) => void` | — | Yalnızca "Tercihleri Kaydet" (özel seçim) ile çağrılır. |

---

### Kategori Yapılandırması (CategoryConfig)

| Özellik | Tür | Açıklama |
|---------|-----|----------|
| `id` | `string` | Kategori tanımlayıcısı. Tercih çerezlerinde anahtar olarak kullanılır. |
| `required` | `boolean` | `true` ise kategori devre dışı bırakılamaz ve her zaman kabul edilir. |
| `title` | `LocalizedString` | Kategori başlığı. `string` veya `{ tr: '...', en: '...' }`. |
| `description` | `LocalizedString` | Kategori açıklaması. |
| `cookies` | `CookieItem[]` | Kategorideki çerezlerin listesi. Tablo görünümünde gösterilir. |

---

### Çerez Öğesi (CookieItem)

| Özellik | Tür | Açıklama |
|---------|-----|----------|
| `name` | `string` | Çerez adı. |
| `provider` | `LocalizedString` | Çerez sağlayıcısı. |
| `description` | `LocalizedString` | Çerez açıklaması (isteğe bağlı). |
| `purpose` | `LocalizedString` | Çerez amacı. |
| `expiry` | `LocalizedString` | Çerez geçerlilik süresi. |
| `party` | `'first' \| 'third'` | Birinci taraf veya üçüncü taraf. |

---

### Tema Yapılandırması (ThemeConfig)

| Özellik | Tür | Varsayılan | Açıklama |
|---------|-----|-----------|----------|
| `primaryColor` | `string` | `'#FF671D'` | Ana renk (butonlar, toggle'lar). |
| `secondaryColor` | `string` | `undefined` | İkincil renk (isteğe bağlı vurgu). |
| `textColor` | `string` | `'#272727'` | Metin rengi. |
| `backgroundColor` | `string` | `'#ffffff'` | Arka plan rengi. |
| `position` | `'bottom' \| 'top'` | `'bottom'` | Banner konumu. |
| `borderRadius` | `string` | `'20px'` | Kenar yuvarlaklığı. |
| `headerImage` | `'default' \| 'none' \| string` | `'default'` | Başlık görseli. Ayrıntılı bilgi için [başlık görseli](#başlik-gorseli-header-image) bölümüne bakın. |

---

### Onay Verisi (ConsentPayload)

Tüm callback'lerin aldığı `payload` nesnesi:

```typescript
interface ConsentPayload {
  decision: 'accepted_all' | 'rejected_all' | 'custom';
  preferences: Record<string, boolean>;    // { required: true, analytics: false }
  acceptedCategories: string[];            // ['required', 'analytics']
  rejectedCategories: string[];            // ['marketing']
  savedAt: string;                         // ISO tarih dizesi
  policyVersion?: string;                  // Politika versiyonu
}
```

---

## Yazılan Çerezler

Kullanıcı tercihini kaydettiğinde aşağıdaki çerezler oluşturulur (varsayılan `ccm_` ön eki ile):

| Çerez | Değer | Örnek |
|-------|-------|-------|
| `ccm_decision` | `accepted_all`, `rejected_all` veya `custom` | `accepted_all` |
| `ccm_preferences` | JSON formatında tercih nesnesi | `%7B%22required%22%3Atrue%2C%22analytics%22%3Afalse%7D` |
| `ccm_saved_at` | ISO tarih dizesi | `2026-04-28T12:00:00.000Z` |
| `ccm_policy_version` | Yapılandırılan versiyon dizesi | `1.2` |

`cookiePrefix` değiştirildiğinde çerez adları buna göre değişir (ör. `myapp_decision`).

---

## Geri Çağırma (Callback) Yaşam Döngüsü

```
init() çağrılır
  │
  ├─ Önceki onay VAR ──▶ onReady(payload)
  │
  └─ Önceki onay YOK ──▶ onReady(null) + Banner gösterilir
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Tümünü Kabul       Tümünü Reddet      Tercihleri Kaydet
        │                   │                   │
   onSave(payload)    onSave(payload)    onSave(payload)
   onAccept(payload)  onReject(payload)  onChange(payload)
```

- **`onReady`**: `init()` sırasında bir kez çağrılır. Mevcut onay varsa `payload`, yoksa `null` alır.
- **`onSave`**: Her kaydetme işleminde çağrılır (kabul, red, özel). Sunucu tarafı eşitleme veya genel işlemler için idealdir.
- **`onAccept`**: Yalnızca "Tümünü Kabul Et" seçildiğinde.
- **`onReject`**: Yalnızca "Tümünü Reddet" seçildiğinde.
- **`onChange`**: Yalnızca özel tercih kaydedildiğinde.

> **Not:** Callback'ler (özellikle `onReady`) birden fazla kez tetiklenebilir (ör. `setLanguage()` çağrısında). Script loader callback'leri idempotent tasarlanmalıdır.

---

## CSP Uyumluluğu

Paket, Content Security Policy (CSP) kurallarına uygun iki farklı CSS enjeksiyon yöntemi sunar.

### Varsayılan Mod (Inline)

`styleMode: 'inline'` — CSS bir `<style>` etiketi olarak enjekte edilir. Çoğu projede sorunsuz çalışır.

**Apache:**

```apache
Header always set Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline';"
```

**Nginx:**

```nginx
add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline';" always;
```

### Nonce Modu

`styleMode: 'nonce'` — CSP `style-src` yönergesinde nonce kullanılıyorsa bu modu seçin. Nonce değerini `styleNonce` ile iletin.

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

> **Not:** Strict `style-src 'self'` kullanan projeler (inline ve nonce yasaklayan CSP) için external CSS modu v1'de desteklenmemektedir. Bu senaryoda `nonce` modu önerilir.

---

## Başlık Görseli (Header Image)

Banner'ın üst kısmında gösterilen dekoratif görsel, üç şekilde yönetilebilir:

| Değer | Açıklama |
|-------|----------|
| `'default'` (varsayılan) | Pakete gömülü çerez temalı SVG görsel kullanılır. Ek kurulum gerekmez. |
| `'none'` | Başlık görseli kaldırılır, yalnızca metin gösterilir. |
| `'https://...'` | Özel bir görsel URL'si kullanılır. |

```typescript
CookieConsentManager.init({
  theme: {
    headerImage: 'none'   // Görseli kaldır
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

## Çoklu Dil (i18n) Çözümleme

### Dahili Diller

Paket `tr` (Türkçe) ve `en` (İngilizce) arayüz çevirilerini dahili olarak içerir. Herhangi bir çeviri dosyası sağlamadan bu dilleri kullanabilirsiniz.

### Çözümleme Önceliği

```
Kullanıcı tanımlı çeviri (translations) → Dahili çeviri (tr / en) → en yedek (fallback)
```

1. **Kullanıcı tanımı**: `translations` alanında belirtilen dil ve anahtarlar en yüksek önceliğe sahiptir.
2. **Dahili çeviri**: Kullanıcı tanımında bulunmayan anahtarlar dahili çeviriden alınır. Seçilen dilin dahili çevirisi yoksa İngilizce (`en`) kullanılır.
3. **en yedek**: Hiçbir kaynaktan çeviri bulunamazsa `en` fallback olarak kullanılır.

### Mevcut Dili Geçersiz Kılma

Yalnızca değiştirmek istediğiniz anahtarları belirtmeniz yeterlidir; eksik anahtarlar otomatik olarak dahili çeviriden tamamlanır:

```typescript
CookieConsentManager.init({
  language: 'tr',
  translations: {
    tr: {
      banner: {
        acceptAll: 'Hepsini Kabul Et',
        rejectAll: 'Hepsini Reddet'
      }
    }
  },
  categories: [/* ... */]
});
```

### Kategori ve Çerez Metinleri

Kategori/çerez metinleri `LocalizedString` türündedir. Tekil dil desteğinde düz `string`, çoklu dil desteğinde nesne kullanın:

```typescript
// Tek dil
title: 'Analitik Çerezler'

// Çoklu dil
title: { tr: 'Analitik Çerezler', en: 'Analytics Cookies', de: 'Analyse-Cookies' }
```

Çözümleme algoritması seçili `language` değerini nesnede arar; bulamazsa ilk bulunan değeri kullanır.

---

## Geliştirici Sorumluluğu

> **Bu paket betiklerinizi yönetmez.** Aşağıdaki kurallara uymanız beklenir:

1. **Zorunlu olmayan betikleri statik olarak HTML'e eklemeyin.** Analitik, reklam, sosyal medya vb. betikleri doğrudan `<script>` etiketi ile sayfaya eklemeyin.

2. **Tercihleri okuyarak betik yükleyin.** `onReady`, `onSave`, `onAccept` callback'lerini veya `ccm_preferences` çerezini kullanarak betikleri koşullu olarak yükleyin:

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

3. **Paket hiçbir betik enjekte etmez, kaldırmaz veya ağ isteğini engellemez.** Yalnızca kullanıcı tercihini toplar ve çerez olarak saklar. Betik yönetimi tamamen geliştiricinin sorumluluğundadır.

4. **Sunucu tarafında kontrol yapın.** İstemci tarafı kontrole ek olarak, sunucu tarafında da `ccm_preferences` çerezini okuyarak betik enjeksiyonunu kontrol edebilirsiniz. Bu, CSP uyumlu ve güvenilir bir yaklaşımdır.

---

## Lisans

[MIT](./LICENSE) &copy; Zasetsu
