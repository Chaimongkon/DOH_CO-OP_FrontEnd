import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  const uploadsDir = path.join(process.cwd(), "public/uploads");

  try {
    // Read the contents of the uploads directory
    const files = await fs.readdir(uploadsDir);

    // Delete each file in the directory
    await Promise.all(files.map(file => fs.unlink(path.join(uploadsDir, file))));

    return new Response("All files deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting files:", error);
    return new Response("Error deleting files", { status: 500 });
  }
}
