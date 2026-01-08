import React, { useEffect, useState } from "react";
import "./DocumentUpload.scss";
import { documentAPI } from "../../services/documentAPI";
import Helpers from "../../utils/Helpers";
import { Col, Row, Spin } from "antd";
import { useTranslation } from "react-i18next";
import DocumentCard from "../../components/DocumentCard/DocumentCard";

interface IDocumentUpload {
  updateStep?: (step: number) => void;
  vendor: any;
  setNotiItems: (items: any) => void;
  setIsStepAvailable?: (available: boolean) => void;
}

interface DocumentType {
  type_id: number;
  title: string;
  mandatory: boolean;
  category_id: number;
  issued_by: string;
  how_to_obtain: string;
  appearance: string;
}

interface DocumentStatus {
  title: string;
  status_id: number;
  description: string;
}

interface Document {
  document_id: number;
  type_id: number;
  description: string | null;
  expired_at: string | null;
  vendor_id: number;
  status_id: number;
  name: string;
  url: string;
  document_status: DocumentStatus;
  document_types: DocumentType;
  updated_by: {
    first_name: string | null;
    last_name: string | null;
    user_id: number | null;
  };
  updated_at: string | null;
}

interface DocumentWithType {
  type_id: number;
  title: string;
  country_id: number;
  document: Document | null;
  issued_by: string;
  how_to_obtain: string;
  appearance: string;
}

const DocumentUpload: React.FC<IDocumentUpload> = ({
  updateStep,
  vendor,
  setNotiItems,
  setIsStepAvailable
}) => {
  const [documentTypes, setDocumentTypes] = useState<Array<any>>([]);
  const [vendorDocuments, setVendorDocuments] = useState<Array<Document>>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!vendor.vendor_id) return;

    const fetchVendorDocuments = async () => {
      try {
        const response = await documentAPI.getDocuments(vendor.vendor_id);
        setDocumentTypes(response.data.data);
        const documents: Document[] = response.data.data
          .filter((item: DocumentWithType) => item.document !== null)
          .map((item: DocumentWithType) => item.document as Document);
        setVendorDocuments(documents);
      } catch (error) {
        Helpers.notification.error("Failed to load documents.");
      }
    };

    fetchVendorDocuments();
  }, []);

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
