import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types"; // Import a library for handling MIME types
import logger from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { filePath: string[] } }
) {
  try {
    // Construct the full file path
    const baseDir = process.env.NEXT_PUBLIC_URL_BASE_DIR + "/PhotoAlbum/";
    const filePath = path.join(baseDir, ...params.filePath);


    // Use path.resolve to ensure the resolved path is within the baseDir
    const resolvedFilePath = path.resolve(filePath);
    if (!resolvedFilePath.startsWith(path.resolve(baseDir))) {
      logger.warn("Security check failed in PhotosCover file route", { resolvedFilePath, basePath: path.resolve(baseDir) });
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Check if the file exists
    const fileExists = await fs
      .access(resolvedFilePath)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const file = await fs.readFile(resolvedFilePath);
    const fileExtension = path.extname(resolvedFilePath).toLowerCase();

    // Determine the content type using mime-types library
    let contentType = mime.lookup(fileExtension) || "application/octet-stream";
    
    // If no extension, try to determine from file content or assume image
    if (!fileExtension) {
      // Read first few bytes to detect file type
      const buffer = file.slice(0, 12);
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        contentType = "image/jpeg";
      } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        contentType = "image/png";
      } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        contentType = "image/gif";
      } else if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        contentType = "image/webp";
      } else {
        contentType = "image/jpeg"; // Default to JPEG for images without extension
      }
    }

    // Return the file as a response with the appropriate content type
    return new NextResponse(file, { headers: { "Content-Type": contentType } });
  } catch (error) {
    logger.error("Error serving PhotosCover file", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
