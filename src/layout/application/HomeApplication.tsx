
import React, { useContext } from "react";
import styles from "./HomeApp.module.css";
import Link from "next/link";
import { Button, ConfigProvider, Space } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
import { useRouter } from "next/navigation";

const HomeApplication = () => {
  const router = useRouter();
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
  const handleViewAllClick = () => {
    localStorage.setItem("menuName", "ดาวน์โหลดแอปพลิเคชั่น");
    router.push("/DownloadApp");
  };

  return (
    <div className={styles.ApplicationHome}>
      <div className={styles.inputGroup}>
        <div className="col-lg-8">
          <h3 className={styles.centeredText}>
            Download Application "Doh Saving" กันเถอะ
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
};

export default HomeApplication;
