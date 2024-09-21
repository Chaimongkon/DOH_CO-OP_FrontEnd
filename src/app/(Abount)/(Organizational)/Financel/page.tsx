"use client";
import * as React from "react";
import AspectRatio from "@mui/joy/AspectRatio";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";

import Box from "@mui/material/Box";
import { useEffect, useState, useCallback } from "react";
import Typography from "@mui/joy/Typography"; // Ensure you're importing Typography correctly

interface Board {
  id: number;
  name: string;
  position: string;
  priority: string;
  type: string;
  image: string;
}

const base64ToBlobUrl = (base64: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/webp" }); // adjust the type if necessary
  return URL.createObjectURL(blob);
};

function Credit() {
  const [organizationals, setOrganizationals] = useState<Board[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchOrganizational = useCallback(async () => {
    try {
      const response = await fetch(`${API}/Organizational`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const filteredData = data.filter(
        (board: any) => board.Type === "ฝ่ายการเงิน"
      );

      const processedData = filteredData.map((boards: any) => ({
        id: boards.Id,
        name: boards.Name,
        position: boards.Position,
        priority: boards.Priority,
        type: boards.Type,
        image: base64ToBlobUrl(boards.Image),
      }));

      setOrganizationals(processedData);
    } catch (error) {
      console.error("Failed to fetch Board:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchOrganizational();
  }, [fetchOrganizational]);

  const renderByPriority = (priorityLevel: string) => {
    return (
      <div className="rows gy-5">
        {organizationals
          .filter((p) => p.priority === priorityLevel)
          .map((p, index) => (
            <div className="col-lg-33 col-md-6" key={index}>
              <div className="product h-100">
                <div className="box-image">
                  <Box
                    sx={{
                      justifyContent: "center",
                      display: "flex",
                      p: 2,
                      m: 0,
                      gap: 3,
                    }}
                  >
                    <Card variant="outlined" sx={{ width: 220, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)' }} key={index}>
                      <CardOverflow>
                        <AspectRatio ratio="0.9">
                          <img src={p.image} loading="lazy" alt={p.name} />
                        </AspectRatio>
                      </CardOverflow>
                      <CardContent>
                        <Typography
                          sx={{
                            fontFamily: "DOHCOOP",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            textAlign: "center", // Corrected alignment
                          }}
                        >
                          {p.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "DOHCOOP",
                            fontSize: "1rem",
                            textAlign: "center", // Corrected alignment
                          }}
                        >
                          {p.position}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <>
      {organizationals.length > 0 && (
        <section className="py-5">
          <div className="container py-4">
            <header className="mb-5">
              <h1 className="lined lined-center text-uppercase mb-4">
                {organizationals[0].type}
              </h1>
            </header>
            {renderByPriority("1")}
            {renderByPriority("2")}
            {renderByPriority("3")}
            {renderByPriority("4")}
            {renderByPriority("5")}
          </div>
        </section>
      )}
    </>
  );
}

export default Credit;
