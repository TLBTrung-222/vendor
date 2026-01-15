import React, { useEffect, useState } from "react";
import "./DocumentUpload.scss";
import { documentAPI } from "../../services/documentAPI";
import Helpers from "../../utils/Helpers";
import { Col, Row, Spin } from "antd";
import { useTranslation } from "react-i18next";
import DocumentCard from "../../components/DocumentCard/DocumentCard";

interface IDocumentUpload {
  documentTypes: any[];
  setDocumentTypes: (types: any[]) => void;
  vendorDocuments: any[];
  setVendorDocuments: (documents: any[]) => void;
  updateStep?: (step: number) => void;
  vendor: any;
  setNotiItems: (items: any) => void;
  setIsStepAvailable?: (available: boolean) => void;
}

const DocumentUpload: React.FC<IDocumentUpload> = ({
  documentTypes,
  setDocumentTypes,
  vendorDocuments,
  setVendorDocuments,
  updateStep,
  vendor,
  setNotiItems,
  setIsStepAvailable,
}) => {
  const { t } = useTranslation();

  return (
    <div className="DocumentUpload">
      {documentTypes.length === 0 ? (
        <div className="loading-container">
          <Spin />
          <div className="loading-text">{t("loadingRequiredDocuments")}</div>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {documentTypes.map((docType) => (
            <Col span={12} key={docType.type_id}>
              <DocumentCard
                updateStep={updateStep}
                docType={docType}
                vendorDocuments={vendorDocuments}
                setVendorDocuments={setVendorDocuments}
                vendor={vendor}
                documentTypes={documentTypes}
                setDocumentTypes={setDocumentTypes}
                setNotiItems={setNotiItems}
                setIsStepAvailable={setIsStepAvailable}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default DocumentUpload;
