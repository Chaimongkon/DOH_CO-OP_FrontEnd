"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";

const NewQuestionPage = () => {
  const [name, setName] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null); // To store error messages
  const [showError, setShowError] = useState(false); // To track if fields have been left empty
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    const submittedName = name.trim() ? name : "ผู้ไม่ประสงค์ออกนาม";
    const submittedMemberNumber = memberNumber.trim() ? memberNumber : "000000";

    // Show error if fields are empty
    if (!title || !body) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      setShowError(true); // Show error in TextField
      return;
    }

    // Hide error after validation passes
    setError(null);
    setShowError(false);

    try {
      const res = await fetch(`${API}/Questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: submittedName,
          memberNumber: submittedMemberNumber,
          title,
          body,
        }),
      });

      if (res.ok) {
        router.push("/Questions");
      } else {
        const data = await res.json();
        setError(data.message || "ไม่สามารถส่งคำถามได้");
      }
    } catch (error: any) {
      setError("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  return (
    <>
      <section className="py-5">
        <div className="container py-4">
          <Box
            component="form"
            onSubmit={submitQuestion}
            sx={{ maxWidth: 600, margin: "0 auto" }}
          >
            <Typography variant="h4" gutterBottom>
              ตั้งกระทู้คำถาม
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="ชื่อ - สกุล"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ - สกุล"
              helperText={
                !name.trim() ? "ถ้าไม่กรอกจะใช้เป็น ผู้ไม่ประสงค์ออกนาม" : ""
              }
            />

            <TextField
              label="เลขสมาชิก"
              fullWidth
              margin="normal"
              value={memberNumber}
              onChange={(e) => setMemberNumber(e.target.value)}
              placeholder="เลขสมาชิก"
              helperText={
                !memberNumber.trim() ? "ถ้าไม่กรอกจะใช้เป็น 000000" : ""
              }
            />

            <TextField
              label="หัวข้อ *"
              fullWidth
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="หัวข้อ"
              error={showError && !title.trim()} // Display error if title is empty
              helperText={showError && !title.trim() ? "กรุณากรอกหัวข้อ" : ""}
            />

            <TextField
              label="เรื่องที่ต้องการสอบถาม *"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="เรื่องที่ต้องการสอบถาม"
              error={showError && !body.trim()} // Display error if body is empty
              helperText={
                showError && !body.trim()
                  ? "กรุณากรอกเรื่องที่ต้องการสอบถาม"
                  : ""
              }
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2, mt: 2 }}
            >
              ตั้งกระทู้คำถาม
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              sx={{ mt: 2 }}
              onClick={() => router.back()}
            >
              กลับหน้าหลัก Q&A
            </Button>
          </Box>
        </div>
      </section>
    </>
  );
};

export default NewQuestionPage;
