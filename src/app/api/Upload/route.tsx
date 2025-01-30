import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { fileName, fileData } = await req.json();
    const buffer = Buffer.from(fileData, "base64");

    const filePath = path.join(process.cwd(), "Uploads", fileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    await fs.writeFile(filePath, buffer);
    const fileUrl = `${req.headers.get("origin")}/Uploads/${fileName}`;

    return NextResponse.json({ fileUrl }, { status: 200 });
  } catch (err) {
    console.error("Error details:", err);
    return NextResponse.json(
      { message: "Failed to save file" },
      { status: 500 }
    );
  }
}
