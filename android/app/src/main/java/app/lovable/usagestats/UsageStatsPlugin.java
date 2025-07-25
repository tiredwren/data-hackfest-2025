package app.lovable.usagestats;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "UsageStats")
public class UsageStatsPlugin extends Plugin {

    private UsageStatsManager usageStatsManager;
    private PackageManager packageManager;

    @Override
    public void load() {
        usageStatsManager = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        packageManager = getContext().getPackageManager();
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (hasUsageStatsPermission()) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        } else {
            // Open settings to request permission
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            getActivity().startActivity(intent);
            
            JSObject ret = new JSObject();
            ret.put("granted", false);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void getUsageStats(PluginCall call) {
        if (!hasUsageStatsPermission()) {
            call.reject("Usage stats permission not granted");
            return;
        }

        long startTime = call.getLong("startTime", System.currentTimeMillis() - (24 * 60 * 60 * 1000));
        long endTime = call.getLong("endTime", System.currentTimeMillis());

        Map<String, UsageStats> stats = usageStatsManager.queryAndAggregateUsageStats(
            startTime, endTime
        );

        JSArray appsArray = new JSArray();
        long totalScreenTime = 0;
        long focusTime = 0;
        long distractionTime = 0;
        int appSwitches = 0;

        // Focus apps (productivity, development, work)
        String[] focusApps = {
            "com.microsoft.vscode", "notion.id", "com.slack", "com.google.android.apps.docs",
            "com.microsoft.office", "com.adobe", "com.jetbrains", "org.mozilla.firefox"
        };

        // Distraction apps (social media, games, entertainment)
        String[] distractionApps = {
            "com.instagram.android", "com.zhiliaoapp.musically", "com.snapchat.android",
            "com.facebook.katana", "com.twitter.android", "com.youtube.android", "com.netflix.mediaclient"
        };

        for (UsageStats usageStat : stats.values()) {
            if (usageStat.getTotalTimeInForeground() > 0) {
                JSObject appObj = new JSObject();
                String packageName = usageStat.getPackageName();
                String appName = getAppName(packageName);
                
                appObj.put("packageName", packageName);
                appObj.put("appName", appName);
                appObj.put("totalTimeInForeground", usageStat.getTotalTimeInForeground());
                appObj.put("firstTimeStamp", usageStat.getFirstTimeStamp());
                appObj.put("lastTimeStamp", usageStat.getLastTimeStamp());
                appObj.put("lastTimeUsed", usageStat.getLastTimeUsed());
                
                appsArray.put(appObj);
                totalScreenTime += usageStat.getTotalTimeInForeground();

                // Categorize app usage
                if (isAppInCategory(packageName, focusApps)) {
                    focusTime += usageStat.getTotalTimeInForeground();
                } else if (isAppInCategory(packageName, distractionApps)) {
                    distractionTime += usageStat.getTotalTimeInForeground();
                }
            }
        }

        // Calculate app switches (simplified estimation)
        appSwitches = Math.max(stats.size() * 3, 50); // Rough estimate

        JSObject result = new JSObject();
        result.put("apps", appsArray);
        result.put("totalScreenTime", totalScreenTime);
        result.put("appSwitches", appSwitches);
        result.put("focusTime", focusTime);
        result.put("distractionTime", distractionTime);

        call.resolve(result);
    }

    @PluginMethod
    public void getCurrentForegroundApp(PluginCall call) {
        if (!hasUsageStatsPermission()) {
            call.reject("Usage stats permission not granted");
            return;
        }

        long endTime = System.currentTimeMillis();
        long startTime = endTime - (5 * 60 * 1000); // Last 5 minutes

        Map<String, UsageStats> stats = usageStatsManager.queryAndAggregateUsageStats(
            startTime, endTime
        );

        String currentApp = "";
        String currentAppName = "";
        long lastUsed = 0;

        for (UsageStats usageStat : stats.values()) {
            if (usageStat.getLastTimeUsed() > lastUsed) {
                lastUsed = usageStat.getLastTimeUsed();
                currentApp = usageStat.getPackageName();
                currentAppName = getAppName(currentApp);
            }
        }

        JSObject result = new JSObject();
        result.put("packageName", currentApp);
        result.put("appName", currentAppName);
        call.resolve(result);
    }

    private boolean hasUsageStatsPermission() {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(), getContext().getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private String getAppName(String packageName) {
        try {
            ApplicationInfo appInfo = packageManager.getApplicationInfo(packageName, 0);
            return packageManager.getApplicationLabel(appInfo).toString();
        } catch (PackageManager.NameNotFoundException e) {
            return packageName;
        }
    }

    private boolean isAppInCategory(String packageName, String[] categoryApps) {
        for (String app : categoryApps) {
            if (packageName.contains(app) || app.contains(packageName)) {
                return true;
            }
        }
        return false;
    }
}