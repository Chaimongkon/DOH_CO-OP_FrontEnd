import ServicesPage from "@/components/ServicesPage";

const EmergencyLoan = () => {
  const customLabels = ["แบบฟอร์มเงินกู้เพื่อเหตุฉุกเฉิน", "บันทึกข้อความเงินกู้เพื่อเหตุฉุกเฉิน"];
  
  return (
    <ServicesPage 
      subcategory="เงินกู้เพื่อเหตุฉุกเฉิน" 
      customLabels={customLabels}
    />
  );
};

export default EmergencyLoan;
