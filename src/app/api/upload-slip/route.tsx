import { NextResponse } from "next/server";
import multer from "multer";
import { writeFile } from "fs/promises";
import { createWorker, Worker } from "tesseract.js";

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Save the file to the server
  const filePath = `./public/uploads/${file.name}`;
  await writeFile(filePath, buffer);

  // Create and use Tesseract.js worker


};

