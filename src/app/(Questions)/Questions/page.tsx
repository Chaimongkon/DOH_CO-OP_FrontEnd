"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TablePagination,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage"; 
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useRouter } from "next/navigation";

interface Question {
  Id: number;
  Title: string;
  Name: string;
  AnswerCount: number;
  ViewCount: number;
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;
  

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };


  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

const QuestionsPage = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!API) {
        console.error("API base URL is not defined");
        return;
      }

      try {
        const res = await fetch(`${API}/Questions`);
        if (!res.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [API]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - questions.length) : 0;

    const handleViewAllClick = () => {
      localStorage.setItem("menuName", "สร้างกระทู้ความคิดเห็น Q&A");
      router.push("/NewQuestions");
    };

  return (
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
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Link href={`/NewQuestions`}>
            <Button type="submit" variant="contained" color="success" onClick={handleViewAllClick}>
              สร้างกระทู้ความคิดเห็น
            </Button>
          </Link>
        </Box>
        <Box sx={{ fontFamily: "DOHCOOP", padding: 3 }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
              <TableBody>
                {(rowsPerPage > 0
                  ? questions.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : questions
                ).map((question) => (
                  <TableRow key={question.Id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                    <TableCell>
                      <Link href={`/Questions/${question.Id}`} passHref>
                        <Typography
                          variant="h6"
                          component="a"
                          sx={{ textDecoration: "none", color: "#1976d2" }}
                        >
                          {question.Title}
                        </Typography>
                      </Link>
                      <Typography variant="body2" color="textSecondary">
                        ตั้งกระทู้โดย คุณ {question.Name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {question.AnswerCount} คำตอบ
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {question.ViewCount} เข้าชม
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                    colSpan={3}
                    count={questions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                    sx={{
                      "& .MuiTablePagination-displayedRows": {
                        marginTop: "1rem",
                      },
                    }}
                    labelRowsPerPage={
                      <span
                        style={{
                          marginTop: "1rem", // Adjust as needed
                          textAlign: "center",
                          display: "block", // Ensures that text-align works properly
                          width: "100%", // Ensures proper centering within the parent
                        }}
                      >
                        Rows per page:
                      </span>
                    }
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      </div>
    </section>
  );
};

export default QuestionsPage;
