import React, { useState } from "react";
import "./OTPModal.scss";
import { Button, Input, Modal } from "antd";

interface IOTPModal {
  open?: boolean;
  onCancel?: () => void;
  companyDetail?: any;
}

const OTPModal: React.FC<IOTPModal> = ({ open, onCancel, companyDetail }) => {
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
      <div className="title">Mobile Phone Verification</div>
      <div className="description">
        Click the button below to receive your 4-digit verification code. Once
        received, enter the code to securely sign your contract.
        <div className="phone-number">{companyDetail?.phone}</div>
      </div>
      {isOTPSent ? (
        <Button
          type="primary"
          className="send-otp-button"
          onClick={() => setIsOTPSent(true)}
        >
          Send SMS
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
            Didn't receive the code?
            <Button type="link" className="resend-button" onClick={() => {}}>
              Resend
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default OTPModal;
