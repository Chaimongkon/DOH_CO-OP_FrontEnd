import HomeSlides from "@/components/HomeSlides";
import { Slide } from "@/types";
import { isValidBase64 } from "@/utils/isValidBase64";

async function fetchSlides(): Promise<Slide[]> {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const response = await fetch(`${API}/Slides`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    return data.map((slide: any) => ({
      id: slide.Id,
      no: slide.No,
      image: '', // Initially, do not load images
      url: slide.URLLink,
    }));
  } catch (error) {
    console.error("Failed to fetch slides:", error);
    return [];
  }
}

async function fetchSlideImage(slideId: number): Promise<string> {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const response = await fetch(`${API}/Slides?slideId=${slideId}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    const base64Image = data.Image.replace(/(?:\r\n|\r|\n)/g, '');
    return isValidBase64(base64Image) ? base64Image : '';
  } catch (error) {
    console.error(`Failed to fetch image for slide ${slideId}:`, error);
    return '';
  }
}

export default async function SlidesPage() {
  const slides = await fetchSlides();

  // Fetch images concurrently
  const fetchImagesPromises = slides.map(async (slide) => {
    slide.image = await fetchSlideImage(slide.id);
    return slide;
  });

  const slidesWithImages = await Promise.all(fetchImagesPromises);

  return <HomeSlides slides={slidesWithImages} />;
}
