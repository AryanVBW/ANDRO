.class Lio/socket/parser/Parser$BinaryReconstructor;
.super Ljava/lang/Object;
.source "Parser.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lio/socket/parser/Parser;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x8
    name = "BinaryReconstructor"
.end annotation


# instance fields
.field buffers:Ljava/util/List;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/List<",
            "[B>;"
        }
    .end annotation
.end field

.field public reconPack:Lio/socket/parser/Packet;


# direct methods
.method constructor <init>(Lio/socket/parser/Packet;)V
    .locals 1
    .param p1, "packet"    # Lio/socket/parser/Packet;

    .line 254
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    .line 255
    iput-object p1, p0, Lio/socket/parser/Parser$BinaryReconstructor;->reconPack:Lio/socket/parser/Packet;

    .line 256
    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    iput-object v0, p0, Lio/socket/parser/Parser$BinaryReconstructor;->buffers:Ljava/util/List;

    .line 257
    return-void
.end method


# virtual methods
.method public finishReconstruction()V
    .locals 1

    .line 271
    const/4 v0, 0x0

    iput-object v0, p0, Lio/socket/parser/Parser$BinaryReconstructor;->reconPack:Lio/socket/parser/Packet;

    .line 272
    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    iput-object v0, p0, Lio/socket/parser/Parser$BinaryReconstructor;->buffers:Ljava/util/List;

    .line 273
    return-void
.end method

.method public takeBinaryData([B)Lio/socket/parser/Packet;
    .locals 3
    .param p1, "binData"    # [B

    .line 260
    iget-object v0, p0, Lio/socket/parser/Parser$BinaryReconstructor;->buffers:Ljava/util/List;

    invoke-interface {v0, p1}, Ljava/util/List;->add(Ljava/lang/Object;)Z

    .line 261
    iget-object v0, p0, Lio/socket/parser/Parser$BinaryReconstructor;->buffers:Ljava/util/List;

    invoke-interface {v0}, Ljava/util/List;->size()I

    move-result v0

    iget-object v1, p0, Lio/socket/parser/Parser$BinaryReconstructor;->reconPack:Lio/socket/parser/Packet;

    iget v1, v1, Lio/socket/parser/Packet;->attachments:I

    if-ne v0, v1, :cond_0

    .line 262
    iget-object v0, p0, Lio/socket/parser/Parser$BinaryReconstructor;->reconPack:Lio/socket/parser/Packet;

    iget-object v1, p0, Lio/socket/parser/Parser$BinaryReconstructor;->buffers:Ljava/util/List;

    .line 263
    invoke-interface {v1}, Ljava/util/List;->size()I

    move-result v2

    new-array v2, v2, [[B

    invoke-interface {v1, v2}, Ljava/util/List;->toArray([Ljava/lang/Object;)[Ljava/lang/Object;

    move-result-object v1

    check-cast v1, [[B

    .line 262
    invoke-static {v0, v1}, Lio/socket/parser/Binary;->reconstructPacket(Lio/socket/parser/Packet;[[B)Lio/socket/parser/Packet;

    move-result-object v0

    .line 264
    .local v0, "packet":Lio/socket/parser/Packet;
    invoke-virtual {p0}, Lio/socket/parser/Parser$BinaryReconstructor;->finishReconstruction()V

    .line 265
    return-object v0

    .line 267
    .end local v0    # "packet":Lio/socket/parser/Packet;
    :cond_0
    const/4 v0, 0x0

    return-object v0
.end method
