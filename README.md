# SwasthyaSetu Maharashtra (स्वास्थ्यसेतू महाराष्ट्र)
### Integrated Rural Healthcare Network — SIH Prototype Authentication Platform

SwasthyaSetu Maharashtra is an advanced, production-grade unified authentication interface and role-based portal suite designed for public healthcare infrastructure across Maharashtra.

---

## 🏥 Supported Role-Based Portals

The authentication system provides role-gated access to 4 distinct healthcare administration portals (patients use a dedicated Android mobile app):

1. **Hospital / Doctor Portal** (`/hospital/dashboard`)
   - Manages OPD queues, teleconsultations, electronic health records (EHR), and inter-hospital referrals.
   - *Demo ID:* `DOC1001` | *Password:* `Demo@123` | *Facility Code:* `MH-PHC-101`

2. **Diagnostic Laboratory Portal** (`/laboratory/dashboard`)
   - Manages pathology and radiology test orders, barcode specimen tracking, and verified digital test reports.
   - *Demo ID:* `LAB1001` | *Password:* `Demo@123` | *Facility Code:* `MH-LAB-101`

3. **Pharmacy & Dispensary Portal** (`/pharmacy/dashboard`)
   - Manages digital e-prescription dispensing, real-time medicine inventory, batch tracking, and district warehouse indents.
   - *Demo ID:* `PHA1001` | *Password:* `Demo@123` | *Store Code:* `MH-PHA-101`

4. **Government Admin Portal** (`/admin/dashboard`)
   - State-level monitoring of healthcare indicators, bed/ICU occupancy, critical drug shortages, and emergency public health advisories.
   - *Demo ID:* `ADM1001` | *Password:* `Demo@123` | *Department Code:* `MH-ADMIN-01`

---

## 🛠️ Technology Stack

- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Deep navy, medical blue, teal & high-contrast accessible tokens)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Internationalization (i18n):** English, Marathi (मराठी), and Hindi (हिंदी)

---

## 🚀 Quick Start

### 1. Installation
```bash
# Clone or open the workspace directory
cd "sih med.ai"

# Install dependencies
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the port shown in your terminal).

### 3. Build for Production
```bash
npm run build
```

---

## 🔐 Security & Architecture Highlights

- **Dynamic Form Adaptation:** The login form adapts labels, helper text, and code requirements dynamically based on the selected portal without asking the user to re-enter roles.
- **Backend Role Verification Simulation:** Validates that the account credentials match the requested portal role. Prevents privilege escalation and cross-portal unauthorized access.
- **Role-Based Protected Routes:** Route guards (`ProtectedRoute`) block unauthorized role access and automatically redirect users to their designated portal dashboard.
- **Caps Lock & Password Visibility:** Real-time hardware modifier detection alerts users if Caps Lock is active, accompanied by an accessible password toggle.
- **Zero Local Password Storage:** Passwords are never stored in `localStorage` or `sessionStorage`.
- **Automatic Session Expiry:** Configurable session lifecycle timer with 2-minute warning and automatic secure logout.
- **Audit Logging Stub:** Captures login attempts (`SUCCESS`, `FAILED`, `EXPIRED`) with timestamp and portal metadata for administrative audit trails.
- **Decoupled API Architecture:** Switch between the mock prototype service and a real backend by simply updating `VITE_USE_MOCK_AUTH=false` and `VITE_API_BASE_URL` in `.env`.

---

## 📂 Project Folder Structure

```
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types/
    │   ├── auth.ts              # User, Role, Portal, AuthState, Credentials
    │   └── lang.ts              # Language options & translation dictionaries
    ├── constants/
    │   ├── portals.ts           # Portal definitions, badges, routes, theme colors
    │   └── translations.ts      # EN, MR, HI localized strings
    ├── context/
    │   ├── AuthContext.tsx      # Auth state, login/logout, session expiry timer
    │   └── LanguageContext.tsx  # Language provider (EN / MR / HI)
    ├── services/
    │   ├── api.ts               # Base fetch client with error handling
    │   ├── authService.ts       # POST /api/auth/login client
    │   └── mockAuthData.ts      # Prototype demo accounts
    ├── components/
    │   ├── auth/
    │   │   ├── AuthLayout.tsx       # Responsive split branding & auth layout
    │   │   ├── LoginForm.tsx        # Dynamic portal form & validation
    │   │   ├── PortalCard.tsx       # Interactive role card
    │   │   └── PortalSelector.tsx   # 4-role selection grid
    │   ├── common/
    │   │   ├── ErrorAlert.tsx       # Accessible alert banners
    │   │   ├── Header.tsx           # Logo, title, prototype disclaimer, language picker
    │   │   ├── LanguageSelector.tsx # Multilingual dropdown
    │   │   ├── LoadingSpinner.tsx   # Accessible status spinner
    │   │   ├── PasswordInput.tsx    # Password field with Caps Lock detector
    │   │   └── QuickDemoFill.tsx    # 1-Click test credentials filler
    │   └── routes/
    │       ├── NotFound.tsx         # 404 page
    │       └── ProtectedRoute.tsx   # Role-based route guard
    └── pages/
        ├── LoginPage.tsx            # Main authentication portal
        ├── DashboardLayout.tsx      # Unified portal header and session controls
        └── dashboards/
            ├── HospitalDashboard.tsx
            ├── LaboratoryDashboard.tsx
            ├── PharmacyDashboard.tsx
            └── AdminDashboard.tsx
```
