/**
 * app.js - State Management, UI Event Binding, and Reactive DOM Updates
 * Tatkal Ticket Cost Estimator (TTE)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    classCode: '3A',
    isAC: true,
    passengers: 1,
    baseFare: 1950,
    currentWalletBal: 0,
    optInsurance: true
  };

  // DOM Elements - Inputs
  const classInputs = document.querySelectorAll('input[name="travel_class"]');
  const paxMinusBtn = document.getElementById('btn-pax-minus');
  const paxPlusBtn = document.getElementById('btn-pax-plus');
  const paxDisplay = document.getElementById('pax-count-display');
  const baseFareInput = document.getElementById('base-fare-input');
  const walletBalInput = document.getElementById('wallet-bal-input');
  const insuranceToggle = document.getElementById('insurance-toggle');
  const quickChips = document.querySelectorAll('.quick-chip');

  // DOM Elements - Outputs (Top-up Hero)
  const resTopUpAmount = document.getElementById('res-topup-amount');
  const resTopUpNote = document.getElementById('res-topup-note');
  const resAlertBox = document.getElementById('res-alert-box');
  const copyBtn = document.getElementById('copy-amount-btn');
  const toastNotice = document.getElementById('toast-notice');

  // DOM Elements - Outputs (Breakdown)
  const bTicketFare = document.getElementById('breakdown-ticket-fare');
  const bInsurance = document.getElementById('breakdown-insurance');
  const bConvenience = document.getElementById('breakdown-convenience-fee');
  const bWalletFee = document.getElementById('breakdown-wallet-fee');
  const bTotalPayable = document.getElementById('breakdown-total-payable');
  const bPaxCount = document.getElementById('breakdown-pax-count');

  // DOM Elements - Matrix
  const matrixTbody = document.getElementById('matrix-tbody');

  // Always pure light mode per user preference
  document.documentElement.removeAttribute('data-theme');

  // ==========================================================================
  // INITIALIZE IST COUNTDOWN & CLOCK
  // ==========================================================================
  const istClock = document.getElementById('ist-clock');
  const statusTag = document.getElementById('tatkal-status-tag');
  const digitsEl = document.getElementById('tatkal-countdown-digits');
  if (typeof TTE_COUNTDOWN !== 'undefined') {
    TTE_COUNTDOWN.init(istClock, statusTag, digitsEl);
  }

  // Currency Formatter
  const formatINR = (val) => {
    return '₹' + Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatINRRup = (val) => {
    return '₹' + Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  /**
   * Main Reactive Render Function
   */
  const render = () => {
    const ewalletData = TTE_CALCULATOR.calculateEWalletRequirements(
      state.baseFare,
      state.passengers,
      state.isAC,
      state.currentWalletBal,
      state.optInsurance
    );

    // 1. Update Breakdown Table
    if (bPaxCount) bPaxCount.textContent = state.passengers;
    if (bTicketFare) bTicketFare.textContent = formatINR(ewalletData.ticketFare);
    if (bInsurance) bInsurance.textContent = formatINR(ewalletData.insurance);
    if (bConvenience) bConvenience.textContent = formatINR(ewalletData.convenienceFee);
    if (bWalletFee) bWalletFee.textContent = formatINR(ewalletData.walletBookingFee);
    if (bTotalPayable) bTotalPayable.textContent = formatINR(ewalletData.totalPayable);

    // 2. Update Top-Up Hero Display & Alerts
    if (state.baseFare <= 0) {
      resTopUpAmount.textContent = '₹0';
      resTopUpNote.textContent = 'Enter ticket fare shown on IRCTC availability screen.';
      resAlertBox.style.display = 'none';
      if (copyBtn) copyBtn.style.display = 'none';
    } else if (ewalletData.exceedsMaxBalance) {
      resTopUpAmount.textContent = formatINRRup(ewalletData.recommendedSlabTopUp);
      resTopUpNote.textContent = 'Deposit required for this booking';
      resAlertBox.className = 'alert-box alert-danger';
      resAlertBox.style.display = 'flex';
      resAlertBox.innerHTML = `<div><strong>Exceeds IRCTC eWallet Limit:</strong> Maximum wallet balance allowed by IRCTC is ₹10,000. Total payable is ${formatINR(ewalletData.totalPayable)}. Pay directly via UPI or Credit Card.</div>`;
      if (copyBtn) copyBtn.style.display = 'inline-flex';
    } else if (ewalletData.isSufficient) {
      resTopUpAmount.textContent = '₹0';
      resTopUpNote.textContent = 'No deposit needed! Your eWallet has sufficient funds.';
      resAlertBox.className = 'alert-box alert-success';
      resAlertBox.style.display = 'flex';
      resAlertBox.innerHTML = `<div><strong>Sufficient Balance:</strong> Your available balance of ${formatINR(state.currentWalletBal)} fully covers the ${formatINR(ewalletData.totalPayable)} total.</div>`;
      if (copyBtn) copyBtn.style.display = 'none';
    } else {
      resTopUpAmount.textContent = formatINRRup(ewalletData.recommendedSlabTopUp);
      resTopUpNote.textContent = `Shortfall is ${formatINR(ewalletData.rawShortfall)}. Rounded to nearest valid ₹100 deposit slab (Leftover: ${formatINR(ewalletData.postBookingLeftover)}).`;
      resAlertBox.className = 'alert-box alert-warning';
      resAlertBox.style.display = 'flex';
      resAlertBox.innerHTML = `<div><strong>Top-Up Protocol:</strong> Recharge your eWallet via UPI on the official IRCTC portal before 09:55 AM or 10:55 AM to avoid gateway charges during wallet load.</div>`;
      if (copyBtn) copyBtn.style.display = 'inline-flex';
    }

    // 3. Update Multi-Payment Comparison Matrix
    const matrix = TTE_CALCULATOR.calculateFullComparison(
      state.baseFare,
      state.passengers,
      state.isAC,
      state.optInsurance
    );

    if (matrixTbody) {
      matrixTbody.innerHTML = '';
      matrix.forEach(mode => {
        const tr = document.createElement('tr');
        const badgeHtml = mode.recommendationBadge
          ? `<span class="matrix-recommendation ${mode.id === 'ewallet' ? 'rec-blue' : 'rec-green'}">${mode.recommendationBadge}</span>`
          : `<span class="matrix-speed-text">${mode.speedRating}</span>`;

        tr.innerHTML = `
          <td>
            <div class="matrix-mode-name">
              ${mode.name}
            </div>
          </td>
          <td><strong class="matrix-total">${formatINR(mode.totalPayable)}</strong></td>
          <td>${formatINR(mode.extraCharges)}</td>
          <td>${badgeHtml}</td>
        `;
        matrixTbody.appendChild(tr);
      });
    }
  };

  // Event Listeners - Travel Class Selector
  classInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      state.classCode = e.target.value;
      const classInfo = TTE_CONSTANTS.CLASSES[state.classCode];
      state.isAC = classInfo ? classInfo.isAC : true;
      render();
    });
  });

  // Event Listeners - Passenger Stepper (Bounded strictly to 1-4)
  if (paxMinusBtn) {
    paxMinusBtn.addEventListener('click', () => {
      if (state.passengers > 1) {
        state.passengers--;
        paxDisplay.textContent = state.passengers;
        render();
      }
    });
  }

  if (paxPlusBtn) {
    paxPlusBtn.addEventListener('click', () => {
      if (state.passengers < 4) {
        state.passengers++;
        paxDisplay.textContent = state.passengers;
        render();
      }
    });
  }

  // Event Listeners - Base Fare & Wallet Balance
  if (baseFareInput) {
    baseFareInput.addEventListener('input', (e) => {
      state.baseFare = Math.max(0, parseFloat(e.target.value) || 0);
      render();
    });
  }

  if (walletBalInput) {
    walletBalInput.addEventListener('input', (e) => {
      state.currentWalletBal = Math.max(0, parseFloat(e.target.value) || 0);
      render();
    });
  }

  // Event Listeners - Quick Fare Chips
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const fareVal = chip.dataset.fare;
      if (fareVal && baseFareInput) {
        baseFareInput.value = fareVal;
        baseFareInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  // Event Listeners - Travel Insurance
  if (insuranceToggle) {
    insuranceToggle.addEventListener('change', (e) => {
      state.optInsurance = e.target.checked;
      render();
    });
  }

  // Event Listener - Copy Top-Up Amount Button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const rawText = resTopUpAmount.textContent.replace('₹', '').replace(/,/g, '').trim();
      if (rawText && !isNaN(rawText)) {
        navigator.clipboard.writeText(rawText).then(() => {
          showToast(`Copied ₹${rawText} to clipboard!`);
        }).catch(() => {
          showToast(`Amount: ₹${rawText}`);
        });
      }
    });
  }

  // Toast Function
  function showToast(msg) {
    if (!toastNotice) return;
    toastNotice.textContent = msg;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2500);
  }

  // FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (item) {
        item.classList.toggle('open');
      }
    });
  });

  // Initial Calculation Run
  render();
});
