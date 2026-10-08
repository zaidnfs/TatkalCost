/**
 * constants.js - Verified Railway & IRCTC Fee Tables, Rules, and Configurations
 * All values verified against official Railway Board circulars and IRCTC schedules.
 */

const TTE_CONSTANTS = {
  // GST Rate applicable on convenience fees & payment gateway surcharges
  GST_RATE: 0.18,

  // IRCTC Convenience Fee (per PNR / Ticket, regardless of passenger count)
  CONVENIENCE_FEES: {
    UPI: {
      NON_AC: { base: 10, total: 11.80 },
      AC: { base: 20, total: 23.60 }
    },
    NON_UPI: {
      NON_AC: { base: 15, total: 17.70 },
      AC: { base: 30, total: 35.40 }
    }
  },

  // IRCTC eWallet Specific Fees & Parameters
  EWALLET: {
    REGISTRATION_FEE: 59.00, // ₹50 + 18% GST
    TRANSACTION_FEE_BASE: 10.00,
    TRANSACTION_FEE_TOTAL: 11.80, // ₹10 + 18% GST
    MIN_DEPOSIT: 100,
    MAX_BALANCE: 10000,
    CONVENIENCE_FEE_TIER: 'NON_UPI' // eWallet bookings attract the non-UPI rate
  },

  // Optional Travel Insurance (per passenger, all taxes included)
  INSURANCE_PER_PASSENGER: 0.45,

  // Tatkal Class Slabs & Information
  CLASSES: {
    '2S': {
      code: '2S',
      name: 'Second Sitting',
      isAC: false,
      tatkalRate: 0.10,
      tatkalMin: 10,
      tatkalMax: 15,
      minDistanceKm: 100,
      tatkalAvailable: true
    },
    'SL': {
      code: 'SL',
      name: 'Sleeper Class',
      isAC: false,
      tatkalRate: 0.30,
      tatkalMin: 100,
      tatkalMax: 200,
      minDistanceKm: 500,
      tatkalAvailable: true
    },
    'CC': {
      code: 'CC',
      name: 'AC Chair Car',
      isAC: true,
      tatkalRate: 0.30,
      tatkalMin: 125,
      tatkalMax: 225,
      minDistanceKm: 250,
      tatkalAvailable: true
    },
    '3E': {
      code: '3E',
      name: 'AC 3 Tier Economy',
      isAC: true,
      tatkalRate: 0.30,
      tatkalMin: 300,
      tatkalMax: 400,
      minDistanceKm: 500,
      tatkalAvailable: true
    },
    '3A': {
      code: '3A',
      name: 'AC 3 Tier',
      isAC: true,
      tatkalRate: 0.30,
      tatkalMin: 300,
      tatkalMax: 400,
      minDistanceKm: 500,
      tatkalAvailable: true
    },
    '2A': {
      code: '2A',
      name: 'AC 2 Tier',
      isAC: true,
      tatkalRate: 0.30,
      tatkalMin: 400,
      tatkalMax: 500,
      minDistanceKm: 500,
      tatkalAvailable: true
    },
    'EC': {
      code: 'EC',
      name: 'Executive Chair Car',
      isAC: true,
      tatkalRate: 0.30,
      tatkalMin: 400,
      tatkalMax: 500,
      minDistanceKm: 250,
      tatkalAvailable: true
    },
    '1A': {
      code: '1A',
      name: 'First AC',
      isAC: true,
      tatkalRate: 0.0,
      tatkalMin: 0,
      tatkalMax: 0,
      minDistanceKm: 0,
      tatkalAvailable: false // Tatkal not offered for 1A
    }
  },

  // Payment Gateway Surcharges (Gateway fee + 18% GST)
  PAYMENT_MODES: {
    EWALLET: {
      id: 'ewallet',
      name: 'IRCTC eWallet',
      type: 'fixed',
      gatewayCharge: 10.00,
      gatewayChargeWithGst: 11.80,
      convenienceTier: 'NON_UPI',
      speedRating: 'Fastest (Zero Gateway Hop)',
      recommendationBadge: 'Best for Tatkal Rush'
    },
    UPI: {
      id: 'upi',
      name: 'BHIM / UPI (GPay, PhonePe, Paytm)',
      type: 'percentage',
      rate: 0.0,
      gatewayChargeWithGst: 0.0,
      convenienceTier: 'UPI',
      speedRating: 'Fast (Requires App Approval)',
      recommendationBadge: 'Cheapest Total Cost'
    },
    RUPAY_DEBIT: {
      id: 'rupay_debit',
      name: 'RuPay Debit Card',
      type: 'percentage',
      rate: 0.0,
      gatewayChargeWithGst: 0.0,
      convenienceTier: 'NON_UPI',
      speedRating: 'Standard (OTP Required)',
      recommendationBadge: '0% Gateway Surcharge'
    },
    OTHER_DEBIT: {
      id: 'other_debit',
      name: 'Visa / Mastercard Debit Card',
      type: 'tiered_percentage',
      rateTier1: 0.004, // <= 2000
      rateTier2: 0.009, // > 2000
      convenienceTier: 'NON_UPI',
      speedRating: 'Standard (OTP Required)',
      recommendationBadge: null
    },
    CREDIT_CARD_STD: {
      id: 'credit_card_std',
      name: 'Credit Card (Razorpay, Paytm, PayU)',
      type: 'percentage',
      rate: 0.010, // 1.0% + 18% GST = 1.18%
      convenienceTier: 'NON_UPI',
      speedRating: 'Moderate (OTP Required)',
      recommendationBadge: null
    },
    CREDIT_CARD_IPAY: {
      id: 'credit_card_ipay',
      name: 'Credit Card via IRCTC iPay',
      type: 'percentage',
      rate: 0.018, // 1.8% + 18% GST = 2.124%
      convenienceTier: 'NON_UPI',
      speedRating: 'Moderate (OTP Required)',
      recommendationBadge: null
    },
    NET_BANKING: {
      id: 'net_banking',
      name: 'Net Banking (SBI, HDFC, ICICI, etc.)',
      type: 'fixed',
      gatewayCharge: 10.00,
      gatewayChargeWithGst: 11.80,
      convenienceTier: 'NON_UPI',
      speedRating: 'Slow (Bank Login & OTP)',
      recommendationBadge: null
    }
  },

  // Operational Rules
  RULES: {
    MAX_TATKAL_PASSENGERS: 4,
    MIN_PASSENGERS: 1,
    AC_OPENING_TIME_HOUR: 10, // 10:00 AM IST
    NON_AC_OPENING_TIME_HOUR: 11, // 11:00 AM IST
    AGENT_BAN_MINUTES: 30 // Agents barred 10:00-10:30 and 11:00-11:30
  }
};

// Universal Module Definition for Browser and Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTE_CONSTANTS;
}
