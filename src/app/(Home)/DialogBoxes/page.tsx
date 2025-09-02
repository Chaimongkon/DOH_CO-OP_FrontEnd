"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, ConfigProvider, Modal } from "antd";
import Link from "next/link";
import { createStyles, useTheme } from "antd-style";
import { CloseCircleOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
import Image from "next/image";
import logger from "@/lib/logger";
import { SectionLoading } from "@/components/loading";
import { useApiConfig } from "@/hooks/useApiConfig";
import { DialogBoxApiResponse } from "@/types/home";

interface DialogBoxData {
  id: number;
  imagePath: string;
  url: string;
  isActive: boolean;
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
  const [dialogBoxes, setDialogBoxes] = useState<DialogBoxData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { styles } = useStyle();
  const { API, URLFile } = useApiConfig();
  const token = useTheme();
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const linearGradientButton = css`
    &.${rootPrefixCls}-btn-primary:not([disabled]):not(
        .${rootPrefixCls}-btn-dangerous
      ) {
      border-width: 0;
      background: linear-gradient(135deg, #f69988, #f36c60);
      transition: background 0.3s;
      position: relative;
      overflow: hidden;

      > span {
        position: relative;
      }

      &:hover {
        background: linear-gradient(
          135deg,
          #e51c23,
          #e84e40
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
      padding: "10px 10px", 
    },
  };
  const fetchDialogBoxes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API}/DialogBoxs`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const apiResponse = await response.json();
      
      // Extract data array from response
      const data = apiResponse.data || apiResponse || [];

      // Process the dialog box data - only active ones
      const activeDialogBoxes: DialogBoxData[] = data
        .filter((notify: DialogBoxApiResponse) => notify.IsActive && notify.ImagePath)
        .map((notify: DialogBoxApiResponse) => ({
          id: notify.Id,
          imagePath: `${URLFile}${notify.ImagePath}`,
          url: notify.URLLink || '#',
          isActive: notify.IsActive,
        }));

      setDialogBoxes(activeDialogBoxes);

      // Show modal if there are active dialog boxes
      if (activeDialogBoxes.length > 0) {
        setIsModalOpen(true);
      }
    } catch (error) {
      logger.error("Failed to fetch DialogBoxes data:", error);
      setDialogBoxes([]);
    } finally {
      setIsLoading(false);
    }
  }, [API, URLFile]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchDialogBoxes();
  }, [fetchDialogBoxes]);

  // All dialog boxes are already filtered to active ones

  // Show loading state while fetching data
  if (isLoading) {
    return <SectionLoading tip="Loading dialog boxes..." />;
  }

  return (
    <>
      <Modal
        title=""
        open={isModalOpen}
        onOk={closeModal}
        onCancel={closeModal}
        destroyOnClose
        classNames={classNames}
        styles={modalStyles}
        width={700}
        footer={() => (
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
                onClick={closeModal}
              >
                ปิด
              </Button>
            </ConfigProvider>
          </center>
        )}
      >
        {dialogBoxes.map((dialogBox) => (
          <div key={dialogBox.id} style={{ marginBottom: '16px' }}>
            <Link href={dialogBox.url} target={dialogBox.url !== '#' ? '_blank' : '_self'}>
              <Image
                src={dialogBox.imagePath}
                alt={`Dialog Box ${dialogBox.id}`}
                width={700}
                height={400}
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                priority={dialogBox.id === dialogBoxes[0]?.id}
              />
            </Link>
          </div>
        ))}
      </Modal>
      {/* Only render when there are dialog boxes to show */}
      {dialogBoxes.length === 0 && (
        <ConfigProvider
          modal={{
            classNames,
            styles: modalStyles,
          }}
        />
      )}
    </>
  );
};

export default DialogBoxes;
