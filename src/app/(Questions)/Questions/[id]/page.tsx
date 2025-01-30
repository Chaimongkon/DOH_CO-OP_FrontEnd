"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
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
  Name: string; // Add name of the answerer
  CreatedAt: string; // Add the time the answer was submitted
}

const QuestionDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerBody, setAnswerBody] = useState("");
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ฟังก์ชันสำหรับแปลงวันที่
  const formatThaiDateTime = (dateString: string) => {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    // ใช้ 'th-TH' เพื่อแสดงวันที่แบบไทย
    return date.toLocaleDateString("th-TH", options).replace(",", "") + " น.";
  };

  // Fetch question data and answers
  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      if (!API) {
        console.error("API base URL is not defined");
        return;
      }

      try {
        // Fetch question data
        const questionRes = await fetch(`${API}/Questions/${id}`);
        if (!questionRes.ok) {
          throw new Error("Failed to fetch question");
        }
        const data = await questionRes.json();
        setQuestion(data.question);
        setAnswers(data.answers);
      } catch (error) {
        console.error("Error fetching question or answers:", error);
      }
    };

    fetchQuestionAndAnswers();
  }, [id, API]);

  // Submit new answer
  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const submittedName = name.trim() ? name : "ผู้ไม่ประสงค์ออกนาม";
    // ตรวจสอบว่าทั้งชื่อและข้อความถูกกรอกหรือไม่
    if (!answerBody.trim()) {
      setShowError(true); // แสดงการแจ้งเตือนเมื่อฟิลด์ถูกปล่อยว่าง
      return;
    }

    setShowError(false); // ซ่อนการแจ้งเตือนถ้าข้อมูลถูกกรอกครบ
    try {
      const res = await fetch(`${API}/Questions/${id}/Answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: answerBody, name: submittedName }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit answer");
      }

      setAnswerBody("");
      setName(""); // Clear name input after submission
      // Fetch the updated answers after submitting
      const updatedAnswersRes = await fetch(`${API}/Questions/${id}/Answers`);
      const updatedAnswers: Answer[] = await updatedAnswersRes.json();
      setAnswers(updatedAnswers);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  if (!question) return <p>Loading...</p>;

  return (
    <>
      <section className="py-5">
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: "DOHCOOP",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          กระดานถาม-ตอบ (Q&A)
        </Typography>
        <div className="container py-4">
          <Box sx={{ padding: 3 }}>
            {/* คำถาม */}
            <Box
              sx={{
                backgroundColor: "#FFF7D1",
                padding: 2,
                borderRadius: 2,
                marginBottom: 3,
              }}
            >
              <Typography variant="h5" gutterBottom>
                {question.Title}
              </Typography>
              <Box sx={{ borderBottom: "1px solid #FFD09B", marginY: 2 }} />
              <Typography variant="body1" paragraph>
                {question.Body}
              </Typography>
              <Box sx={{ borderBottom: "1px solid #FFD09B", marginY: 2 }} />
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>โดย {question.Name}</span>
                <span>โพสเมื่อ {formatThaiDateTime(question.CreatedAt)}</span>
              </Typography>
            </Box>

            {/* คำตอบ */}
            <Box>
              <Typography variant="h6" gutterBottom>
                ความคิดเห็น
              </Typography>
              <Box
                sx={{
                  backgroundColor: "#D8EFD3",
                  padding: 2,
                  borderRadius: 2,
                }}
              >
                {answers.length > 0 ? (
                  answers.map((answer, index) => (
                    <Box
                      key={answer.Id}
                      sx={{
                        backgroundColor:
                          index % 2 === 0 ? "#95D2B3" : "#F1F8E8", // Alternate background colors
                        padding: 2,
                        marginBottom: 2,
                        borderRadius: 1,
                        boxShadow: 1,
                      }}
                    >
                      <Typography variant="body1" gutterBottom>
                        {answer.Body}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>โดย คุณ {answer.Name}</span>
                        <span>
                          ตอบเมื่อ {formatThaiDateTime(answer.CreatedAt)}
                        </span>
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography>
                    ยังไม่มีความคิดเห็น คุณเป็นคนแรกที่จะแสดงความคิดเห็น!
                  </Typography>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                backgroundColor: "#FEFAF6",
                padding: 2,
                borderRadius: 2,
                marginTop: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                แสดงความคิดเห็น
              </Typography>
              {/* ฟอร์มสำหรับตอบคำถาม */}
              <Box
                component="form"
                onSubmit={submitAnswer}
                sx={{ marginTop: 3 }}
              >
                {showError && (
                  <Alert severity="error">กรุณากรอกความคิดเห็นก่อนส่ง</Alert>
                )}
                <TextField
                  fullWidth
                  label="แสดงความคิดเห็น"
                  multiline
                  rows={4}
                  value={answerBody}
                  onChange={(e) => setAnswerBody(e.target.value)}
                  variant="outlined"
                  error={showError && !answerBody.trim()} // แสดงกรอบสีแดงถ้าไม่มีการกรอกข้อความ
                />
                <TextField
                  label="โดย"
                  fullWidth
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="โดย"
                  sx={{ marginBottom: 2 }}
                  helperText={
                    !name.trim()
                      ? "ถ้าไม่กรอกจะใช้เป็น ผู้ไม่ประสงค์ออกนาม"
                      : ""
                  }
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }} // Adds right margin to create space between the buttons
                >
                  แสดงความคิดเห็น
                </Button>

                <Button type="submit" variant="contained" color="error" onClick={() => router.back()}>
                  กลับหน้าหลัก Q&A
                </Button>
              </Box>
            </Box>
          </Box>
        </div>
      </section>
    </>
  );
};

export default QuestionDetailPage;
