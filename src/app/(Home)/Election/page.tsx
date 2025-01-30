"use client";
import React, { useState } from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Box, Container, Paper, TextField } from "@mui/material";

interface ElectionResult {
  Department: string;
  FieldNumber: string;
  FullName: string;
  Id: number;
  IdCard: string;
  Member: string;
  SequenceNumber: string;
}

const ElectionPage = () => {
  const [search, setSearch] = useState(""); // Define search state
  const [results, setResults] = useState<ElectionResult | null>(null);
  const [showResult, setShowResult] = useState(false); // New state to toggle sections
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSearch = async () => {
    if (search.length < 6) {
      Swal.fire({
        title:
          "<strong>เลขประจำตัวบัตรประชาชนต้องมี 13 หลัก & เลขสมาชิกต้องมี 6 หลัก</strong>",
        html: `
          กรุณากรอกเลขประจำตัวประชาชนและเลขสมาชิกให้ครบ<p style="color:red"><b>*หากเลขสมาชิกไม่ครบ 6 หลักให้เติม 0 ข้างหน้าให้ครบ 6 หลัก*</b></p>
        `,
        icon: "info",
      });
      return;
    } else if (search.length > 6 && search.length < 13) {
      Swal.fire({
        title: "เลขประจำตัวประชาชนมี 13 หลัก",
        text: "กรุณากรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก",
        icon: "warning",
      });
      return;
    }

    try {
      const response = await fetch(`${API}/Election?search=${search}`);
      const resultData = await response.json();

      if (resultData.data && resultData.data.length > 0) {
        setResults(resultData.data[0]);
        setShowResult(true); // Show result section
      } else {
        Swal.fire(
          "ไม่พบข้อมูลผู้มีสิทธิ์เลือกตั้ง",
          "กรุณาตรวจสอบใหม่",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error", "ไม่พบข้อมูลผู้มีสิทธิ์เลือกตั้ง", "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (inputValue.length <= 13) {
      setSearch(inputValue);
    } else {
      Swal.fire({
        title: "เลขประจำตัวประชาชนมี 13 หลัก",
        icon: "warning",
      });
    }
  };

  return (
    <section className="py-5 bg-gray-200">
      <div className="container py-2">
        <div className="col-lg-12">
          <div className="box-image-text text-center">
            <Container>
              <Paper
                style={{
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.7)",
                  padding: "20px",
                }}
              >
                {!showResult ? (
                  <>
                    {/* Search Section */}
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, p: 2 }}>
                        <div className="product h-100">
                          <div className="product-image">
                            <img
                              className="avatar avatar-xxl p-2 mb-4"
                              src="/image/logo/logoele.png"
                              alt="Princess Leia"
                            />
                          </div>
                        </div>
                      </Box>
                    </Box>
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1 }}>
                        <h1>ตรวจสอบผู้มีสิทธิเลือกตั้ง</h1>
                      </Box>
                    </Box>
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, m: 1 }}>
                        <h3>
                          กรุณากรอก เลขบัตรประจำตัวประชาชนหรือเลขสมาชิก
                          เพื่อใช้ในการค้นหา
                        </h3>
                      </Box>
                    </Box>
                    <Box display="flow">
                      <Box>
                        <TextField
                          id="outlined-basic"
                          label="เลขบัตรประชาชน/เลขสมาชิก"
                          variant="outlined"
                          inputProps={{
                            maxLength: 13,
                            style: { fontSize: "24px" },
                          }}
                          InputLabelProps={{
                            style: {
                              fontSize: "24px", // Larger font size for label
                              transformOrigin: "top left", // Center origin to keep label in place
                            },
                          }}
                          autoComplete="off"
                          style={{
                            width: "80%",
                            marginBottom: "2em",
                            fontFamily: "thaifont",
                          }}
                          value={search}
                          onChange={handleInputChange}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSearch();
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, m: 1 }}>
                        <Button
                          type="primary"
                          style={{
                            width: "60%",
                            marginBottom: "1em",
                            fontSize: "20px",
                          }}
                          size="large"
                          onClick={handleSearch}
                        >
                          ค้นหา
                        </Button>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <>
                    {/* Result Section */}
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, p: 2 }}>
                        <div className="product h-100">
                          <div className="product-image">
                            <h1 style={{ color: "maroon" }}>
                              <u>ข้อมูลผู้มีสิทธิ์เลือกตั้ง</u>
                            </h1>
                            <h1 style={{ color: "maroon" }}>
                              <u>สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด</u>
                            </h1>
                          </div>
                        </div>
                      </Box>
                    </Box>
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, m: 1 }}>
                        <h3>
                          ชื่อ - นามสกุล : <b>{results?.FullName}</b>
                        </h3>
                      </Box>
                    </Box>
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, m: 1 }}>
                        <h3>
                          เลขบัตรประชาชน : <b>{results?.IdCard}</b>
                        </h3>
                      </Box>
                    </Box>
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, m: 1 }}>
                        <h3>
                          เลขสมาชิก : <b>{results?.Member}</b>
                        </h3>
                      </Box>
                    </Box>
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, m: 1 }}>
                        <h3>
                          หน่วยงาน : <b>{results?.Department}</b>
                        </h3>
                      </Box>
                    </Box>
                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, m: 1 }}>
                        <h1
                          style={{
                            color: "darkgreen",
                            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)", // เพิ่มเงาให้ข้อความเพื่อมิติ
                          }}
                        >
                          <i className="fa-solid fa-share flash"></i> &nbsp;
                          <u>
                            ช่อง ลำดับ :&nbsp;
                            <b>
                              <span
                                style={{
                                  color: "red",
                                  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.4)",
                                }}
                              >
                                {results?.FieldNumber}
                              </span>
                              &nbsp;&nbsp;
                              <span
                                style={{
                                  color: "blue",
                                  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.4)",
                                }}
                              >
                                {results?.SequenceNumber}
                              </span>
                            </b>
                          </u>
                          &nbsp;<i className="fa-solid fa-reply flash"></i>
                        </h1>
                      </Box>
                    </Box>

                    <Box display="flex">
                      <Box sx={{ flexGrow: 1, m: 2 }}>
                        <Button
                          type="primary"
                          shape="round"
                          icon={<ArrowLeftOutlined />}
                          size={"large"}
                          style={{
                            backgroundColor: "black",
                            borderColor: "black",
                            color: "#39ff14",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // เพิ่มเงาให้ปุ่ม
                          }}
                          onClick={() => {
                            setShowResult(false);
                            setSearch(""); // Clear search input
                          }}
                        >
                          Back Page
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>
            </Container>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElectionPage;
