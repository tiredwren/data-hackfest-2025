package com.duodevelopers.clarity;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
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

    private String lastForegroundApp = null;

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);

        JSObject result = new JSObject();
        result.put("opened", true);
        call.resolve(result);
    }

    @PluginMethod
    public void checkPermissionStatus(PluginCall call) {
        Context context = getContext();
        AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);

        int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.getPackageName()
        );

        boolean granted = mode == AppOpsManager.MODE_ALLOWED;

        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void getUsageStats(PluginCall call) {
        long startTime = call.getLong("startTime", 0L);
        long endTime = call.getLong("endTime", 0L);

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

    @PluginMethod
    public void getCurrentForegroundApp(PluginCall call) {
        UsageStatsManager usm = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        long endTime = System.currentTimeMillis();
        long beginTime = endTime - 10000; // last 10 seconds

        List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, beginTime, endTime);

        if (stats == null || stats.isEmpty()) {
            call.reject("No usage stats available. Permission might be missing.");
            return;
        }

        UsageStats recent = null;
        for (UsageStats usage : stats) {
            if (recent == null || usage.getLastTimeUsed() > recent.getLastTimeUsed()) {
                recent = usage;
            }
        }

        if (recent != null) {
            JSObject result = new JSObject();
            result.put("packageName", recent.getPackageName());
            result.put("appName", recent.getPackageName()); // Optional: resolve actual app name
            call.resolve(result);
        } else {
            call.reject("No foreground app found.");
        }
    }

    @PluginMethod
    public void detectAppSwitch(PluginCall call) {
        UsageStatsManager usm = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        long now = System.currentTimeMillis();
        long begin = now - 5000;

        List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, begin, now);

        if (stats == null || stats.isEmpty()) {
            call.reject("No usage stats available.");
            return;
        }

        UsageStats recent = null;
        for (UsageStats usage : stats) {
            if (recent == null || usage.getLastTimeUsed() > recent.getLastTimeUsed()) {
                recent = usage;
            }
        }

        if (recent != null) {
            String currentApp = recent.getPackageName();
            boolean switched = !currentApp.equals(lastForegroundApp);
            String fromApp = lastForegroundApp != null ? lastForegroundApp : "";
            String toApp = currentApp;

            lastForegroundApp = currentApp;

            JSObject result = new JSObject();
            result.put("switched", switched);
            result.put("fromApp", fromApp);
            result.put("toApp", toApp);
            result.put("timestamp", now);
            call.resolve(result);
        } else {
            call.reject("Unable to detect app switch.");
        }
    }

    @PluginMethod
    public void testEcho(PluginCall call) {
        String value = call.getString("value");
        JSObject ret = new JSObject();
        ret.put("echo", value);
        call.resolve(ret);
    }
}
