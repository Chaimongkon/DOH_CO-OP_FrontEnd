"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import logger from "@/lib/logger";
import { 
  QuestionDetail, 
  Answer, 
  QuestionDetailResponse,
  AnswerFormData,
  AnswerFormErrors,
} from "@/types";

const QuestionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const questionId = params?.id as string;
  
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [formData, setFormData] = useState<AnswerFormData>({
    name: "",
    body: "",
  });
  const [errors, setErrors] = useState<AnswerFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ฟังก์ชันตรวจสอบ admin
  const isAdmin = useCallback((name: string): boolean => {
    // Admin usernames - ปรับเปลี่ยนตามระบบจริง
    const ADMIN_USERS = ["Admin", "Administrator", "ผู้ดูแลระบบ", "เจ้าหน้าที่"];
    
    return ADMIN_USERS.some(admin => 
      name.toLowerCase().includes(admin.toLowerCase()) ||
      name.includes("admin") ||
      name.includes("ผู้ดูแล")
    );
  }, []);

  // ฟังก์ชันสำหรับแปลงวันที่
  const formatThaiDateTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "วันที่ไม่ถูกต้อง";
      }

      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };

      return date.toLocaleDateString("th-TH", options).replace(",", "") + " น.";
    } catch {
      return "วันที่ไม่ถูกต้อง";
    }
  }, []);

  const fetchQuestionAndAnswers = useCallback(async () => {
    if (!API) {
      setError("การกำหนดค่า API ไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    if (!questionId) {
      setError("ไม่พบรหัสคำถาม");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API}/Questions/${questionId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("ไม่พบคำถามที่ต้องการ");
        }
        throw new Error(`เกิดข้อผิดพลาด: ${response.status}`);
      }

      const data: QuestionDetailResponse = await response.json();
      setQuestion(data.question);
      setAnswers(data.answers || []);
    } catch (error) {
      logger.error("Error fetching question:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "ไม่สามารถโหลดคำถามได้";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API, questionId]);

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [fetchQuestionAndAnswers]);

  const validateAnswerForm = useCallback((): boolean => {
    const newErrors: AnswerFormErrors = {};
    
    if (!formData.body.trim()) {
      newErrors.body = "กรุณากรอกความคิดเห็น";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.body]);

  const handleInputChange = useCallback((field: keyof AnswerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[field as keyof AnswerFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const submitAnswer = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateAnswerForm()) {
      return;
    }

    if (!API || !questionId) {
      setError("ไม่สามารถส่งความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const submissionData = {
        body: formData.body.trim(),
        name: formData.name.trim() || "ผู้ไม่ประสงค์ออกนาม",
      };

      const response = await fetch(`${API}/Questions/${questionId}/Answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถส่งความคิดเห็นได้");
      }

      // Clear form after successful submission
      setFormData({ name: "", body: "" });
      
      // Fetch updated answers
      const updatedResponse = await fetch(`${API}/Questions/${questionId}/Answers`);
      if (updatedResponse.ok) {
        const updatedAnswers: Answer[] = await updatedResponse.json();
        setAnswers(updatedAnswers);
      }
    } catch (error) {
      logger.error("Error submitting answer:", error);
      setError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งความคิดเห็น");
    } finally {
      setSubmitting(false);
    }
  }, [API, questionId, formData, validateAnswerForm]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <section className="py-5" role="main">
        <div className="container py-4">
          <header className="text-center mb-5">
            <h1 className="display-6 text-uppercase lined">
              กระดานถาม-ตอบ (Q&A)
            </h1>
          </header>
          
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="text-muted">กำลังโหลดคำถาม...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-5" role="main">
        <div className="container py-4">
          <header className="text-center mb-5">
            <h1 className="display-6 text-uppercase lined">
              กระดานถาม-ตอบ (Q&A)
            </h1>
          </header>
          
          <div className="alert alert-danger text-center" role="alert" style={{ borderRadius: '25px' }}>
            <h5 className="alert-heading">เกิดข้อผิดพลาด</h5>
            <p className="mb-3">{error}</p>
            <button className="btn btn-outline-danger me-2" onClick={fetchQuestionAndAnswers}>
              ลองใหม่อีกครั้ง
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={handleGoBack}
              style={{ borderRadius: '50px' }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              กลับหน้าหลัก Q&A
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5" role="main">
      <div className="container py-4">
        <header className="text-center mb-5">
          <h1 className="display-6 text-uppercase lined">
            กระดานถาม-ตอบ (Q&A)
          </h1>
        </header>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            
            {/* Question Card */}
            {question && (
              <div className="card question-card shadow-lg mb-4">
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex align-items-center mb-3">
                    <div className="question-icon me-3">
                      <i className="fas fa-question fa-2x"></i>
                    </div>
                    <div>
                      <h2 className="card-title mb-1 fs-3 fw-bold text-primary">
                        {question.Title}
                      </h2>
                      <small className="text-muted">
                        <i className="fas fa-user me-1"></i>
                        โดย <strong>{question.Name}</strong>
                      </small>
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="question-body fs-5 lh-lg mb-4">
                    {question.Body.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center text-muted">
                        <i className="fas fa-clock me-2"></i>
                        <span>โพสเมื่อ {formatThaiDateTime(question.CreatedAt)}</span>
                      </div>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <div className="d-flex justify-content-md-end gap-3">
                        <div className="stats-item view-stats">
                          <div className="stats-icon">
                            <i className="fas fa-eye"></i>
                          </div>
                          <div className="stats-content">
                            <span className="stats-text">{question.ViewCount.toLocaleString()} เข้าชม</span>
                          </div>
                        </div>
                        <div className="stats-item comment-stats">
                          <div className="stats-icon">
                            <i className="fas fa-comments"></i>
                          </div>
                          <div className="stats-content">
                            <span className="stats-text">{answers.length} ความคิดเห็น</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Answers Section */}
            <div className="card answers-section shadow-sm mb-4">
              <div className="card-header bg-light">
                <h3 className="card-title mb-0 fs-4 fw-bold">
                  <i className="fas fa-comments me-2 text-success"></i>
                  ความคิดเห็น ({answers.length})
                </h3>
              </div>
              <div className="card-body p-4">
                
                {answers.length > 0 ? (
                  <div className="answers-list">
                    {answers.map((answer) => {
                      const isAdminComment = isAdmin(answer.Name);
                      return (
                        <div
                          key={answer.Id}
                          className={`answer-card card mb-3 ${
                            isAdminComment ? 'admin-answer' : 'user-answer'
                          }`}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex align-items-start mb-3">
                              <div className={`avatar-icon me-3 ${isAdminComment ? 'admin' : 'user'}`}>
                                <i className={`fas ${
                                  isAdminComment ? 'fa-shield-alt' : 'fa-user-circle'
                                } fa-2x`}></i>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-2">
                                  <h6 className={`mb-0 fw-bold ${
                                    isAdminComment ? 'text-danger' : 'text-primary'
                                  }`}>
                                    {answer.Name}
                                    {isAdminComment && (
                                      <span className="badge bg-danger ms-2 fs-7">
                                        <i className="fas fa-crown me-1"></i>
                                        ADMIN
                                      </span>
                                    )}
                                  </h6>
                                </div>
                                <small className="text-muted">
                                  <i className="fas fa-clock me-1"></i>
                                  {formatThaiDateTime(answer.CreatedAt)}
                                </small>
                              </div>
                            </div>
                            
                            <div className="answer-body fs-5 lh-lg">
                              {answer.Body.split('\n').map((line, lineIndex) => (
                                <p key={lineIndex} className="mb-2">
                                  {line || '\u00A0'}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-answers text-center py-5">
                    <div className="mb-4">
                      <i className="fas fa-comment-slash fa-4x text-muted"></i>
                    </div>
                    <h5 className="text-muted mb-2">ยังไม่มีความคิดเห็น</h5>
                    <p className="text-muted">คุณเป็นคนแรกที่จะแสดงความคิดเห็น!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comment Form */}
            <div className="card comment-form shadow-sm">
              <div className="card-header bg-primary text-white">
                <h3 className="card-title mb-0 fs-4 fw-bold">
                  <i className="fas fa-edit me-2"></i>
                  แสดงความคิดเห็น
                </h3>
              </div>
              <div className="card-body p-4">
                
                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4" role="alert" style={{ borderRadius: '25px' }}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={submitAnswer} noValidate>
                  
                  {/* Comment Body */}
                  <div className="mb-4">
                    <label htmlFor="body" className="form-label fs-5 fw-semibold">
                      <i className="fas fa-comment me-2 text-muted"></i>
                      ความคิดเห็น <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control form-control-lg fs-5 ${errors.body ? 'is-invalid' : ''}`}
                      id="body"
                      name="body"
                      rows={5}
                      placeholder="แสดงความคิดเห็นของคุณ..."
                      value={formData.body}
                      onChange={handleInputChange('body')}
                      disabled={submitting}
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
                      onChange={handleInputChange('name')}
                      disabled={submitting}
                      style={{ borderRadius: '25px' }}
                    />
                    {!formData.name.trim() && (
                      <div className="form-text text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        ถ้าไม่กรอกจะใช้เป็น &quot;ผู้ไม่ประสงค์ออกนาม&quot;
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                    <button
                      type="submit"
                      className="btn btn-success btn-lg fs-5 px-5"
                      disabled={submitting}
                      style={{ borderRadius: '50px', minWidth: '200px' }}
                    >
                      {submitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">กำลังส่ง...</span>
                          </div>
                          กำลังส่ง...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          แสดงความคิดเห็น
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg fs-5 px-5"
                      disabled={submitting}
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

          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
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

        .question-card {
          border: none;
          border-left: 5px solid #0d6efd;
          background: linear-gradient(135deg, #fff9e6, #ffffff);
          border-radius: 25px;
        }

        .question-icon {
          background: linear-gradient(135deg, #20c997, #17a2b8, #0dcaf0);
          color: white;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(32, 201, 151, 0.3);
          border: 3px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .question-icon i {
          position: relative;
          z-index: 2;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .question-icon::before {
          content: "";
          position: absolute;
          top: 10%;
          left: 10%;
          width: 30%;
          height: 30%;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          animation: shimmer 2s infinite ease-in-out;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }

        .question-icon:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(32, 201, 151, 0.4);
          transition: all 0.3s ease;
        }

        .answers-section {
          border: none;
          border-radius: 25px;
        }

        .admin-answer {
          border-left: 4px solid #dc3545;
          background: linear-gradient(135deg, #fff5f5, #ffffff);
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
          border-radius: 20px;
        }

        .user-answer {
          border-left: 4px solid #20c997;
          background: linear-gradient(135deg, #f0fff4, #ffffff);
          box-shadow: 0 2px 8px rgba(32, 201, 151, 0.1);
          border-radius: 20px;
        }

        .avatar-icon.admin {
          color: #dc3545;
          background: linear-gradient(45deg, #fff5f5, #ffe6e6);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-icon.user {
          color: #20c997;
          background: linear-gradient(45deg, #f0fff4, #e6fff2);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .comment-form {
          border: none;
          border-radius: 25px;
        }

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
          transition: transform 0.3s ease;
        }

        .answer-card:hover {
          transform: translateY(-2px);
        }

        .stats-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(10px);
        }

        .view-stats {
          background: linear-gradient(135deg, rgba(23, 162, 184, 0.1), rgba(13, 202, 240, 0.1));
          border-left: 3px solid #17a2b8;
        }

        .comment-stats {
          background: linear-gradient(135deg, rgba(32, 201, 151, 0.1), rgba(25, 135, 84, 0.1));
          border-left: 3px solid #20c997;
        }

        .stats-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .stats-icon i {
          line-height: 1;
          position: relative;
          top: 0;
          left: 0;
        }

        .stats-icon .fa-eye {
          position: relative;
          top: 3px;
        }

        .stats-icon .fa-comments {
          position: relative;
          top: 3px;
        }

        .view-stats .stats-icon {
          background: linear-gradient(135deg, #17a2b8, #0dcaf0);
          color: white;
          box-shadow: 0 2px 4px rgba(23, 162, 184, 0.3);
        }

        .comment-stats .stats-icon {
          background: linear-gradient(135deg, #20c997, #198754);
          color: white;
          box-shadow: 0 2px 4px rgba(32, 201, 151, 0.3);
        }

        .stats-content {
          display: flex;
          align-items: center;
        }

        .stats-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: #495057;
          white-space: nowrap;
        }

        .stats-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .badge {
          font-size: 0.75rem;
        }

        .fs-7 {
          font-size: 0.7rem;
        }

        .empty-answers {
          background: linear-gradient(135deg, #f8f9fa, #ffffff);
          border-radius: 25px;
        }

        @media (max-width: 768px) {
          .question-icon {
            width: 50px;
            height: 50px;
          }
          
          .avatar-icon.admin,
          .avatar-icon.user {
            width: 40px;
            height: 40px;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default QuestionDetailPage;