package com.andro.ethicaldemo;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

@SuppressWarnings("deprecation")
public final class DemoSessionService extends Service implements Runnable {
    private static final String ACTION_STOP = "com.andro.ethicaldemo.action.STOP_DEMO_SESSION";
    private static final String CHANNEL_ID = "andro_demo_session";
    private static final int NOTIFICATION_ID = 0xA11;
    private static final long MAX_SESSION_MILLIS = 60L * 60L * 1000L;
    private static volatile boolean running;

    private Handler timeoutHandler;

    public static boolean isRunning() {
        return running;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        timeoutHandler = new Handler(Looper.getMainLooper());
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopSession();
            return START_NOT_STICKY;
        }

        try {
            Notification notification = buildNotification();
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
            running = true;
            timeoutHandler.removeCallbacks(this);
            timeoutHandler.postDelayed(this, MAX_SESSION_MILLIS);
        } catch (RuntimeException error) {
            running = false;
            stopSelf();
        }
        return START_NOT_STICKY;
    }

    @Override
    public void run() {
        stopSession();
    }

    @Override
    public void onDestroy() {
        if (timeoutHandler != null) timeoutHandler.removeCallbacks(this);
        removeForegroundNotification();
        running = false;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void stopSession() {
        removeForegroundNotification();
        running = false;
        stopSelf();
    }

    private void removeForegroundNotification() {
        if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE);
        else stopForeground(true);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                text("notification_channel_name"),
                NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription(text("notification_channel_description"));
        channel.setShowBadge(false);
        channel.enableVibration(false);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
    }

    private Notification buildNotification() {
        Intent openIntent = new Intent(this, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent openPendingIntent = PendingIntent.getActivity(
                this, 1, openIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent stopIntent = new Intent(this, DemoSessionService.class).setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(
                this, 2, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification.Builder builder = Build.VERSION.SDK_INT >= 26
                ? new Notification.Builder(this, CHANNEL_ID)
                : new Notification.Builder(this);
        int icon = resource("ic_notification", "drawable");
        return builder
                .setSmallIcon(icon)
                .setContentTitle(text("notification_title"))
                .setContentText(text("notification_text"))
                .setContentIntent(openPendingIntent)
                .setCategory(Notification.CATEGORY_SERVICE)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setUsesChronometer(true)
                .addAction(icon, text("notification_stop"), stopPendingIntent)
                .build();
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
