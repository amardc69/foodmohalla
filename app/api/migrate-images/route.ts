import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import sharp from "sharp";

/**
 * ONE-TIME MIGRATION SCRIPT
 * Downloads images from Convex storage URLs, compresses them using sharp 
 * to ensure they are under 1MB, and re-uploads them to Cloudflare R2.
 * Updates the Convex database records with new R2 URLs.
 *
 * Run by visiting: GET /api/migrate-images (or via curl)
 * DELETE THIS FILE AFTER MIGRATION IS COMPLETE.
 */

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    let contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // Compress the image with sharp to ensure it's under 1MB.
    // Converting to WebP with quality 80 and a max width/height of 1200 will easily fit under 1MB.
    try {
      buffer = await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      contentType = "image/webp";
    } catch (sharpErr) {
      console.warn(`Sharp compression failed for ${url}, proceeding with uncompressed buffer.`, sharpErr);
    }

    return { buffer, contentType };
  } catch (err) {
    console.error(`Failed to download: ${url}`, err);
    return null;
  }
}

async function uploadToR2(buffer: Buffer, contentType: string, folder: string): Promise<string> {
  const ext = contentType.split("/")[1] || "jpeg";
  let keyExt = ext === "webp" ? "webp" : ext;
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${keyExt}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

function isConvexUrl(url: string): boolean {
  return url.includes("convex.cloud") || url.includes("convex.site");
}

export async function GET() {
  const results: { type: string; name: string; status: string; oldUrl?: string; newUrl?: string; error?: string }[] = [];

  try {
    // ============ MIGRATE MENU ITEMS ============
    const menuItems = await convex.query(api.menu.getMenuItems, {});

    for (const item of menuItems) {
      if (!item.image || !isConvexUrl(item.image)) {
        results.push({ type: "menuItem", name: item.name, status: "skipped", oldUrl: item.image });
        continue;
      }

      try {
        const downloaded = await downloadImage(item.image);
        if (!downloaded) {
          results.push({ type: "menuItem", name: item.name, status: "download_failed", oldUrl: item.image });
          continue;
        }

        const newUrl = await uploadToR2(downloaded.buffer, downloaded.contentType, "menu-items");

        // Update the database record with the new R2 URL
        await convex.mutation(api.menu.updateMenuItem, {
          _id: item._id,
          image: newUrl,
        });

        results.push({ type: "menuItem", name: item.name, status: "migrated", oldUrl: item.image, newUrl });
      } catch (err: any) {
        results.push({ type: "menuItem", name: item.name, status: "error", error: err.message });
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    // ============ MIGRATE CATEGORIES ============
    const categories = await convex.query(api.menu.getCategories, {});

    for (const cat of categories) {
      if (!cat.image || !isConvexUrl(cat.image)) {
        results.push({ type: "category", name: cat.name, status: "skipped", oldUrl: cat.image });
        continue;
      }

      try {
        const downloaded = await downloadImage(cat.image);
        if (!downloaded) {
          results.push({ type: "category", name: cat.name, status: "download_failed", oldUrl: cat.image });
          continue;
        }

        const newUrl = await uploadToR2(downloaded.buffer, downloaded.contentType, "categories");

        await convex.mutation(api.menu.updateCategory, {
          _id: cat._id,
          image: newUrl,
        });

        results.push({ type: "category", name: cat.name, status: "migrated", oldUrl: cat.image, newUrl });
      } catch (err: any) {
        results.push({ type: "category", name: cat.name, status: "error", error: err.message });
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    // Summary
    const migrated = results.filter((r) => r.status === "migrated").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const failed = results.filter((r) => r.status !== "migrated" && r.status !== "skipped").length;

    return NextResponse.json({
      summary: { total: results.length, migrated, skipped, failed },
      details: results,
    });
  } catch (error: any) {
    console.error("Migration failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
