package com.andro.ethicaldemo;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public final class MainActivity extends Activity implements View.OnClickListener, Runnable {
    private static final String CHANNEL_ID = "andro_demo_session";
    private static final int NOTIFICATION_PERMISSION_REQUEST = 1001;

    private Button startButton;
    private Button stopButton;
    private TextView statusText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(resource("activity_main", "layout"));
        startButton = findViewById(resource("start_session", "id"));
        stopButton = findViewById(resource("stop_session", "id"));
        statusText = findViewById(resource("session_status", "id"));
        startButton.setOnClickListener(this);
        stopButton.setOnClickListener(this);
        updateControls();
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateControls();
    }

    @Override
    public void onClick(View view) {
        if (view == startButton) {
            requestNotificationPermissionOrStart();
        } else if (view == stopButton) {
            stopDemoSession();
        }
    }

    @Override
    public void run() {
        updateControls();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != NOTIFICATION_PERMISSION_REQUEST) return;
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            requestNotificationPermissionOrStart();
        } else {
            Toast.makeText(this, text("notification_permission_denied"), Toast.LENGTH_LONG).show();
            updateControls();
        }
    }

    private void requestNotificationPermissionOrStart() {
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION_REQUEST);
            return;
        }
        if (!canShowNotificationControls()) {
            Toast.makeText(this, text("notification_permission_denied"), Toast.LENGTH_LONG).show();
            return;
        }
        startDemoSession();
    }

    private boolean canShowNotificationControls() {
        if (Build.VERSION.SDK_INT < 24) return true;
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (manager == null || !manager.areNotificationsEnabled()) return false;
        if (Build.VERSION.SDK_INT < 26) return true;
        NotificationChannel channel = manager.getNotificationChannel(CHANNEL_ID);
        return channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
    }

    private void startDemoSession() {
        Intent intent = new Intent(this, DemoSessionService.class);
        try {
            if (Build.VERSION.SDK_INT >= 26) startForegroundService(intent);
            else startService(intent);
            statusText.setText(text("session_status_starting"));
            startButton.setEnabled(false);
            stopButton.setEnabled(true);
            Toast.makeText(this, text("session_started_message"), Toast.LENGTH_SHORT).show();
            statusText.postDelayed(this, 250L);
        } catch (RuntimeException error) {
            statusText.setText(text("session_start_failed"));
            startButton.setEnabled(true);
            stopButton.setEnabled(false);
            Toast.makeText(this, text("session_start_failed"), Toast.LENGTH_LONG).show();
        }
    }

    private void stopDemoSession() {
        stopService(new Intent(this, DemoSessionService.class));
        updateControls();
        Toast.makeText(this, text("session_stopped_message"), Toast.LENGTH_SHORT).show();
    }

    private void updateControls() {
        if (startButton == null || stopButton == null || statusText == null) return;
        boolean running = DemoSessionService.isRunning();
        startButton.setEnabled(!running);
        stopButton.setEnabled(running);
        statusText.setText(text(running ? "session_status_active" : "session_status_idle"));
    }

    private int resource(String name, String type) {
        int identifier = getResources().getIdentifier(name, type, getPackageName());
        if (identifier == 0) throw new IllegalStateException("Missing app resource: " + type + "/" + name);
        return identifier;
    }

    private String text(String name) {
        return getString(resource(name, "string"));
    }
}
