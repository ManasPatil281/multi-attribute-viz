import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        }
      : undefined,
})

export async function POST(request: NextRequest) {
  try {
    console.log("📤 Upload API called")
    
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("❌ No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`📄 File received: ${file.name} (${file.size} bytes)`)

    if (!file.name.endsWith(".csv")) {
      console.log("❌ Invalid file type")
      return NextResponse.json({ error: "Only CSV files are allowed" }, { status: 400 })
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME
    if (!bucketName) {
      console.log("❌ S3 bucket not configured")
      return NextResponse.json({ error: "S3 bucket not configured" }, { status: 500 })
    }

    console.log(`🪣 Uploading to bucket: ${bucketName}`)

    const fileBuffer = await file.arrayBuffer()
    const key = `uploads/${Date.now()}-${file.name}`

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: "text/csv",
    })

    await s3Client.send(command)

    console.log(`✅ File uploaded to S3: s3://${bucketName}/${key}`)

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      key,
      fileName: file.name,
      url: `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    })
  } catch (error: any) {
    console.error("❌ Upload error:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    )
  }
}
