# Tatkal Ticket Cost & eWallet Estimator (TTE)

> A lightning-fast, zero-friction web utility to calculate the exact total payable for Indian Railways Tatkal tickets, determine the precise IRCTC eWallet top-up amount needed, and compare real-world payment mode charges.

---

## 🎯 The Problem Solved
During the 10:00 AM (AC) and 11:00 AM (Non-AC) Tatkal rush, seats evaporate in seconds. One of the biggest causes of booking failure is attempting to pay via the **IRCTC eWallet** with an insufficient balance:
1. IRCTC does **not** allow mid-session wallet top-ups during checkout.
2. The initial train search screen shows the **ticket fare only**, omitting convenience fees, 18% GST, and eWallet booking fees.
3. Users who under-fund their wallet face instant payment failure. Users who over-fund lock their funds.

**TTE calculates the exact required eWallet top-up in seconds**, down to the rupee and deposit slab, before the Tatkal window opens.

---

## 🚀 Key Features
- **Accurate eWallet Top-Up Estimator**: Accounts for per-PNR convenience fees (₹35.40 AC / ₹17.70 Non-AC), ₹11.80 eWallet booking fee, passenger multipliers, and ₹100 deposit rounding.
- **Payment Method Cost Matrix**: Side-by-side comparison of total cost across UPI, RuPay Debit, Credit Cards, eWallet, and Net Banking.
- **Live Tatkal Countdown**: Accurate real-time IST clock and countdown timer to the upcoming 10:00 AM and 11:00 AM booking windows.
- **Authoritative Travel Guides**: Complete tutorials on eWallet setup, fee avoidance, Tatkal cancellation rules, and official Tatkal tariff slabs.
- **Privacy & Legal Compliant**: 100% client-side calculation, zero personal data collected, zero scraping, fully compliant with Railways Act Section 143.

---

## 🛠️ Tech Stack
- **Structure**: Semantic HTML5 (SEO & Google AdSense optimized)
- **Styling**: Vanilla CSS3 (Custom Design Tokens, dark/vibrant railway aesthetic)
- **Logic**: Vanilla Modern JavaScript (ES6+, zero runtime dependencies)
- **Hosting**: Static CDN (Cloudflare Pages / Vercel / GitHub Pages)

---

## 📂 Project Structure
```
├── Docs/                     # Complete project documentation suite
│   ├── PRD.md                # Product Requirements Document
│   ├── ARCHITECTURE.md       # Technical design & specs
│   ├── DESIGN.md             # Design system & tokens
│   ├── RULES.md              # Engineering & legal rules
│   ├── TASKS.md              # Task breakdown & roadmap
│   ├── DECISIONS.md          # Architecture Decision Records
│   ├── MEMORY.md             # Current state & milestones
│   ├── TEST_PLAN.md          # Test cases & QA checklist
│   ├── SECURITY.md           # Legal & privacy standards
│   └── Tatkal Ticket Cost Estimator Research Notes.md
├── css/                      # Stylesheets
│   ├── tokens.css            # Colors, spacing, typography variables
│   ├── main.css              # Core components and layouts
│   └── responsive.css        # Mobile and tablet breakpoints
├── js/                       # Client-side scripts
│   ├── constants.js          # Verified fee tables and rates
│   ├── calculator.js         # Pure math calculation functions
│   ├── countdown.js          # Real-time IST countdown timer
│   └── app.js                # DOM bindings and state handlers
├── index.html                # Main application & knowledge hub
├── privacy.html              # Privacy policy (AdSense mandatory)
├── terms.html                # Terms of use & disclaimers
├── contact.html              # Contact & feedback
└── README.md                 # Project overview
```

---

## 💻 Local Development
Simply serve the root directory using any local static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .
```

Open `http://localhost:8000` in your browser.

---

## ⚖️ Legal Disclaimer
*This website is an independent informational utility and is **not** affiliated, associated, authorized, endorsed by, or in any way officially connected with IRCTC (Indian Railway Catering and Tourism Corporation) or Indian Railways. All calculations are estimates based on published fare rules.*
