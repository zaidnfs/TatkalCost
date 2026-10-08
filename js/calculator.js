/**
 * calculator.js - Deterministic, Pure Calculation Engine for Tatkal & Payment Modes
 * Zero DOM manipulation. Completely testable and reusable.
 */

// Universal import for Node.js test environment or Browser globals
const CONSTANTS = (typeof require !== 'undefined' && typeof TTE_CONSTANTS === 'undefined')
  ? require('./constants.js')
  : (typeof TTE_CONSTANTS !== 'undefined' ? TTE_CONSTANTS : window.TTE_CONSTANTS);

const TTE_CALCULATOR = {
  /**
   * Helper to round float values strictly to two decimal places
   */
  round(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  },

  /**
   * Compute Total Base Ticket Fare
   * @param {number} baseFarePerPerson - Fare displayed on IRCTC
   * @param {number} passengers - Count of passengers (1 to 4)
   */
  calculateTicketFare(baseFarePerPerson, passengers) {
    const fare = Math.max(0, parseFloat(baseFarePerPerson) || 0);
    const count = Math.min(CONSTANTS.RULES.MAX_TATKAL_PASSENGERS, Math.max(CONSTANTS.RULES.MIN_PASSENGERS, parseInt(passengers, 10) || 1));
    return this.round(fare * count);
  },

  /**
   * Compute Travel Insurance
   * @param {number} passengers - Count of passengers (1 to 4)
   * @param {boolean} optInsurance - Whether insurance is selected
   */
  calculateInsurance(passengers, optInsurance = true) {
    if (!optInsurance) return 0.00;
    const count = Math.min(CONSTANTS.RULES.MAX_TATKAL_PASSENGERS, Math.max(CONSTANTS.RULES.MIN_PASSENGERS, parseInt(passengers, 10) || 1));
    return this.round(count * CONSTANTS.INSURANCE_PER_PASSENGER);
  },

  /**
   * Get Convenience Fee including 18% GST (charged once per PNR/Ticket)
   * @param {boolean} isAC - Whether class is AC or Non-AC
   * @param {string} tier - 'UPI' or 'NON_UPI'
   */
  getConvenienceFee(isAC, tier = 'NON_UPI') {
    const tierConfig = tier === 'UPI' ? CONSTANTS.CONVENIENCE_FEES.UPI : CONSTANTS.CONVENIENCE_FEES.NON_UPI;
    const feeObj = isAC ? tierConfig.AC : tierConfig.NON_AC;
    return this.round(feeObj.total);
  },

  /**
   * Compute Detailed IRCTC eWallet Requirements & Top-Up
   * @param {number} baseFarePerPerson - Fare per passenger
   * @param {number} passengers - Count (1-4)
   * @param {boolean} isAC - AC or Non-AC class
   * @param {number} currentWalletBal - User's current balance
   * @param {boolean} optInsurance - Insurance toggle
   */
  calculateEWalletRequirements(baseFarePerPerson, passengers, isAC, currentWalletBal = 0, optInsurance = true) {
    const validCount = Math.min(CONSTANTS.RULES.MAX_TATKAL_PASSENGERS, Math.max(CONSTANTS.RULES.MIN_PASSENGERS, parseInt(passengers, 10) || 1));
    const ticketFare = this.calculateTicketFare(baseFarePerPerson, validCount);
    const insurance = this.calculateInsurance(validCount, optInsurance);
    const convenienceFee = this.getConvenienceFee(isAC, CONSTANTS.EWALLET.CONVENIENCE_FEE_TIER);
    const walletBookingFee = CONSTANTS.EWALLET.TRANSACTION_FEE_TOTAL; // ₹11.80

    const totalPayable = this.round(ticketFare + insurance + convenienceFee + walletBookingFee);
    const currentBalance = Math.max(0, parseFloat(currentWalletBal) || 0);

    const isSufficient = currentBalance >= totalPayable;
    const rawShortfall = isSufficient ? 0 : this.round(totalPayable - currentBalance);

    // Exact ceiling needed (rupee precision)
    const exactShortfall = Math.ceil(rawShortfall);

    // IRCTC eWallet requires top-ups in minimum ₹100 or ₹100 step increments
    let recommendedSlabTopUp = 0;
    if (!isSufficient) {
      if (rawShortfall <= CONSTANTS.EWALLET.MIN_DEPOSIT) {
        recommendedSlabTopUp = CONSTANTS.EWALLET.MIN_DEPOSIT; // Minimum deposit is ₹100
      } else {
        recommendedSlabTopUp = Math.ceil(rawShortfall / 100) * 100;
      }
    }

    const exceedsMaxBalance = totalPayable > CONSTANTS.EWALLET.MAX_BALANCE || 
      (currentBalance + recommendedSlabTopUp > CONSTANTS.EWALLET.MAX_BALANCE);

    const postBookingLeftover = this.round((currentBalance + recommendedSlabTopUp) - totalPayable);

    return {
      passengers: validCount,
      ticketFare,
      insurance,
      convenienceFee,
      walletBookingFee,
      totalPayable,
      currentBalance,
      isSufficient,
      rawShortfall,
      exactShortfall,
      recommendedSlabTopUp,
      exceedsMaxBalance,
      maxBalanceLimit: CONSTANTS.EWALLET.MAX_BALANCE,
      postBookingLeftover
    };
  },

  /**
   * Calculate Breakdown for a single payment method
   */
  calculatePaymentModeTotal(modeKey, baseFarePerPerson, passengers, isAC, optInsurance = true) {
    const mode = CONSTANTS.PAYMENT_MODES[modeKey];
    if (!mode) throw new Error(`Unknown payment mode: ${modeKey}`);

    const validCount = Math.min(CONSTANTS.RULES.MAX_TATKAL_PASSENGERS, Math.max(CONSTANTS.RULES.MIN_PASSENGERS, parseInt(passengers, 10) || 1));
    const ticketFare = this.calculateTicketFare(baseFarePerPerson, validCount);
    const insurance = this.calculateInsurance(validCount, optInsurance);
    const convenienceFee = this.getConvenienceFee(isAC, mode.convenienceTier);

    let gatewayFee = 0.00;

    if (mode.type === 'fixed') {
      gatewayFee = mode.gatewayChargeWithGst;
    } else if (mode.type === 'percentage') {
      if (mode.rate > 0) {
        // Percentage applies to (Fare + Convenience Fee) as observed in railway receipts
        const taxableBase = ticketFare + convenienceFee;
        const rawCharge = taxableBase * mode.rate;
        const gstOnCharge = rawCharge * CONSTANTS.GST_RATE;
        gatewayFee = this.round(rawCharge + gstOnCharge);
      } else {
        gatewayFee = 0.00;
      }
    } else if (mode.type === 'tiered_percentage') {
      const taxableBase = ticketFare + convenienceFee;
      const rate = taxableBase <= 2000 ? mode.rateTier1 : mode.rateTier2;
      const rawCharge = taxableBase * rate;
      const gstOnCharge = rawCharge * CONSTANTS.GST_RATE;
      gatewayFee = this.round(rawCharge + gstOnCharge);
    }

    const totalPayable = this.round(ticketFare + insurance + convenienceFee + gatewayFee);
    const extraCharges = this.round(insurance + convenienceFee + gatewayFee);

    return {
      id: mode.id,
      name: mode.name,
      ticketFare,
      insurance,
      convenienceFee,
      gatewayFee,
      extraCharges,
      totalPayable,
      speedRating: mode.speedRating,
      recommendationBadge: mode.recommendationBadge
    };
  },

  /**
   * Calculate Full Comparison Matrix for all Payment Methods
   */
  calculateFullComparison(baseFarePerPerson, passengers, isAC, optInsurance = true) {
    const modeKeys = ['EWALLET', 'UPI', 'RUPAY_DEBIT', 'OTHER_DEBIT', 'CREDIT_CARD_STD', 'CREDIT_CARD_IPAY', 'NET_BANKING'];
    return modeKeys.map(key => this.calculatePaymentModeTotal(key, baseFarePerPerson, passengers, isAC, optInsurance));
  }
};

// Universal Module Definition for Browser and Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTE_CALCULATOR;
}
