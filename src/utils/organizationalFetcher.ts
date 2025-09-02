import { getApiConfig } from "@/lib/config";
import { ApiOrganizational, BoardMember } from "@/types/organizational";
import logger from "@/lib/logger";

export async function fetchOrganizationalData(filterType: string): Promise<BoardMember[]> {
  try {
    const { apiUrl, fileUrl } = getApiConfig();
    const response = await fetch(`${apiUrl}/Organizational`, {
      next: { revalidate: 3600 }, // Cache for 1 hour, revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Handle both success response format and direct array format
    let data: ApiOrganizational[] = [];
    if (responseData.success && responseData.data) {
      // New API format: { success: true, data: [...] }
      data = responseData.data;
    } else if (Array.isArray(responseData)) {
      // Legacy format: direct array
      data = responseData;
    } else {
      logger.warn('Unexpected API response format', { responseData });
      return [];
    }
    
    const filteredData = data.filter(
      (item: ApiOrganizational) => item.Type === filterType
    );

    return filteredData.map((item: ApiOrganizational) => ({
      id: item.Id,
      name: item.Name,
      position: item.Position,
      priority: String(item.Priority),
      type: item.Type,
      imagePath: item.ImagePath ? `${fileUrl}${item.ImagePath}` : "",
    }));
  } catch (error) {
    logger.error(`Failed to fetch organizational data for ${filterType}:`, error);
    return [];
  }
}