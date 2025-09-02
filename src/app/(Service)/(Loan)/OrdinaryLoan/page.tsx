import ServicesPage from "@/components/ServicesPage";

const OrdinaryLoan = () => {
  const customLabels = ["แบบฟอร์มเงินกู้สามัญ", "บันทึกข้อความเงินกู้สามัญ"];
  
  return (
    <ServicesPage 
      subcategory="เงินกู้สามัญ" 
      customLabels={customLabels}
    />
  );
};

export default OrdinaryLoan;
