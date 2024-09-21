"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Define the types for the props
interface FormDialogProps {
  open: boolean;
  handleClose: () => void;
}

export default function FormDialog({ open, handleClose }: FormDialogProps) {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API}/Complaint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formJson),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Complaint submitted successfully:", result);
        handleClose();
      } else {
        const errorData = await response.json();
        console.error("Failed to submit complaint:", errorData);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
    }
  };
  return (
    <Dialog
      maxWidth={"md"}
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle
        style={{
          fontFamily: "DOHCOOP",
          fontSize: "24px",
          textAlign: "center",
        }}
      >
        แจ้งข้อเสนอแนะ ร้องเรียน
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          style={{ fontFamily: "DOHCOOP", textIndent: "25px" }}
        >
          สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
          ได้จัดทำช่องทางการแจ้งข้อเสนอแนะหรือร้องเรียนต่างๆ
          เพื่ออำนวยความสะดวกให้กับสมาชิกในการแจ้งข้อเสนอแนะหรือร้องเรียน
        </DialogContentText>
        <DialogContentText
          style={{ fontFamily: "DOHCOOP", textIndent: "25px" }}
        >
          หากท่านได้รับความเดือดร้อนหรือความไม่เป็นธรรมจากการไม่ปฏิบัติตามระเบียบสหกรณ์
          หรือนอกเหนืออำนาจหน้าที่ตามกฎหมายของสหกรณ์ฯ หรือเจ้าหน้าที่สหกรณ์
          ยังมิได้ปฏิบัติหน้าที่ให้ครบถ้วนตาม ข้อบังคับ ระเบียบ คำสั่ง
          หรือขั้นตอนปฏิบัติงานใดๆ ที่ก่อให้เกิดความเดือดร้อน
          หรือไม่เป็นธรรมแก่สมาชิก หรือเป็นภาระแก่สมาชิกโดยไม่จำเป็น
          หรือเกินสมควรแก่เหตุ สามารถแจ้งข้อเสนอแนะหรือร้องเรียนได้ที่
          สหกรณ์ออมทรัพย์กรมทางหลวง ตามด้านล่างนี้
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          name="memberid"
          label="เลขสมาชิก"
          type="text"
          fullWidth
          variant="outlined"
          InputProps={{
            style: { fontFamily: "THSarabun",fontSize:"20px" },
          }}
          InputLabelProps={{
            style: { fontFamily: "THSarabun" },
          }}
        />
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="ชื่อ - นามสกุล"
          type="text"
          fullWidth
          variant="outlined"
          InputProps={{
            style: { fontFamily: "THSarabun",fontSize:"20px" },
          }}
          InputLabelProps={{
            style: { fontFamily: "DOHCOOP" },
          }}
        />
        <TextField
          margin="dense"
          name="tel"
          label="เบอร์โทร"
          type="text"
          fullWidth
          variant="outlined"
          InputProps={{
            style: { fontFamily: "THSarabun",fontSize:"20px" },
          }}
          InputLabelProps={{
            style: { fontFamily: "DOHCOOP" },
          }}
        />
        <TextField
          margin="dense"
          name="email"
          label="อีเมล์"
          type="email"
          fullWidth
          variant="outlined"
          InputProps={{
            style: { fontFamily: "THSarabun",fontSize:"20px" },
          }}
          InputLabelProps={{
            style: { fontFamily: "DOHCOOP" },
          }}
        />
        <TextField
          required
          margin="dense"
          name="complaint"
          label="เรื่องข้อเสนอแนะ ร้องเรียน"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          InputProps={{
            style: { fontFamily: "THSarabun",fontSize:"20px" },
          }}
          InputLabelProps={{
            style: { fontFamily: "DOHCOOP" },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          style={{ fontFamily: "DOHCOOP", fontSize: "16px" }}
        >
          ส่งข้อมูล
        </Button>
        <Button
          onClick={handleClose}
          style={{ fontFamily: "DOHCOOP", fontSize: "16px" }}
        >
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  );
}
