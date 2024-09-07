"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, ConfigProvider, Modal, Space } from "antd";
import Link from "next/link";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
import { createStyles, useTheme } from "antd-style";
import { CloseCircleOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";

interface Notifi {
  id: number;
  image: string;
  url: string;
  status: boolean;
}
const useStyle = createStyles(({ token }) => ({
  "my-modal-body": {
    background: token.blue1,
    padding: token.paddingSM,
  },
  "my-modal-mask": {
    boxShadow: `inset 0 0 0px #fff`,
  },
  "my-modal-header": {
    borderBottom: `1px dotted ${token.colorPrimary}`,
  },
  "my-modal-footer": {
    color: token.colorPrimary,
  },
  "my-modal-content": {
    border: "1px solid #333",
  },
}));

const DialogBoxes: React.FC = () => {
  const [notifi, setNotifi] = useState<Notifi[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { styles } = useStyle();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = useTheme();
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const linearGradientButton = css`
  &.${rootPrefixCls}-btn-primary:not([disabled]):not(
    .${rootPrefixCls}-btn-dangerous
  ) {
  border-width: 0;
  background: linear-gradient(135deg, #1D976C, #93F9B9);
  transition: background 0.3s;
  position: relative;
  overflow: hidden;

  > span {
    position: relative;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      #1A2980,
      #26D0CE
    ); /* Change to your desired hover gradient */
  }
}
`;
  const classNames = {
    body: styles["my-modal-body"],
    mask: styles["my-modal-mask"],
    header: styles["my-modal-header"],
    content: styles["my-modal-content"],
  };
  const modalStyles = {
    header: {
      borderLeft: `5px solid ${token.colorPrimary}`,
      borderRadius: 0,
      paddingInlineStart: 5,
    },
    body: {
      boxShadow: "inset 0 0 5px #999",
      borderRadius: 5,
    },
    mask: {
      backdropFilter: "blur(2px)",
    },
    content: {
      boxShadow: "0 0 30px #999",
    },
  };
  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`${API}/DialogBoxs`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Assuming the image data is base64 encoded
      const processedData: Notifi[] = data.map((notify: any) => ({
        id: notify.Id,
        image: base64ToBlobUrl(notify.Image,"image/webp"),
        url: notify.URLLink,
        status: notify.IsActive,
      }));

      setNotifi(processedData);

      // Check for active notifications
      const hasActiveNotifications = processedData.some(
        (notify) => notify.status
      );
      if (hasActiveNotifications) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }, [API]);

  const showModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const dialog = notifi.filter((notify) => notify.status);

  return (
    <>
      <Modal
        title=""
        open={isModalOpen}
        onOk={showModal}
        onCancel={showModal}
        classNames={classNames}
        styles={modalStyles}
        width={700}
        footer={(_) => (
          <center>
            <ConfigProvider
              button={{
                className: linearGradientButton,
              }}
            >
              <Button
                type="primary"
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={showModal}
              >
                ปิด
              </Button>
            </ConfigProvider>
          </center>
        )}
      >
        {dialog.map((dialog) => (
          <div key={dialog.id}>
            <Link href={dialog.url}>
              <img
                className="img-fluid"
                src={dialog.image}
                alt="Notification Image"
              />
            </Link>
          </div>
        ))}
      </Modal>
      <ConfigProvider
        modal={{
          classNames,
          styles: modalStyles,
        }}
      ></ConfigProvider>
    </>
  );
};

export default DialogBoxes;
