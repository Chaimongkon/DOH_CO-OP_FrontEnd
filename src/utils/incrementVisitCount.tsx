// utils/incrementVisitCount.js

export const incrementVisitCount = async (API: string | undefined) => {
    try {
      const visitCountSent = localStorage.getItem("visitCountSent");
      console.log(visitCountSent);
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
      console.error("Error:", error);
    }
  };
  