import { NextRequest, NextResponse } from "next/server";
import { FeedSyncService } from "@/lib/services/feed-sync";

// POST /api/feeds/[id]/sync - Manuel senkronizasyon başlat
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: feedId } = await params;

        // Senkronizasyon servisini başlat
        const syncService = new FeedSyncService();
        const result = await syncService.syncFeed(feedId);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Senkronizasyon tamamlandı ancak hatalar oluştu",
                    result,
                },
                { status: 207 } // Multi-Status
            );
        }

        return NextResponse.json({
            success: true,
            message: "Senkronizasyon başarıyla tamamlandı",
            result,
        });
    } catch (error) {
        console.error("Senkronizasyon hatası:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Senkronizasyon sırasında bir hata oluştu",
                details: error instanceof Error ? error.message : "Bilinmeyen hata",
            },
            { status: 500 }
        );
    }
}