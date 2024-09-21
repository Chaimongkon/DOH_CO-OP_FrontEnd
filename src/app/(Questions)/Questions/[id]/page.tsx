'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, TextField, Button } from '@mui/material';

// Define the type for a question
interface Question {
  Id: number;
  Title: string;
  Body: string;
  CreatedAt: string;
  Name: string;
  MemberNumber: string;
  ViewCount: number;
  AnswerCount: number;
}

// Define the type for an answer
interface Answer {
  Id: number;
  Body: string;
  Name: string;      // Add name of the answerer
  CreatedAt: string; // Add the time the answer was submitted
}

const QuestionDetailPage = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerBody, setAnswerBody] = useState('');
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch question data and answers
  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      if (!API) {
        console.error('API base URL is not defined');
        return;
      }

      try {
        // Fetch question data
        const questionRes = await fetch(`${API}/Questions/${id}`);
        if (!questionRes.ok) {
          throw new Error('Failed to fetch question');
        }
        const data = await questionRes.json();
        setQuestion(data.question);
        setAnswers(data.answers);
      } catch (error) {
        console.error('Error fetching question or answers:', error);
      }
    };

    fetchQuestionAndAnswers();
  }, [id, API]);

  // Submit new answer
  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answerBody.trim()) {
      alert('Answer cannot be empty');
      return;
    }

    try {
      const res = await fetch(`${API}/Questions/${id}/Answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: answerBody }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit answer');
      }

      setAnswerBody('');
      // Fetch the updated answers after submitting
      const updatedAnswersRes = await fetch(`${API}/Questions/${id}/Answers`);
      const updatedAnswers: Answer[] = await updatedAnswersRes.json();
      setAnswers(updatedAnswers);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (!question) return <p>Loading...</p>;

  return (
    <Box sx={{ padding: 3 }}>
      {/* คำถาม */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          padding: 2,
          borderRadius: 2,
          marginBottom: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          {question.Title}
        </Typography>
        <Typography variant="body1" paragraph>
          {question.Body}
        </Typography>
      </Box>

      {/* คำตอบ */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Answers
        </Typography>
        <Box
          sx={{
            backgroundColor: '#e0f7fa',
            padding: 2,
            borderRadius: 2,
          }}
        >
          {answers.length > 0 ? (
            answers.map((answer, index) => (
              <Box
                key={answer.Id}
                sx={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f0f0f0',  // Alternate background colors
                  padding: 2,
                  marginBottom: 2,
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Typography variant="body1" gutterBottom>
                  {answer.Body}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  By {answer.Name} on {new Date(answer.CreatedAt).toLocaleString()} {/* Show name and time */}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No answers yet. Be the first to answer!</Typography>
          )}
        </Box>
      </Box>

      {/* ฟอร์มสำหรับตอบคำถาม */}
      <Box
        component="form"
        onSubmit={submitAnswer}
        sx={{ marginTop: 3 }}
      >
        <TextField
          fullWidth
          label="Your answer"
          multiline
          rows={4}
          value={answerBody}
          onChange={(e) => setAnswerBody(e.target.value)}
          variant="outlined"
          sx={{ marginBottom: 2 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit Answer
        </Button>
      </Box>
    </Box>
  );
};

export default QuestionDetailPage;
