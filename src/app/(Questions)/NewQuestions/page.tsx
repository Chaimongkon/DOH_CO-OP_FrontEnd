'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Typography, Box } from '@mui/material';

const NewQuestionPage = () => {
  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !body || !name || !memberNumber) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const res = await fetch(`${API}/Questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, memberNumber, title, body }),
    });

    if (res.ok) {
      router.push('/Questions');
    }
  };

  return (
    <>
      {/* PORTFOLIO SLIDER SECTION*/}
      <section className="py-5">
        <div className="container py-4">
        <Box component="form" onSubmit={submitQuestion} sx={{ maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        ตั้งคำถามใหม่
      </Typography>

      <TextField
        label="ชื่อ - สกุล"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ชื่อ - สกุล"
      />

      <TextField
        label="เลขสมาชิก"
        fullWidth
        margin="normal"
        value={memberNumber}
        onChange={(e) => setMemberNumber(e.target.value)}
        placeholder="เลขสมาชิก"
      />

      <TextField
        label="หัวข้อ *"
        fullWidth
        margin="normal"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="หัวข้อ"
      />

      <TextField
        label="เรื่องที่ต้องการสอบถาม *"
        fullWidth
        margin="normal"
        required
        multiline
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="เรื่องที่ต้องการสอบถาม"
      />

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        ส่งคำถาม
      </Button>
    </Box>
    </div>
      </section>
    </>
  );
};

export default NewQuestionPage;
