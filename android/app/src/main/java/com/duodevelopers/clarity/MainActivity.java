package com.duodevelopers.clarity;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register the UsageStatsPlugin
        registerPlugin(UsageStatsPlugin.class);
    }
}
