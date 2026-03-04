import React, { useEffect, useState } from "react";
import "./OTPModal.scss";
import { Button, Input, Modal } from "antd";
import { useUser } from "../../contexts/UserContext";
import { contractAPI } from "../../services/contractAPI";
import Helpers from "../../utils/Helpers";

interface IOTPModal {
  open?: boolean;
  onCancel?: () => void;
  companyDetail?: any;
  contracts?: any[];
}

const OTPModal: React.FC<IOTPModal> = ({
  open,
  onCancel,
  companyDetail,
  contracts,
}) => {
  const { getTranslation: t } = useUser();
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [otp, setOtp] = useState("");

  const handleSendOTP = async () => {
    try {
      const response = await contractAPI.requestOTP({
        vendor_id: contracts[0]?.vendor_id,
      });
      setIsOTPSent(true);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error("Error requesting OTP:", error);
    }
  };

  useEffect(() => {
    const verifyOTP = async () => {
      if (otp.length === 4) {
        try {
          await contractAPI.verifyOTP({
            session_id: sessionId,
            otp_code: otp,
          });
          onCancel?.();
          Helpers.notification.success("OTP verified successfully!");
        } catch (error) {
          Helpers.notification.error("Invalid OTP. Please try again.");
        }
      }
    };
    verifyOTP();
  }, [otp]);

  return (
    <Modal
      className="OTPModal"
      open={open}
      closable={false}
      maskClosable={false}
      keyboard={false}
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
          onClick={() => handleSendOTP()}
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
            <Button
              type="link"
              className="resend-button"
              onClick={() => {
                setOtp("");
                handleSendOTP();
              }}
            >
              {t(1014)}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default OTPModal;
