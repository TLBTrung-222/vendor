import React from "react";
import "./ContractSignature.scss";
import { Alert, Col, Row } from "antd";
import { useTranslation } from "react-i18next";
import ContractCard from "../../components/ContractCard/ContractCard";
import OTPModal from "../../components/OTPModal/OTPModal";

interface IContractSignature {
  contracts: any[];
  companyDetail?: any;
}

const ContractSignature: React.FC<IContractSignature> = ({ contracts, companyDetail }) => {
  const { t } = useTranslation();
  const [isOTPModalOpen, setIsOTPModalOpen] = React.useState(true);

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
      />
    </div>
  );
};

export default ContractSignature;
