import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types"; // Import a library for handling MIME types

export async function GET(
  req: NextRequest,
  { params }: { params: { filePath: string[] } }
) {
  try {
    // Construct the full file path
    //const baseDir = 'C:/BackEndWeb/public/Uploads/News';

    const baseDir = process.env.NEXT_PUBLIC_URL_BASE_DIR + "/Slides/";
    const filePath = path.join(baseDir, ...params.filePath);

    // Use path.resolve to ensure the resolved path is within the baseDir
    const resolvedFilePath = path.resolve(filePath);
    if (!resolvedFilePath.startsWith(path.resolve(baseDir))) {
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
    const contentType =
      mime.lookup(fileExtension) || "application/octet-stream";

    // Return the file as a response with the appropriate content type
    return new NextResponse(file, { headers: { "Content-Type": contentType } });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
