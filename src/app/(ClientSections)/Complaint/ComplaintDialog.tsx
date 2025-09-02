"use client";

import React from "react";
import { Button, Input, Modal, Alert, Form, message } from "antd";
import { SendOutlined as SendIcon } from "@ant-design/icons";
const { TextArea } = Input;
import { getApiConfig } from "@/lib/config";
import logger from "@/lib/logger";
import {
  ComplaintFormData,
  ComplaintApiResponse,
  ComplaintDialogProps,
  COMPLAINT_VALIDATION,
  COMPLAINT_ERROR_MESSAGES,
  COMPLAINT_ENDPOINTS,
  COMPLAINT_FORM_FIELDS,
} from "@/types/complaint";
import styles from "./ComplaintDialog.module.css";

export default function ComplaintDialog({
  open,
  handleClose,
}: ComplaintDialogProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  
  const { apiUrl } = getApiConfig();

  const handleSubmit = async (values: ComplaintFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch(`${apiUrl}${COMPLAINT_ENDPOINTS.SUBMIT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const result: ComplaintApiResponse = await response.json();
        logger.info("Complaint submitted successfully:", { data: result });
        message.success(COMPLAINT_ERROR_MESSAGES.SUCCESS_MESSAGE);
        form.resetFields();
        handleClose();
      } else {
        const errorData: ComplaintApiResponse = await response.json();
        const errorMessage = errorData.message || COMPLAINT_ERROR_MESSAGES.submitError || 'เกิดข้อผิดพลาดในการส่งข้อมูล';
        logger.error("Failed to submit complaint:", errorData);
        setApiError(errorMessage);
        message.error(errorMessage);
      }
    } catch (error) {
      logger.error("Error submitting complaint:", error);
      const errorMessage = COMPLAINT_ERROR_MESSAGES.networkError;
      setApiError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      form.resetFields();
      setApiError(null);
      handleClose();
    }
  };

  return (
    <Modal
      title={
        <div className={styles.dialogTitle}>
          ✨ แจ้งข้อเสนอแนะ ร้องเรียน ✨
        </div>
      }
      open={open}
      onCancel={handleModalClose}
      footer={null}
      width="90%"
      style={{ maxWidth: '650px', maxHeight: '90vh' }}
      maskClosable={!isSubmitting}
      centered
      styles={{
        header: {
          textAlign: 'center',
          borderBottom: 'none',
          paddingBottom: '12px',
          padding: '16px 20px 12px 20px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px 20px 0 0'
        },
        body: {
          maxHeight: '75vh',
          overflowY: 'auto',
          paddingTop: '0px',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '20px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(20px)'
        },
        mask: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)'
        }
      }}
    >
      <div className={styles.dialogContentText}>
        <p>
          🏢 <strong>สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด</strong>
          ได้จัดทำช่องทางการแจ้งข้อเสนอแนะหรือร้องเรียนต่างๆ
          เพื่ออำนวยความสะดวกให้กับสมาชิกในการแจ้งข้อเสนอแนะหรือร้องเรียน
        </p>
        <p>
          📢 หากท่านได้รับความเดือดร้อนหรือความไม่เป็นธรรมจากการไม่ปฏิบัติตามระเบียบสหกรณ์
          หรือนอกเหนืออำนาจหน้าที่ตามกฎหมายของสหกรณ์ฯ หรือเจ้าหน้าที่สหกรณ์
          ยังมิได้ปฏิบัติหน้าที่ให้ครบถ้วนตาม ข้อบังคับ ระเบียบ คำสั่ง
          หรือขั้นตอนปฏิบัติงานใดๆ ที่ก่อให้เกิดความเดือดร้อน
          หรือไม่เป็นธรรมแก่สมาชิก หรือเป็นภาระแก่สมาชิกโดยไม่จำเป็น
          หรือเกินสมควรแก่เหตุ สามารถแจ้งข้อเสนอแนะหรือร้องเรียนได้ที่
          <strong>สหกรณ์ออมทรัพย์กรมทางหลวง</strong> ตามด้านล่างนี้ 👇
        </p>
      </div>
      
      <div className={styles.compactInfoBox}>
        <span className={styles.infoIcon}>💡</span>
        <strong>คำแนะนำ:</strong> กรอกเฉพาะข้อร้องเรียนได้เลย ข้อมูลส่วนตัวเป็นทางเลือก
      </div>
      
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {apiError && (
          <Alert 
            type="error" 
            message={apiError} 
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}
        
        <Form.Item 
          name={COMPLAINT_FORM_FIELDS.MEMBER_ID}
          label="เลขสมาชิก"
          className={`${styles.textField} ${styles.optionalField}`}
        >
          <Input 
            placeholder="💳 ใส่เลขสมาชิก (หากมี) เช่น 12345"
            disabled={isSubmitting}
            style={{ 
              fontFamily: "THSarabun, sans-serif", 
              fontSize: "14px",
              padding: "8px 12px",
              height: "32px"
            }}
          />
        </Form.Item>
        
        <Form.Item 
          name={COMPLAINT_FORM_FIELDS.NAME}
          label="ชื่อ - นามสกุล"
          className={`${styles.textField} ${styles.optionalField}`}
        >
          <Input 
            placeholder="👤 ใส่ชื่อ-นามสกุล (หากต้องการให้ติดต่อกลับ) เช่น นาย สมชาย ใจดี"
            disabled={isSubmitting}
            style={{ 
              fontFamily: "THSarabun, sans-serif", 
              fontSize: "14px",
              padding: "8px 12px",
              height: "32px"
            }}
          />
        </Form.Item>
        
        <Form.Item 
          name={COMPLAINT_FORM_FIELDS.TEL}
          label="เบอร์โทรศัพท์"
          className={`${styles.textField} ${styles.optionalField}`}
          rules={[
            {
              pattern: COMPLAINT_VALIDATION.tel,
              message: COMPLAINT_ERROR_MESSAGES.INVALID_TEL
            }
          ]}
        >
          <Input 
            placeholder="📱 ใส่เบอร์โทร (หากต้องการให้โทรกลับ) เช่น 081-234-5678"
            disabled={isSubmitting}
            style={{ 
              fontFamily: "THSarabun, sans-serif", 
              fontSize: "14px",
              padding: "8px 12px",
              height: "32px"
            }}
          />
        </Form.Item>
        
        <Form.Item 
          name={COMPLAINT_FORM_FIELDS.EMAIL}
          label="อีเมล"
          className={`${styles.textField} ${styles.optionalField}`}
          rules={[
            {
              type: 'email',
              message: COMPLAINT_ERROR_MESSAGES.INVALID_EMAIL
            }
          ]}
        >
          <Input 
            type="email"
            placeholder="✉️ ใส่อีเมล (หากต้องการให้ตอบกลับ) เช่น example@gmail.com"
            disabled={isSubmitting}
            style={{ 
              fontFamily: "THSarabun, sans-serif", 
              fontSize: "14px",
              padding: "8px 12px",
              height: "32px"
            }}
          />
        </Form.Item>
        
        <div className={styles.compactDivider}>
          📝 ส่วนหลัก (จำเป็น)
        </div>
        
        <Form.Item 
          name={COMPLAINT_FORM_FIELDS.COMPLAINT}
          label="เรื่องข้อเสนอแนะ ร้องเรียน"
          className={`${styles.textField} ${styles.requiredField}`}
          rules={[
            { 
              required: true, 
              message: COMPLAINT_ERROR_MESSAGES.REQUIRED_COMPLAINT 
            },
            {
              min: COMPLAINT_VALIDATION.minComplaintLength,
              message: COMPLAINT_ERROR_MESSAGES.COMPLAINT_TOO_SHORT
            },
            {
              max: COMPLAINT_VALIDATION.maxComplaintLength,
              message: COMPLAINT_ERROR_MESSAGES.COMPLAINT_TOO_LONG
            }
          ]}
        >
          <TextArea 
            rows={4}
            placeholder="📝 อธิบายข้อเสนอแนะ/ร้องเรียน\n\n💡 เช่น: บริการช้า, พนักงานไม่สุภาพ, วันที่ 15/1/67, 10:30 น."
            disabled={isSubmitting}
            style={{ 
              fontFamily: "THSarabun, sans-serif", 
              fontSize: "16px",
              padding: "10px 12px",
              borderRadius: "8px",
              minHeight: "100px",
              lineHeight: "1.4"
            }}
          />
        </Form.Item>
        
        <Form.Item className={styles.dialogActions}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            className={styles.submitButton}
            style={{ marginRight: 10 }}
            icon={!isSubmitting && <SendIcon />}
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่งข้อมูล"}
          </Button>
          <Button
            onClick={handleModalClose}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            ❌ ยกเลิก
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}