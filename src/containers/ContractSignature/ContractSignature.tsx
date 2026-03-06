import React, { useEffect, useState } from "react";
import "./ContractSignature.scss";
import { Alert, Col, Row } from "antd";
import ContractCard from "../../components/ContractCard/ContractCard";
import OTPModal from "../../components/OTPModal/OTPModal";
import { useUser } from "../../contexts/UserContext";

interface IContractSignature {
  contracts: any[];
  companyDetail?: any;
}

const ContractSignature: React.FC<IContractSignature> = ({
  contracts,
  companyDetail,
}) => {
  const { getTranslation: t } = useUser();
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(
    localStorage.getItem("isOTPVerified") !== "true" ||
      !localStorage.getItem("isOTPVerified"),
  );

  return (
    <div className="ContractSignature">
      <div>
        <Row gutter={[16, 16]}>
          {contracts?.map((contract) => (
            <Col span={24} key={contract.submission_id}>
              <ContractCard contract={contract} />
            </Col>
          ))}
        </Row>
      </div>
      <OTPModal
        open={isOTPModalOpen}
        onCancel={() => setIsOTPModalOpen(false)}
        companyDetail={companyDetail}
        contracts={contracts}
      />
    </div>
  );
};

export default ContractSignature;
