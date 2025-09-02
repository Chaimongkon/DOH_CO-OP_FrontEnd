"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  Divider,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import { useApiConfig } from "@/hooks/useApiConfig";

interface Column {
  id: "Image" | "DepartmentName" | "File";
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
}

const columns: Column[] = [
  { id: "Image", label: "", minWidth: 170, align: "center" },
  {
    id: "DepartmentName",
    label: "หน่วยงาน",
    minWidth: 170,
    align: "left",
  },
  { id: "File", label: "File", minWidth: 170, align: "center" },
];

interface Data {
  Id: number;
  DepartmentName: string;
  FilePath: string;
}

export default function NewAll() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Data[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [open, setOpen] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { API, URLFile } = useApiConfig();

  // Lottie options
  // Lottie props will be passed directly to component

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getPaginatedData = useCallback(async () => {
    try {
      let url = `${API}/ElectionDepartment?page=${
        page + 1
      }&per_page=${rowsPerPage}`;
      if (search) {
        url += `&search=${search}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setTotalRows(data.total || 0);
      setRows(data.data || []);
    } catch {
      Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
    }
  }, [API, page, rowsPerPage, search]);

  useEffect(() => {
    getPaginatedData();
  }, [getPaginatedData]);

  const handleClickOpen = (filePath: string) => {
    setFilePath(filePath);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFilePath(null);
  };

  return (
    <section className="py-5">
      <div className="container py-4">
        <>
          <header className="mb-5">
            <h2 className="lined lined-center text-uppercase">
              ค้นหารายชื่อตามหน่วยงาน
            </h2>
          </header>

          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "10px",
              flexDirection: isMobile ? "column" : "row",
              mb: 2, // เพิ่มช่องว่างด้านล่าง
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="ค้นหา หน่วยงาน"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton
              color="primary"
              sx={{ p: "10px" }}
              aria-label="search"
              onClick={() => getPaginatedData()}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
          <Paper>
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ top: 5, minWidth: column.minWidth }}
                        sx={{ fontSize: "18px" }} // กำหนดขนาดตัวอักษรเป็น 16px
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.Id}>
                      {columns.map((column) => {
                        const value = row[column.id as keyof Data];
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={{ fontSize: "18px" }}
                          >
                            {column.id === "Image" ? (
                              <Image
                                src="/image/logo/pdfdl.png"
                                alt={`PDF icon for ${row.DepartmentName}`}
                                width={50}
                                height={50}
                                style={{ width: "50px", height: "auto" }}
                              />
                            ) : column.id === "File" ? (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() =>
                                  handleClickOpen(`${URLFile}${row.FilePath}`)
                                }
                              >
                                View PDF
                              </Button>
                            ) : (
                              value
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={totalRows}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                "& p": {
                  marginTop: 0,
                  marginBottom: 0, // ลบระยะห่างด้านล่างของ p ใน TablePagination
                },
              }}
            />
          </Paper>
          <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>PDF Preview</DialogTitle>
            <DialogContent>
              {filePath && (
                <iframe
                  src={filePath}
                  width="100%"
                  height="600px"
                  title="PDF Preview"
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      </div>
    </section>
  );
}
