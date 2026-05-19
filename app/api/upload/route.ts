import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Load `sharp` dynamically because native binaries may not be available
// in some dev environments (prevents import-time crashes).
let _Sharp: any | null | undefined = undefined;
async function getSharp() {
  if (_Sharp !== undefined) return _Sharp;
  try {
    // dynamic import; handle both ESM default and CommonJS
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import("sharp");
    _Sharp = mod && (mod.default || mod);
  } catch (err) {
    console.warn(
      "sharp not available, server-side image processing will be skipped",
    );
    _Sharp = null;
  }
  return _Sharp;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const type = (data.get("type") as string) || "general"; // Default to 'general' if no type specified

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Diagnostic: log basic upload info
    try {
      // Some runtime environments don't expose File.name or size the same way; guard access
      // Keep logs concise to avoid printing binary data.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fname = (file as any).name ?? "(unknown)";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fsize = (file as any).size ?? -1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ftype = (file as any).type ?? "(unknown)";
      console.log(`Upload received: ${fname} ${fsize} bytes type=${ftype}`);
    } catch (logErr) {
      console.warn("Failed to log upload info:", logErr);
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
        },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compress image aiming for ~100KB final size
    const compressToTarget = async (
      srcBuffer: Buffer,
      mime: string,
      targetBytes = 100 * 1024,
    ) => {
      let outBuffer = srcBuffer;
      let outMime = mime;
      let ext = (mime.split("/").pop() || "png").replace("jpeg", "jpg");

      try {
        const Sharp = await getSharp();
        if (!Sharp) {
          console.warn(
            "Skipping server-side compression because sharp is unavailable",
          );
          return { buffer: srcBuffer, mime, ext };
        }

        const image = Sharp(srcBuffer, { animated: mime === "image/gif" });
        const meta = await image.metadata();

        // Strategy: try quality-reduced encodings (webp/jpeg) first, then downscale if needed
        const tryFormats = async () => {
          // prefer to keep original format for jpg/webp; convert png/gif to webp for better compression
          if (mime.includes("jpeg") || mime.includes("jpg")) {
            let quality = 85;
            while (quality >= 30) {
              const buf = await image.jpeg({ quality }).toBuffer();
              if (buf.length <= targetBytes)
                return { buf, mime: "image/jpeg", ext: "jpg" };
              outBuffer = buf;
              outMime = "image/jpeg";
              ext = "jpg";
              quality -= 10;
            }
          }

          // Try webp for png/webp/gif
          let quality = 85;
          while (quality >= 30) {
            try {
              const buf = await image.webp({ quality, effort: 6 }).toBuffer();
              if (buf.length <= targetBytes)
                return { buf, mime: "image/webp", ext: "webp" };
              outBuffer = buf;
              outMime = "image/webp";
              ext = "webp";
            } catch (e) {
              // fallback if conversion fails
            }
            quality -= 10;
          }

          return { buf: outBuffer, mime: outMime, ext };
        };

        let result = await tryFormats();

        // If still too large, progressively downscale dimensions
        if (result.buf.length > targetBytes && meta.width && meta.height) {
          let width = meta.width;
          let height = meta.height;
          // reduce by 10% steps until under target or until one dimension < 200px
          while (
            result.buf.length > targetBytes &&
            width > 200 &&
            height > 200
          ) {
            width = Math.floor(width * 0.9);
            height = Math.floor(height * 0.9);
            const img = Sharp(srcBuffer).resize(width, height, {
              fit: "inside",
            });
            if (outMime === "image/jpeg")
              result.buf = await img.jpeg({ quality: 60 }).toBuffer();
            else
              result.buf = await img
                .webp({ quality: 70, effort: 6 })
                .toBuffer();
            if (result.buf.length <= targetBytes) break;
          }
        }

        return { buffer: result.buf, mime: result.mime, ext: result.ext };
      } catch (err) {
        console.error(
          "Compression error, falling back to original buffer",
          err,
        );
        return { buffer: srcBuffer, mime, ext };
      }
    };

    const compressed = await compressToTarget(buffer, file.type, 100 * 1024);

    // Generate unique filename based on type
    const timestamp = Date.now();
    const extension = compressed.ext || file.name.split(".").pop() || "png";
    const filename = `${type}-${timestamp}.${extension}`;

    // Store compressed image in database (if Prisma is available).
    let publicUrl: string;
    let imageId: string | undefined;
    try {
      if (
        prisma &&
        (prisma as any).image &&
        typeof (prisma as any).image.create === "function"
      ) {
        const image = await prisma.image.create({
          data: {
            filename: filename,
            originalName: file.name,
            mimeType: compressed.mime || file.type,
            size: compressed.buffer.length,
            data: Buffer.from(compressed.buffer) as any, // Type assertion for Prisma Bytes field
          },
        });
        publicUrl = `/api/images/${image.id}`;
        imageId = image.id;
      } else {
        // Fallback: write to public/uploads so dev can test without DB
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });
        const outPath = path.join(uploadsDir, filename);
        await writeFile(outPath, new Uint8Array(compressed.buffer));
        publicUrl = `/uploads/${filename}`;
        console.warn("Prisma not initialized; saved upload to:", outPath);
      }
    } catch (storeErr) {
      console.error("Error storing image:", storeErr);
      throw storeErr;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      id: imageId,
    });
  } catch (error) {
    // Provide more diagnostic info to the client during debugging.
    console.error(
      "Upload error:",
      error instanceof Error ? error.message : error,
    );
    const msg = error instanceof Error ? error.message : String(error);
    const body: any = { error: "Failed to upload file", detail: msg };
    // Include stack in non-production environments for easier debugging
    if (process.env.NODE_ENV !== "production" && error instanceof Error) {
      body.stack = error.stack;
    }
    return NextResponse.json(body, { status: 500 });
  }
}
