import HomeNews from "@/components/HomeNews";
import { News } from "@/types";
import { isValidBase64 } from "@/utils/isValidBase64";

async function fetchNews(): Promise<News[]> {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const response = await fetch(`${API}/News`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.map((news: any) => {
      // Log each news item to check its structure    
      return {
        id: news.Id,
        title: news.Title,
        details: news.Details,
        image: '', // Initially, do not load images
        pdffile: '', // Initially, do not load files
        createDate: news.CreateDate, // Check this field
      };
    });
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

async function fetchNewsImagePdf(newId: number): Promise<{ image: string, file: string }> {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const response = await fetch(`${API}/News?newId=${newId}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();

    const base64Image = data.Image ? data.Image.replace(/(?:\r\n|\r|\n)/g, '') : '';
    const base64Pdf = data.File ? data.File.replace(/(?:\r\n|\r|\n)/g, '') : '';
    
    if (isValidBase64(base64Image) && isValidBase64(base64Pdf)) {
      return { image: base64Image, file: base64Pdf };
    } else {
      return { image: '', file: '' };
    }
  } catch (error) {
    console.error(`Failed to fetch image and file for news ${newId}:`, error);
    return { image: '', file: '' };
  }
}

export default async function NewsPage() {
  const news = await fetchNews();

  // Fetch images and files concurrently
  const fetchImagesPromises = news.map(async (newsItem) => {
    const { image, file } = await fetchNewsImagePdf(newsItem.id);
    newsItem.image = image;
    newsItem.pdffile = file;
    return newsItem;
  });

  const newsWithImages = await Promise.all(fetchImagesPromises);

  return <HomeNews news={newsWithImages} />;
}
