"use client";

import React, { useState } from "react";
import Tesseract from "tesseract.js";

const ExtractDateTime: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [dateTime, setDateTime] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
      setText("");
      setDateTime(null);
      setReferenceCode(null);
    }
  };

  const preprocessText = (text: string): string => {
    return text
      .replace(/[^ก-ฮa-zA-Z0-9:\.\-\s]/g, "") // ลบอักขระพิเศษที่ไม่จำเป็น ยกเว้นช่องว่าง
      .replace(/\s{2,}/g, " ") // ลดช่องว่างหลายช่องให้เหลือช่องว่างเดียว
      .trim(); // ลบช่องว่างหน้าและหลังข้อความ
  };

  const handleOCR = async () => {
    if (!image) {
      alert('กรุณาอัปโหลดรูปภาพก่อน!');
      return;
    }
  
    setIsLoading(true);
    try {
      const result = await Tesseract.recognize(image, 'tha+eng', {
        langPath: '/tessdata',
        logger: (info) => console.log(info),
      });
  
      const ocrText = result.data.text;
      setText(ocrText)
      console.log('Original OCR Text:', ocrText);

      // ดึงข้อความหลัง "@ โอนเงินสําเร็จ"
      const successMatch = ocrText.match(/เร็จ\s*(.+)/);
      if (successMatch) {
        let dateTime = successMatch[1].trim();

        // ตรวจสอบว่าข้อความเริ่มต้นด้วยอักขระที่ไม่ใช่ตัวเลข และตัดออก
        dateTime = dateTime.replace(/^[^\d]+/, '');
        console.log('DateTime:', dateTime);
        // ใช้ Regex เพื่อแยกวันที่ เวลา และเดือน
        const match = dateTime.match(/(\d{1,2})([ก-ฮ]{1,3})/);
        //const match = dateTime.match(/(\d{1,2})([ก-ฮ]{1,3})\.?(\d{4})\s?[-:]\s?(\d{2,3})(\d{2})/);
        console.log(match)
        if (match) {
          const day = match[1]; // วันที่
          const month = match[2]; // เดือน
          const year = match[3]; // ปี
          const hour = match[4]; // ชั่วโมง
          const minute = match[5]; // นาที
      
          // จัดรูปแบบวันที่และเวลา
          const formattedDateTime = `${day} ${month}. ${year} - ${hour}:${minute}`;
          setDateTime(formattedDateTime);
        } else {
          setDateTime('ไม่พบวันที่และเวลาในรูปแบบที่ถูกต้อง');
        }
      } else {
        setDateTime('ไม่พบวันที่และเวลา');
      }
      
    } catch (error) {
      console.error('OCR Error:', error);
      setText('ไม่สามารถอ่านข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div>
      <h1>OCR ดึงข้อความวันที่และเวลา</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button onClick={handleOCR} disabled={isLoading}>
        {isLoading ? "กำลังประมวลผล..." : "อ่านข้อมูลจากภาพ"}
      </button>
      {text && (
        <div>
          <h2>ผลลัพธ์จาก OCR:</h2>
          <pre>{text}</pre>
        </div>
      )}
      {dateTime && (
        <div>
          <h2>ข้อความที่ดึงได้:</h2>
          <p>{dateTime}</p>
          <p>{referenceCode}</p>
        </div>
      )}
    </div>
  );
};

export default ExtractDateTime;
