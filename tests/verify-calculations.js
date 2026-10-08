/**
 * verify-calculations.js - Automated Test Suite for TTE Calculation Engine
 * Tests all 10 scenarios defined in Docs/TEST_PLAN.md
 */

const assert = require('assert');
const CONSTANTS = require('../js/constants.js');
const CALCULATOR = require('../js/calculator.js');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n--- Running TTE Calculation Verification Suite --- \n');

// Test 1: Standard 3AC Single Passenger
runTest('Scenario 1: Standard 3AC Single Passenger with Insurance', () => {
  const result = CALCULATOR.calculateEWalletRequirements(1950, 1, true, 0, true);
  assert.strictEqual(result.ticketFare, 1950.00, 'Ticket fare should be 1950.00');
  assert.strictEqual(result.insurance, 0.45, 'Insurance should be 0.45');
  assert.strictEqual(result.convenienceFee, 35.40, 'Convenience fee for AC Non-UPI should be 35.40');
  assert.strictEqual(result.walletBookingFee, 11.80, 'Wallet fee should be 11.80');
  assert.strictEqual(result.totalPayable, 1997.65, 'Total payable should be 1997.65');
  assert.strictEqual(result.exactShortfall, 1998, 'Exact shortfall ceiling should be 1998');
  assert.strictEqual(result.recommendedSlabTopUp, 2000, 'Recommended slab top-up should be 2000');
  assert.strictEqual(result.isSufficient, false, 'Balance should not be sufficient');
  assert.strictEqual(result.exceedsMaxBalance, false, 'Should not exceed max balance');
});

// Test 2: UPI comparison for 3AC
runTest('Scenario 1b: UPI Payment Comparison for 3AC Single Passenger', () => {
  const upiResult = CALCULATOR.calculatePaymentModeTotal('UPI', 1950, 1, true, true);
  assert.strictEqual(upiResult.ticketFare, 1950.00);
  assert.strictEqual(upiResult.insurance, 0.45);
  assert.strictEqual(upiResult.convenienceFee, 23.60, 'UPI AC convenience fee should be 23.60');
  assert.strictEqual(upiResult.gatewayFee, 0.00, 'UPI gateway fee should be 0.00');
  assert.strictEqual(upiResult.totalPayable, 1974.05, 'UPI total payable should be 1974.05');
});

// Test 3: Sleeper Class (Non-AC) with Multiple Passengers
runTest('Scenario 2: Sleeper Class Non-AC with 3 Passengers and Existing Balance', () => {
  const result = CALCULATOR.calculateEWalletRequirements(450, 3, false, 500, false);
  assert.strictEqual(result.ticketFare, 1350.00, '3 x 450 should be 1350.00');
  assert.strictEqual(result.insurance, 0.00, 'Insurance should be 0.00 when opted out');
  assert.strictEqual(result.convenienceFee, 17.70, 'Non-AC Non-UPI convenience fee should be 17.70 flat per PNR');
  assert.strictEqual(result.walletBookingFee, 11.80, 'Wallet fee should be 11.80');
  assert.strictEqual(result.totalPayable, 1379.50, 'Total payable should be 1379.50');
  assert.strictEqual(result.rawShortfall, 879.50, 'Shortfall should be 879.50');
  assert.strictEqual(result.recommendedSlabTopUp, 900, 'Recommended slab should be 900');
});

// Test 4: Sufficient Balance Check
runTest('Scenario 3: Wallet Balance Already Sufficient', () => {
  const result = CALCULATOR.calculateEWalletRequirements(850, 1, true, 1000, true);
  assert.strictEqual(result.totalPayable, 897.65);
  assert.strictEqual(result.isSufficient, true, 'isSufficient must be true');
  assert.strictEqual(result.rawShortfall, 0);
  assert.strictEqual(result.recommendedSlabTopUp, 0, 'No top up needed');
});

// Test 5: Maximum Balance Limit Exceeded (> ₹10,000)
runTest('Scenario 4: Maximum Wallet Limit Exceeded Alert', () => {
  const result = CALCULATOR.calculateEWalletRequirements(2800, 4, true, 0, true);
  assert.strictEqual(result.ticketFare, 11200.00);
  assert.strictEqual(result.exceedsMaxBalance, true, 'exceedsMaxBalance must be true when total > 10000');
});

// Test 6: Minimum Top-Up Rule (₹100 minimum deposit)
runTest('Scenario 5: Shortfall below ₹100 rounds up to minimum ₹100 deposit', () => {
  // Total payable ~ 1997.65, user has 1950, shortfall = 47.65 <= 100
  const result = CALCULATOR.calculateEWalletRequirements(1950, 1, true, 1950, true);
  assert.strictEqual(result.isSufficient, false);
  assert.strictEqual(result.rawShortfall, 47.65);
  assert.strictEqual(result.recommendedSlabTopUp, 100, 'Minimum top-up must be 100 when shortfall <= 100');
});

// Test 7: Tatkal Passenger Count Boundary Enforcement (Max 4)
runTest('Scenario 6: Passenger count strictly bounded to Tatkal limits (1 to 4)', () => {
  const resultOver = CALCULATOR.calculateEWalletRequirements(500, 6, false, 0, false);
  assert.strictEqual(resultOver.passengers, 4, '6 passengers must be clamped to max 4');
  assert.strictEqual(resultOver.ticketFare, 2000.00);

  const resultUnder = CALCULATOR.calculateEWalletRequirements(500, 0, false, 0, false);
  assert.strictEqual(resultUnder.passengers, 1, '0 passengers must be clamped to min 1');
  assert.strictEqual(resultUnder.ticketFare, 500.00);
});

// Test 8: RuPay Debit Card 0% Gateway Charge
runTest('Scenario 7: RuPay Debit Card has 0% gateway fee and non-UPI convenience fee', () => {
  const rupayResult = CALCULATOR.calculatePaymentModeTotal('RUPAY_DEBIT', 1000, 1, true, false);
  assert.strictEqual(rupayResult.gatewayFee, 0.00);
  assert.strictEqual(rupayResult.convenienceFee, 35.40);
  assert.strictEqual(rupayResult.totalPayable, 1035.40);
});

// Test 9: Domestic Credit Card Gateway Surcharge + GST Calculation
runTest('Scenario 8: Domestic Credit Card (1% + 18% GST)', () => {
  const ccResult = CALCULATOR.calculatePaymentModeTotal('CREDIT_CARD_STD', 2000, 1, true, false);
  // Base = Fare (2000) + Convenience fee (35.40) = 2035.40
  // 1% of 2035.40 = 20.354. GST @ 18% on 20.354 = 3.66372. Total gateway fee = 24.02
  assert.strictEqual(ccResult.convenienceFee, 35.40);
  assert.strictEqual(ccResult.gatewayFee, 24.02);
  assert.strictEqual(ccResult.totalPayable, 2059.42);
});

// Test 10: Full Comparison Matrix Generation
runTest('Scenario 9: Full Comparison Matrix returns all 7 methods correctly', () => {
  const matrix = CALCULATOR.calculateFullComparison(1500, 2, true, true);
  assert.strictEqual(matrix.length, 7, 'Matrix must contain 7 payment options');
  const ewallet = matrix.find(m => m.id === 'ewallet');
  const upi = matrix.find(m => m.id === 'upi');
  assert.ok(ewallet, 'eWallet must be present');
  assert.ok(upi, 'UPI must be present');
  assert.ok(ewallet.totalPayable > upi.totalPayable, 'eWallet total should reflect speed premium over UPI');
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('🎉 ALL CALCULATION TESTS PASSED PERFECTLY!\n');
}
