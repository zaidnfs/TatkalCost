/**
 * countdown.js - Real-time Indian Standard Time (IST) Clock & Tatkal Rush Timers
 * Timezone-invariant: Always computes based on UTC+05:30.
 */

const TTE_COUNTDOWN = {
  /**
   * Get current Date object shifted to Indian Standard Time (UTC+05:30)
   */
  getISTDate() {
    const now = new Date();
    // UTC time in milliseconds
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    // Add 5 hours and 30 minutes (5.5 * 3600 * 1000 = 19800000 ms)
    return new Date(utcTime + 19800000);
  },

  /**
   * Format numbers to 2-digit zero-padded string
   */
  pad(num) {
    return num.toString().padStart(2, '0');
  },

  /**
   * Format IST time as HH:MM:SS AM/PM
   */
  formatTime(date) {
    let hours = date.getHours();
    const minutes = this.pad(date.getMinutes());
    const seconds = this.pad(date.getSeconds());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${this.pad(hours)}:${minutes}:${seconds} ${ampm} IST`;
  },

  /**
   * Compute next target Tatkal timestamp
   */
  getTatkalStatus() {
    const ist = this.getISTDate();
    const year = ist.getFullYear();
    const month = ist.getMonth();
    const day = ist.getDate();
    const currentMs = ist.getTime();

    // 10:00 AM IST today
    const acOpenMs = new Date(year, month, day, 10, 0, 0).getTime();
    // 10:30 AM IST today
    const acAgentOpenMs = new Date(year, month, day, 10, 30, 0).getTime();
    // 11:00 AM IST today
    const nonAcOpenMs = new Date(year, month, day, 11, 0, 0).getTime();
    // 11:30 AM IST today
    const nonAcAgentOpenMs = new Date(year, month, day, 11, 30, 0).getTime();
    // 10:00 AM IST tomorrow
    const tomorrowAcOpenMs = new Date(year, month, day + 1, 10, 0, 0).getTime();

    if (currentMs < acOpenMs) {
      // Before 10:00 AM
      const diffMs = acOpenMs - currentMs;
      return {
        state: 'WAITING',
        targetLabel: 'AC Tatkal (3A/2A/3E/CC) opens in',
        diffMs,
        isOpenNow: false
      };
    } else if (currentMs >= acOpenMs && currentMs < acAgentOpenMs) {
      // 10:00 AM to 10:30 AM
      return {
        state: 'ACTIVE_AC',
        targetLabel: 'AC Tatkal BOOKING OPEN NOW (Direct users only)',
        diffMs: nonAcOpenMs - currentMs,
        isOpenNow: true,
        secondaryNote: 'Non-AC opens at 11:00 AM'
      };
    } else if (currentMs >= acAgentOpenMs && currentMs < nonAcOpenMs) {
      // 10:30 AM to 11:00 AM
      const diffMs = nonAcOpenMs - currentMs;
      return {
        state: 'WAITING',
        targetLabel: 'Non-AC Tatkal (Sleeper/2S) opens in',
        diffMs,
        isOpenNow: false,
        secondaryNote: 'AC Tatkal agents now open'
      };
    } else if (currentMs >= nonAcOpenMs && currentMs < nonAcAgentOpenMs) {
      // 11:00 AM to 11:30 AM
      return {
        state: 'ACTIVE_NON_AC',
        targetLabel: 'Non-AC Tatkal BOOKING OPEN NOW (Direct users only)',
        diffMs: 0,
        isOpenNow: true
      };
    } else {
      // After 11:30 AM, countdown to tomorrow 10:00 AM
      const diffMs = tomorrowAcOpenMs - currentMs;
      return {
        state: 'WAITING',
        targetLabel: 'Next Tatkal (AC) opens tomorrow in',
        diffMs,
        isOpenNow: false
      };
    }
  },

  /**
   * Convert milliseconds to HH:MM:SS string
   */
  formatDuration(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hours = this.pad(Math.floor(totalSec / 3600));
    const mins = this.pad(Math.floor((totalSec % 3600) / 60));
    const secs = this.pad(totalSec % 60);
    return `${hours}:${mins}:${secs}`;
  },

  /**
   * Start countdown loop binding to DOM elements
   */
  init(istClockEl, statusTagEl, digitsEl) {
    const update = () => {
      const istDate = this.getISTDate();
      if (istClockEl) {
        istClockEl.textContent = this.formatTime(istDate);
      }

      const status = this.getTatkalStatus();

      if (statusTagEl && digitsEl) {
        if (status.isOpenNow) {
          statusTagEl.className = 'countdown-tag tag-active';
          statusTagEl.innerHTML = '● LIVE NOW';
          digitsEl.textContent = status.targetLabel;
        } else {
          statusTagEl.className = 'countdown-tag tag-waiting';
          statusTagEl.innerHTML = '⏱ COUNTDOWN';
          digitsEl.innerHTML = `${status.targetLabel} <span style="color:#60a5fa;margin-left:0.25rem;">${this.formatDuration(status.diffMs)}</span>`;
        }
      }
    };

    update();
    setInterval(update, 1000);
  }
};

// Universal export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTE_COUNTDOWN;
}
