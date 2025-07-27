// usageStats.web.ts
import { WebPlugin } from '@capacitor/core';

export class UsageStatsWeb extends WebPlugin {
  async requestPermission() {
    throw this.unimplemented('requestPermission is not available on web.');
  }

  async getUsageStats() {
    throw this.unimplemented('getUsageStats is not available on web.');
  }

  async getCurrentForegroundApp() {
    throw this.unimplemented('getCurrentForegroundApp is not available on web.');
  }

  async detectAppSwitch() {
    throw this.unimplemented('detectAppSwitch is not available on web.');
  }
}
