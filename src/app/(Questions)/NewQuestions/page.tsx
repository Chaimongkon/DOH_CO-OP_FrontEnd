"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  QuestionFormData, 
  QuestionFormErrors, 
  QuestionApiError 
} from "@/types";
import useFormState from "@/hooks/useFormState";

const NewQuestionPage = () => {
  const {
    formData,
    errors,
    apiError,
    isSubmitting,
    handleChange,
    validateForm,
    setSubmitting,
    setApiError,
  } = useFormState<QuestionFormData, QuestionFormErrors>({
    initialData: {
      name: "",
      memberNumber: "",
      title: "",
      body: "",
    },
    validationSchema: {
      title: {
        required: true,
        custom: (value) => 
          typeof value === 'string' && !value.trim() ? "กรุณากรอกหัวข้อ" : null
      },
      body: {
        required: true,
        custom: (value) => 
          typeof value === 'string' && !value.trim() ? "กรุณากรอกเรื่องที่ต้องการสอบถาม" : null
      },
    },
    clearErrorOnChange: true,
    clearApiErrorOnChange: true,
  });
  
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const submitQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!API) {
      setApiError("ระบบไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const submissionData = {
        name: formData.name.trim() || "ผู้ไม่ประสงค์ออกนาม",
        memberNumber: formData.memberNumber.trim() || "000000",
        title: formData.title.trim(),
        body: formData.body.trim(),
      };

      const response = await fetch(`${API}/Questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        router.push("/Questions");
      } else {
        const errorData: QuestionApiError = await response.json().catch(() => ({}));
        setApiError(errorData.message || "ไม่สามารถส่งคำถามได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch{
      setApiError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <section className="py-5" role="main">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            
            {/* Header */}
            <header className="text-center mb-5">
              <div className="mb-4">
                <i className="fas fa-edit fa-3x text-success mb-3"></i>
              </div>
              <h1 className="display-6 text-uppercase lined mb-3">
                ตั้งกระทู้คำถาม
              </h1>
              <p className="text-muted fs-5">
                แบ่งปันคำถามของคุณและได้รับคำตอบจากชุมชนสหกรณ์
              </p>
            </header>

            {/* Form */}
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                
                {/* Error Alert */}
                {apiError && (
                  <div className="alert alert-danger d-flex align-items-center mb-4" role="alert" style={{ borderRadius: '25px' }}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <div>{apiError}</div>
                  </div>
                )}

                <form onSubmit={submitQuestion} noValidate>
                  
                  {/* Name Field */}
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fs-5 fw-semibold">
                      <i className="fas fa-user me-2 text-muted"></i>
                      ชื่อ - สกุล
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg fs-5"
                      id="name"
                      name="name"
                      placeholder="ชื่อ - สกุล"
                      value={formData.name}
                      onChange={handleChange('name')}
                      disabled={isSubmitting}
                      style={{ borderRadius: '25px' }}
                    />
                    {!formData.name.trim() && (
                      <div className="form-text text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        ถ้าไม่กรอกจะใช้เป็น &quot;ผู้ไม่ประสงค์ออกนาม&quot;
                      </div>
                    )}
                  </div>

                  {/* Member Number Field */}
                  <div className="mb-4">
                    <label htmlFor="memberNumber" className="form-label fs-5 fw-semibold">
                      <i className="fas fa-id-card me-2 text-muted"></i>
                      เลขสมาชิก
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg fs-5"
                      id="memberNumber"
                      name="memberNumber"
                      placeholder="เลขสมาชิก"
                      value={formData.memberNumber}
                      onChange={handleChange('memberNumber')}
                      disabled={isSubmitting}
                      style={{ borderRadius: '25px' }}
                    />
                    {!formData.memberNumber.trim() && (
                      <div className="form-text text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        ถ้าไม่กรอกจะใช้เป็น &quot;000000&quot;
                      </div>
                    )}
                  </div>

                  {/* Title Field */}
                  <div className="mb-4">
                    <label htmlFor="title" className="form-label fs-5 fw-semibold">
                      <i className="fas fa-heading me-2 text-muted"></i>
                      หัวข้อ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg fs-5 ${errors.title ? 'is-invalid' : ''}`}
                      id="title"
                      name="title"
                      placeholder="หัวข้อของคำถาม"
                      value={formData.title}
                      onChange={handleChange('title')}
                      disabled={isSubmitting}
                      required
                      style={{ borderRadius: '25px' }}
                    />
                    {errors.title && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.title}
                      </div>
                    )}
                  </div>

                  {/* Body Field */}
                  <div className="mb-5">
                    <label htmlFor="body" className="form-label fs-5 fw-semibold">
                      <i className="fas fa-comment me-2 text-muted"></i>
                      เรื่องที่ต้องการสอบถาม <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control form-control-lg fs-5 ${errors.body ? 'is-invalid' : ''}`}
                      id="body"
                      name="body"
                      rows={6}
                      placeholder="รายละเอียดของคำถามที่ต้องการสอบถาม..."
                      value={formData.body}
                      onChange={handleChange('body')}
                      disabled={isSubmitting}
                      required
                      style={{ borderRadius: '25px', resize: 'vertical' }}
                    />
                    {errors.body && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.body}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                    <button
                      type="submit"
                      className="btn btn-success btn-lg fs-5 px-5"
                      disabled={isSubmitting}
                      style={{ borderRadius: '50px', minWidth: '200px' }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">กำลังส่ง...</span>
                          </div>
                          กำลังส่ง...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          ตั้งกระทู้คำถาม
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg fs-5 px-5"
                      disabled={isSubmitting}
                      onClick={handleGoBack}
                      style={{ borderRadius: '50px', minWidth: '200px' }}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      กลับหน้าหลัก Q&A
                    </button>
                  </div>

                </form>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-5">
              <div className="card bg-light border-0" style={{ borderRadius: '25px' }}>
                <div className="card-body text-center p-4">
                  <h5 className="card-title text-muted mb-3">
                    <i className="fas fa-lightbulb me-2"></i>
                    เคล็ดลับการตั้งคำถามที่ดี
                  </h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                        <small className="text-muted">
                          เขียนหัวข้อที่ชัดเจนและเข้าใจง่าย
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                        <small className="text-muted">
                          อธิบายรายละเอียดให้ครบถ้วน
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                        <small className="text-muted">
                          ใช้ภาษาที่สุภาพและเหมาะสม
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .form-control:focus {
          border-color: #20c997;
          box-shadow: 0 0 0 0.2rem rgba(32, 201, 151, 0.25);
        }
        
        .btn-success {
          background: linear-gradient(45deg, #198754, #20c997);
          border: none;
          box-shadow: 0 4px 8px rgba(32, 201, 151, 0.2);
          transition: all 0.3s ease;
        }
        
        .btn-success:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(32, 201, 151, 0.3);
        }
        
        .btn-outline-secondary {
          transition: all 0.3s ease;
        }
        
        .btn-outline-secondary:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        
        .card {
          border-radius: 30px;
          transition: transform 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
        
        .lined {
          position: relative;
          padding-bottom: 15px;
        }
        
        .lined:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(45deg, #198754, #20c997);
          border-radius: 2px;
        }
        
        .form-label {
          color: #495057;
          margin-bottom: 8px;
        }
        
        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }
        
        @media (max-width: 768px) {
          .card-body {
            padding: 2rem 1.5rem;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default NewQuestionPage;