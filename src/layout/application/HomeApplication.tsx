
import React, { memo } from "react";
import styles from "./HomeApp.module.css";
import { Button, ConfigProvider } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
import useNavigation from "@/hooks/useNavigation";

// Move CSS outside component to prevent re-creation on every render
const linearGradientButton = css`
  &.ant-btn-primary:not([disabled]):not(.ant-btn-dangerous) {
    border-width: 0;

    > span {
      position: relative;
    }

    &::before {
      content: "";
      background: linear-gradient(135deg, #ee0979, #ff6a00);
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

const HomeApplication = memo(() => {
  const { navigateWithMenu } = useNavigation();
  
  // Use direct function call without useCallback to avoid dependency issues
  const handleViewAllClick = () => {
    navigateWithMenu("/DownloadApp", "ดาวน์โหลดแอปพลิเคชั่น");
  };

  return (
    <div className={styles.ApplicationHome}>
      <div className={styles.inputGroup}>
        <div className="col-lg-8">
          <h3 className={styles.centeredText}>
            Download Application &ldquo;Doh Saving&rdquo; กันเถอะ
          </h3>
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
                    fontSize: "1.1rem",
  
                  }}
                  type="primary"
                  size="large"
                  onClick={handleViewAllClick}
                  icon={<AntDesignOutlined />}
                >
                  ดาวน์โหลดแอปพลิเคชั่น
                </Button>
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
});

HomeApplication.displayName = 'HomeApplication';

export default HomeApplication;
