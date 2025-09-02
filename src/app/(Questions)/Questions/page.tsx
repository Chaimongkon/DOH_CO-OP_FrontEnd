"use client";
import { useEffect, useState, memo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import logger from "@/lib/logger";
import useAsyncOperation from "@/hooks/useAsyncOperation";
import useSearchPagination from "@/hooks/useSearchPagination";
import { 
  Question, 
  QuestionApiResponse 
} from "@/types";

// Simple in-memory cache for questions data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let questionsCache: {
  data: Question[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

interface QuestionRowProps {
  question: Question;
  onNavigate: (id: number) => void;
}

const QuestionRow = memo(({ question, onNavigate }: QuestionRowProps) => {
  const handleClick = useCallback(() => {
    onNavigate(question.Id);
  }, [onNavigate, question.Id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(question.Id);
    }
  }, [onNavigate, question.Id]);

  return (
    <tr 
      className="question-row"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`ดูคำถาม: ${question.Title}`}
      style={{ cursor: "pointer" }}
    >
      <td className="p-3">
        <h5 className="text-primary fw-bold mb-2 question-title fs-4">
          {question.Title}
        </h5>
        <p className="text-muted mb-0 fs-6">
          ตั้งกระทู้โดย คุณ {question.Name}
        </p>
      </td>
      <td className="text-end p-3">
        <span className={`badge ${question.AnswerCount > 0 ? 'bg-success' : 'bg-secondary'} fw-bold fs-6`}>
          {question.AnswerCount} คำตอบ
        </span>
      </td>
      <td className="text-end p-3">
        <span className="fw-bold text-dark fs-5">
          {question.ViewCount.toLocaleString()} เข้าชม
        </span>
      </td>
    </tr>
  );
});

QuestionRow.displayName = 'QuestionRow';

const QuestionsPage = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const lastRequestTime = useRef(0);
  
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchQuestions = useCallback(async (): Promise<Question[]> => {
    if (!API) {
      throw new Error("การกำหนดค่า API ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ");
    }

    try {
      // Check cache first
      const now = Date.now();
      if (questionsCache.data && (now - questionsCache.timestamp) < CACHE_DURATION) {
        logger.info('Using cached questions data');
        return questionsCache.data;
      }

      // Implement request throttling (minimum 2 seconds between requests)
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < 2000) {
        const delay = 2000 - timeSinceLastRequest;
        logger.info(`Throttling questions request, waiting ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      lastRequestTime.current = Date.now();

      const response = await fetch(`${API}/Questions`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("กำลังโหลดข้อมูลคำถามหนักเกินไป กรุณารอสักครู่และลองใหม่อีกครั้ง");
        }
        throw new Error(`การเรียกข้อมูลล้มเหลว: ${response.status}`);
      }
      
      const data: QuestionApiResponse<Question[]> | Question[] = await response.json();
      
      // Handle different API response formats
      const questionsData = Array.isArray(data) ? data : data.data || [];
      
      // Cache the result
      questionsCache = {
        data: questionsData,
        timestamp: Date.now()
      };
      
      return questionsData;
    } catch (error) {
      logger.error("Failed to fetch questions:", error);
      
      // If we have cached data and it's a network error, use the cache
      if (questionsCache.data && questionsCache.data.length > 0) {
        logger.info('Network error detected, falling back to cached questions data');
        return questionsCache.data;
      }
      
      throw error;
    }
  }, [API]);

  const { data: fetchedQuestions, loading, error, execute } = useAsyncOperation(
    fetchQuestions,
    {
      errorMessage: "ไม่สามารถโหลดคำถามได้ กรุณาลองใหม่อีกครั้ง"
    }
  );

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fetchedQuestions) {
      setQuestions(fetchedQuestions);
    }
  }, [fetchedQuestions]);

  // Use search and pagination hook
  const {
    searchTerm,
    handleSearchChange,
    clearSearch,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    filteredData: filteredQuestions,
    paginatedData: paginatedQuestions,
    hasResults
  } = useSearchPagination(questions, {
    initialRowsPerPage: 10,
    searchFields: ['Title', 'Name'] as (keyof Question)[]
  });

  const handleCreateQuestion = useCallback(() => {
    router.push("/NewQuestions");
  }, [router]);

  const handleNavigateToQuestion = useCallback((questionId: number) => {
    router.push(`/Questions/${questionId}`);
  }, [router]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / rowsPerPage);
  const startItem = page * rowsPerPage + 1;
  const endItem = Math.min((page + 1) * rowsPerPage, filteredQuestions.length);

  // Early return for loading state
  if (loading) {
    return (
      <section className="py-5" role="main">
        <div className="container py-4">
          <header className="mb-5">
            <h2 className="text-uppercase lined mb-4 text-center">
              กระดานถาม-ตอบ (Q&A)
            </h2>
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

  // Early return for error state
  if (error) {
    return (
      <section className="py-5" role="main">
        <div className="container py-4">
          <header className="mb-5">
            <h2 className="text-uppercase lined mb-4 text-center">
              กระดานถาม-ตอบ (Q&A)
            </h2>
          </header>
          
          <div className="alert alert-danger text-center" role="alert" style={{ borderRadius: '25px' }}>
            <h5 className="alert-heading">เกิดข้อผิดพลาดในการโหลดข้อมูล</h5>
            <p className="mb-3">{error}</p>
            <button className="btn btn-outline-danger" onClick={execute}>
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5" role="main">
      <div className="container py-4">
        <header className="mb-5">
          <h1 className="text-uppercase lined mb-4 text-center display-6">
            กระดานถาม-ตอบ (Q&A)
          </h1>
          <p className="text-center text-muted fs-5">
            แบ่งปันความรู้ ถามตอบ และแลกเปลี่ยนประสบการณ์ร่วมกัน
          </p>
        </header>
        
        {/* Search and Create Button */}
        <div className="row mb-4 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light" style={{ borderRadius: '15px 0 0 15px' }}>
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control fs-5"
                style={{ borderRadius: '15px 0 0 15px' }}
                placeholder="ค้นหาคำถาม..."
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="ค้นหาคำถาม"
              />
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary"
                  style={{ borderRadius: '0 15px 15px 0' }} 
                  type="button"
                  onClick={clearSearch}
                  aria-label="ล้างการค้นหา"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <button 
              type="button"
              className="btn btn-success btn-lg fs-5"
              onClick={handleCreateQuestion}
              aria-label="สร้างกระทู้ความคิดเห็นใหม่"
              style={{ borderRadius: '50px' }}
            >
              <i className="fas fa-plus me-2"></i>
              สร้างกระทู้ความคิดเห็น
            </button>
          </div>
        </div>

        {!hasResults ? (
          searchTerm ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">ไม่พบคำถามที่ค้นหา</h5>
                <p className="text-muted">
                  ลองใช้คำค้นหาอื่น หรือ 
                  <button className="btn btn-link p-0 ms-1" onClick={clearSearch}>
                    ดูคำถามทั้งหมด
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">ยังไม่มีคำถามในระบบ</h5>
                <p className="text-muted">เป็นคนแรกที่สร้างกระทู้คำถามใหม่</p>
                <button 
                  className="btn btn-success mt-2"
                  onClick={handleCreateQuestion}
                  style={{ borderRadius: '50px' }}
                >
                  <i className="fas fa-plus me-2"></i>
                  สร้างกระทู้แรก
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            {/* Questions Table */}
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="p-3 fw-bold fs-5">หัวข้อคำถาม</th>
                        <th scope="col" className="text-end p-3 fw-bold fs-5">คำตอบ</th>
                        <th scope="col" className="text-end p-3 fw-bold fs-5">เข้าชม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuestions.map((question) => (
                        <QuestionRow
                          key={`question-${question.Id}`}
                          question={question}
                          onNavigate={handleNavigateToQuestion}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="การนำทางหน้า" className="mt-4">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="me-2">แสดง</span>
                      <select 
                        className="form-select form-select-sm me-2" 
                        style={{ width: 'auto' }}
                        value={rowsPerPage}
                        onChange={(e) => handleChangeRowsPerPage({
                          target: { 
                            value: e.target.value,
                            name: 'rowsPerPage'
                          }
                        } as React.ChangeEvent<HTMLInputElement>)}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={-1}>ทั้งหมด</option>
                      </select>
                      <span className="text-muted">
                        รายการต่อหน้า ({startItem}-{endItem} จาก {filteredQuestions.length} รายการ)
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <ul className="pagination justify-content-md-end justify-content-center mb-0">
                      <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handleChangePage(null, 0)}
                          disabled={page === 0}
                          aria-label="หน้าแรก"
                        >
                          <i className="fas fa-angle-double-left"></i>
                        </button>
                      </li>
                      <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handleChangePage(null, page - 1)}
                          disabled={page === 0}
                          aria-label="หน้าก่อนหน้า"
                        >
                          <i className="fas fa-angle-left"></i>
                        </button>
                      </li>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
                        const pageNum = startPage + i;
                        if (pageNum >= totalPages || pageNum < 0) return null;
                        return (
                          <li key={`page-${pageNum}`} className={`page-item ${pageNum === page ? 'active' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handleChangePage(null, pageNum)}
                            >
                              {pageNum + 1}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handleChangePage(null, page + 1)}
                          disabled={page >= totalPages - 1}
                          aria-label="หน้าถัดไป"
                        >
                          <i className="fas fa-angle-right"></i>
                        </button>
                      </li>
                      <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handleChangePage(null, totalPages - 1)}
                          disabled={page >= totalPages - 1}
                          aria-label="หน้าสุดท้าย"
                        >
                          <i className="fas fa-angle-double-right"></i>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .question-row:hover {
          background-color: #f8f9fa !important;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        .question-title:hover {
          text-decoration: underline;
          color: #0d6efd !important;
        }
        
        .table th {
          border-bottom: 2px solid #dee2e6;
          background-color: #f8f9fa;
        }
        
        .card {
          border: none;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border-radius: 25px;
        }
        
        .btn-success {
          background: linear-gradient(45deg, #198754, #20c997);
          border: none;
          box-shadow: 0 2px 4px rgba(32, 201, 151, 0.2);
        }
        
        .btn-success:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(32, 201, 151, 0.3);
        }
        
        .input-group-text {
          border-right: none;
        }
        
        .form-control:focus {
          border-color: #20c997;
          box-shadow: 0 0 0 0.2rem rgba(32, 201, 151, 0.25);
        }
        
        .pagination .page-link {
          color: #6c757d;
          border: 1px solid #dee2e6;
        }
        
        .pagination .page-item.active .page-link {
          background-color: #20c997;
          border-color: #20c997;
        }
        
        .pagination .page-link:hover {
          color: #20c997;
          background-color: #e9ecef;
        }
        
        .badge {
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
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
      `}</style>
    </section>
  );
};

export default QuestionsPage;