import React, { useContext } from "react";
import styles from "./HomeEle.module.css";
import { Button, ConfigProvider } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
import { useMediaQuery } from "@mui/material";
import useNavigation from "@/hooks/useNavigation";

const HomeApplication = () => {
  const { navigateWithMenu } = useNavigation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const linearGradientButton = css`
    &.${rootPrefixCls}-btn-primary:not([disabled]):not(
        .${rootPrefixCls}-btn-dangerous
      ) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: "";
        background: linear-gradient(135deg, #ff8c00, #ffd700);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        background: linear-gradient(135deg, #ff6f91, #ff9671);
        opacity: 1;
      }
    }
  `;
  const handleViewAllClick = () => {
    navigateWithMenu("/Election", "ตรวจสอบผู้มีสิทธิเลือกตั้ง");
  };

  return (
    <div className={styles.ApplicationHome}>
      <div className={styles.inputGroup}>
        <div className="col-lg-8">
          <h2 className={styles.centeredText}>
            ค้นหาช่องเลือกตั้ง คณะกรรมการดำเนินการ ประจำปี 2568
          </h2>
        </div>
        <div className={` ${styles.centeredText}`}>
          {" "}
          <ConfigProvider
            button={{
              className: linearGradientButton,
            }}
          >
            {" "}
            <Button
              style={{
                fontFamily: "DOHCOOP",
                fontSize: isMobile ? "1.1rem" : "1.5rem", // Smaller font on mobile
                padding: isMobile ? "10px 16px" : "12px 20px", // Adjust padding for mobile
                lineHeight: "1.2",
                height: "auto",
              }}
              type="primary"
              size="large"
              onClick={handleViewAllClick}
              icon={<AntDesignOutlined />}
            >
              คลิก ไปยังหน้าค้นหา
            </Button>
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
};

export default HomeApplication;
