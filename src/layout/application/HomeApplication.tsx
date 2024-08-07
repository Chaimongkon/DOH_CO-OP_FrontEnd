
import React, { useContext } from "react";
import styles from "./HomeApp.module.css";
import Link from "next/link";
import { Button, ConfigProvider, Space } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";

const HomeApplication = () => {
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
        opacity: 0;
      }
    }
  `;
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
              <Link href="/MobileApp">
                <Button
                  style={{
                    fontFamily: "DOHCOOP",
                    fontSize: "1.1rem",
  
                  }}
                  type="primary"
                  size="large"
                  icon={<AntDesignOutlined />}
                >
                  ดาวน์โหลดแอปพลิเคชั่น
                </Button>
              </Link>
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
};

export default HomeApplication;
