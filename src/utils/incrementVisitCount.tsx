// utils/incrementVisitCount.js
import logger from '@/lib/logger';

export const incrementVisitCount = async (API: string | undefined) => {
    try {
      const visitCountSent = localStorage.getItem("visitCountSent");
      logger.info('Visit count status', { visitCountSent });
      if (!visitCountSent) {
        const response = await fetch(`${API}Visits/Create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
  
        if (response.ok) {
          localStorage.setItem("visitCountSent", "true");
        }
      }
    } catch (error) {
      logger.error('Error incrementing visit count', error);
    }
  };
  