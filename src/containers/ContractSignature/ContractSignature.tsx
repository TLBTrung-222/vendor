import React from "react";
import "./ContractSignature.scss";
import { Alert, Col, Row } from "antd";
import { useTranslation } from "react-i18next";
import ContractCard from "../../components/ContractCard/ContractCard";

interface IContractSignature {
  contracts: any[];
}

const ContractSignature: React.FC<IContractSignature> = ({ contracts }) => {
  const { t } = useTranslation();
  return (
    <div className="ContractSignature">
      <div>
        {/* {contracts.length > 0 &&
        contracts.every(
          (contract) =>
            contract.events && contract.events[0]?.event_type === "Completed"
        ) ? (
          <Alert
            type="success"
            style={{
              marginBottom: 16,
              borderRadius: 4,
              color: "text.primary",
            }}
            message={t("successMessage")}
            description={t("readyForOnboarding")}
          />
        ) : (
          <Alert
            type="info"
            style={{
              marginBottom: 16,
              borderRadius: 4,
              backgroundColor: "#FFF3E0",
              color: "text.primary",
              border: "1px solid #FFE0B2",
            }}
            message={t("waitingForContracts")}
            description={t("reviewMessage")}
          />
        )} */}

        <Row gutter={[16, 16]}>
          {contracts?.map((contract) => (
            <Col span={24} key={contract.contract_id}>
              <ContractCard contract={contract} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ContractSignature;
