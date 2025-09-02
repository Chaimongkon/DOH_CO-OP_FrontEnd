import { getApiConfig } from "@/lib/config";
import { ApiSociety } from "@/types";
import { Society } from "@/types/about";
import logger from "@/lib/logger";

export async function fetchSocietyData(filterType: string): Promise<Society[]> {
  try {
    const { apiUrl, fileUrl } = getApiConfig();
    const response = await fetch(`${apiUrl}/SocietyCoop`, {
      next: { revalidate: 3600 }, // Cache for 1 hour, revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const data: ApiSociety[] = await response.json();
    
    return data
      .map((society: ApiSociety) => ({
        id: society.Id,
        imagePath: society.ImagePath ? `${fileUrl}${society.ImagePath}` : "",
        societyType: society.SocietyType,
        status: society.IsActive,
      }))
      .filter(
        (society: Society) =>
          society.societyType === filterType && 
          society.status && 
          society.imagePath
      );
  } catch (error) {
    logger.error(`Failed to fetch society data for ${filterType}:`, error);
    return [];
  }
}