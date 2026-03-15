import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { fileName, contentType, folder } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    // Generate a unique key: folder/timestamp-randomId.extension
    const ext = fileName.split(".").pop() || "webp";
    const uniqueKey = `${folder || "uploads"}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueKey,
      ContentType: contentType,
    });

    // Presigned URL valid for 10 minutes
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

    // The public URL where the file will be accessible after upload
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${uniqueKey}`;

    return NextResponse.json({ presignedUrl, publicUrl });
  } catch (error) {
    console.error("Upload URL generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
