import React, { useState } from "react";
import "./OTPModal.scss";
import { Button, Input, Modal } from "antd";
import { useUser } from "../../contexts/UserContext";

interface IOTPModal {
  open?: boolean;
  onCancel?: () => void;
  companyDetail?: any;
}

const OTPModal: React.FC<IOTPModal> = ({ open, onCancel, companyDetail }) => {
  const { getTranslation: t } = useUser();
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [otp, setOtp] = useState("");
  return (
    <Modal
      className="OTPModal"
      open={open}
      onCancel={onCancel}
      //   closable={false}
      //   maskClosable={false}
      //   keyboard={false}
      footer={null}
      width="30%"
      centered
    >
      <div className="title">{t(1002)}</div>
      <div className="description">
        {t(1003)}
        <div className="phone-number">{companyDetail?.phone}</div>
      </div>
      {!isOTPSent ? (
        <Button
          type="primary"
          className="send-otp-button"
          onClick={() => setIsOTPSent(true)}
        >
          {t(1004)}
        </Button>
      ) : (
        <>
          <Input.OTP
            className="otp-input"
            length={4}
            onChange={(value) => setOtp(value)}
            value={otp}
          />
          <div className="note">
            {t(1013)}
            <Button type="link" className="resend-button" onClick={() => {}}>
              {t(1014)}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default OTPModal;
