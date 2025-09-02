import ServicesPage from "@/components/ServicesPage";

const SpecialLoan = () => {
  const customLabels = ["แบบฟอร์มเงินกู้พิเศษ", "บันทึกข้อความเงินกู้พิเศษ"];
  
  return (
    <ServicesPage 
      subcategory="เงินกู้พิเศษ" 
      customLabels={customLabels}
    />
  );
};

export default SpecialLoan;
