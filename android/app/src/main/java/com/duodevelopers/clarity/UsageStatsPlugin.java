package com.duodevelopers.clarity;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Process;
import android.provider.Settings;
import android.text.TextUtils;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;

import java.util.List;

@CapacitorPlugin(name = "UsageStatsPlugin")
public class UsageStatsPlugin extends Plugin {

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Context context = getContext();
        AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);

        int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.getPackageName()
        );

        boolean granted = mode == AppOpsManager.MODE_ALLOWED;

        if (!granted) {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }

        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void getUsageStats(PluginCall call) {
        long startTime = call.getLong("startTime");
        long endTime = call.getLong("endTime");

        if (startTime == 0 || endTime == 0) {
            call.reject("Missing startTime or endTime");
            return;
        }

        UsageStatsManager usm = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime);

        long totalScreenTime = 0;
        long focusTime = 0;
        long distractionTime = 0;
        int appSwitches = 0;

        String lastApp = null;

        for (UsageStats usage : stats) {
            long timeInForeground = usage.getTotalTimeInForeground();

            if (timeInForeground > 0) {
                totalScreenTime += timeInForeground;

                String pkg = usage.getPackageName();
                if (!TextUtils.isEmpty(pkg)) {
                    if (pkg.contains("instagram") || pkg.contains("tiktok") || pkg.contains("facebook") || pkg.contains("twitter") || pkg.contains("youtube")) {
                        distractionTime += timeInForeground;
                    } else {
                        focusTime += timeInForeground;
                    }

                    if (!pkg.equals(lastApp)) {
                        appSwitches++;
                        lastApp = pkg;
                    }
                }
            }
        }

        JSObject result = new JSObject();
        result.put("totalScreenTime", totalScreenTime);
        result.put("focusTime", focusTime);
        result.put("distractionTime", distractionTime);
        result.put("appSwitches", appSwitches);

        call.resolve(result);
    }

    // test

    @PluginMethod
    public void testEcho(PluginCall call) {
        String value = call.getString("value");
        JSObject ret = new JSObject();
        ret.put("echo", value);
        call.resolve(ret);
    }

}
