"use client";
import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, Grid, Alert } from "@mui/material";
import Link from "next/link";

// กำหนดประเภทของ question
interface Question {
  Id: number;
  Title: string;
  Name: string;
  AnswerCount: number;
  ViewCount: number;
}

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!API) {
        console.error("API base URL is not defined");
        return;
      }

      try {
        const res = await fetch(`${API}/Questions`);
        if (!res.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await res.json();
        console.log(data);
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [API]);

  return (
    <>
      {/* PORTFOLIO SLIDER SECTION*/}
      <Box sx={{ fontFamily: "DOHCOOP", padding: 3 }}>
        <section className="py-5">
          <div className="container py-4">
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontFamily: "DOHCOOP" }}
            >
              กระดานถาม-ตอบ (Q&A)
            </Typography>
            <List>
              {questions.map((question) => (
                <ListItem
                  key={question.Id}
                  sx={{ borderBottom: "1px solid #ddd", paddingY: 2 }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Link href={`/Questions/${question.Id}`} passHref>
                        <Typography
                          variant="h6"
                          component="a"
                          sx={{ textDecoration: "none", color: "blue" }}
                        >
                          {question.Title}
                        </Typography>
                      </Link>
                      <Typography variant="body2" color="textSecondary">
                        โดย {question.Name}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2" color="textSecondary">
                        การตอบ: {question.AnswerCount}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2" color="textSecondary">
                        เข้าชม: {question.ViewCount}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </div>
        </section>
      </Box>
    </>
  );
};

export default QuestionsPage;
