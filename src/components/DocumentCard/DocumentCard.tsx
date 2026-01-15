import React, { useEffect, useState } from "react";
import "./DocumentCard.scss";
import { Alert, Button, Card, Tag, Tooltip, Upload } from "antd";
import { useTranslation } from "react-i18next";
import {
  CloudUploadOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { usePusher } from "../../contexts/PusherContext";
import { InsertDriveFileOutlined } from "@mui/icons-material";
import { documentAPI } from "../../services/documentAPI";
import Helpers from "../../utils/Helpers";
import NotiItem from "../../pages/NotiItem/NotiItem";

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

interface DocumentType {
  type_id: number;
  title: string;
  mandatory: boolean;
  category_id: number;
  issued_by: string;
  how_to_obtain: string;
  appearance: string;
}

interface IDocumentCard {
  updateStep: (step: number) => void;
  docType: DocumentType;
  vendorDocuments: any[];
  setVendorDocuments?: (docs: any) => void;
  vendor: any;
  documentTypes?: any[];
  setDocumentTypes?: (types: any) => void;
  setNotiItems?: (items: any) => void;
  setIsStepAvailable?: (available: boolean) => void;
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

const DocumentCard: React.FC<IDocumentCard> = ({
  updateStep,
  docType,
  vendorDocuments,
  setVendorDocuments,
  vendor,
  documentTypes,
  setDocumentTypes,
  setNotiItems,
  setIsStepAvailable,
}) => {
  const getDocumentForType = (typeId: number) => {
    return vendorDocuments.find((doc: any) => doc.type_id === typeId);
  };
  const getDocumentStatus = () => {
    return documentTypes.every((type) => {
      const doc = getDocumentForType(type.type_id);
      return doc !== undefined && doc.document_status?.title === "Approved";
    });
  };

  useEffect(() => {
    if (getDocumentStatus()) {
      setIsStepAvailable && setIsStepAvailable(true);
    }
  }, []);

  const [uploadSuccess, setUploadSuccess] = useState<Record<number, boolean>>(
    {}
  );
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File>>({});
  const { type_id, title, mandatory, issued_by, how_to_obtain, appearance } =
    docType;
  const document = getDocumentForType(type_id);
  const status = document?.document_status?.title || "Not Uploaded";
  const fileName = document?.name || "";
  const url = document?.url || "";
  const showSuccess = uploadSuccess[type_id] || false;

  const { t } = useTranslation();
  const { message } = usePusher();

  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          bgcolor: "#f1f8e9",
          border: "1px solid #c5e1a5",
          icon: (
            <Tooltip
              title={
                <div
                  style={{
                    width: 150,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="tooltip"
                >
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="issued-by"
                  >
                    <div>{t("IssuedBy")}: </div>
                    <div>{issued_by}</div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="how-to-obtain"
                  >
                    <div>{t("HowToObtain")}: </div>
                    <div
                      style={{ display: "flex", gap: 1 }}
                      className="how-to-obtain"
                    >
                      <div>{how_to_obtain}</div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="appearance"
                  >
                    <div>{t("Appearance")}: </div>
                    <div>{appearance}</div>
                  </div>
                </div>
              }
              placement="bottom"
              arrow
            >
              <QuestionCircleOutlined
                style={{
                  color: "#2563eb",
                  background: "#dbeafe",
                  borderRadius: 50,
                  padding: 0.3,
                }}
              />
            </Tooltip>
          ),
          statusLabel: t("Approved"),
          statusColor: "#2e7d32",
          buttonDisabled: true,
        };
      case "denied":
      case "rejected":
        return {
          bgcolor: "#fff3f3",
          border: "1px solid #ffcdd2",
          icon: (
            <Tooltip
              title={
                <div
                  style={{
                    width: 150,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="tooltip"
                >
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="issued-by"
                  >
                    <div>{t("IssuedBy")}: </div>
                    <div>{issued_by}</div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="how-to-obtain"
                  >
                    <div>{t("HowToObtain")}: </div>
                    <div>{how_to_obtain}</div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="appearance"
                  >
                    <div>{t("Appearance")}: </div>
                    <div>{appearance}</div>
                  </div>
                </div>
              }
              placement="bottom"
              arrow
            >
              <QuestionCircleOutlined
                style={{
                  color: "#2563eb",
                  background: "#dbeafe",
                  borderRadius: 50,
                  padding: 0.3,
                }}
              />
            </Tooltip>
          ),
          statusLabel: t("Denied"),
          statusColor: "#c62828",
          buttonDisabled: false,
        };
      case "pending":
        return {
          bgcolor: "#e3f2fd",
          border: "1px solid #bbdefb",
          icon: (
            <Tooltip
              title={
                <div
                  style={{
                    width: 150,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="tooltip"
                >
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="issued-by"
                  >
                    <div>{t("IssuedBy")}: </div>
                    <div>{issued_by}</div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="how-to-obtain"
                  >
                    <div>{t("HowToObtain")}: </div>
                    <div>{how_to_obtain}</div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="appearance"
                  >
                    <div>{t("Appearance")}: </div>
                    <div>{appearance}</div>
                  </div>
                </div>
              }
              placement="bottom"
              arrow
            >
              <QuestionCircleOutlined
                style={{
                  color: "#2563eb",
                  background: "#dbeafe",
                  borderRadius: 50,
                  padding: 0.3,
                }}
              />
            </Tooltip>
          ),
          statusLabel: t("InReview"),
          statusColor: "#1565c0",
          buttonDisabled: false,
        };
      default:
        return {
          bgcolor: "#f5f5f5",
          border: "1px solid #e0e0e0",
          icon: (
            <Tooltip
              title={
                <div
                  style={{
                    width: 150,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="tooltip"
                >
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="issued-by"
                  >
                    <div>{t("IssuedBy")}: </div>
                    <div>{issued_by}</div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="how-to-obtain"
                  >
                    <div>{t("HowToObtain")}: </div>
                    <div>{how_to_obtain}</div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 1 }}
                    className="appearance"
                  >
                    <div>{t("Appearance")}: </div>
                    <div>{appearance}</div>
                  </div>
                </div>
              }
              placement="bottom"
              arrow
            >
              <QuestionCircleOutlined
                style={{
                  color: "#2563eb",
                  background: "#dbeafe",
                  borderRadius: 50,
                  padding: 0.3,
                }}
              />
            </Tooltip>
          ),
          statusLabel: t("NotUploaded"),
          statusColor: "#757575",
          buttonDisabled: false,
        };
    }
  };

  const styles = getStatusStyles();

  const handleDocumentUpload = async (typeId: number, file: File | null) => {
    if (!vendor?.vendor_id) {
      alert("Vendor ID not available. Please try again later.");
      return;
    }

    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    // Use the file's name directly
    const name = file.name;

    // setUploadingDoc((prev) => ({ ...prev, [typeId]: true }));
    setUploadSuccess((prev) => ({ ...prev, [typeId]: false }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("vendor_id", vendor.vendor_id.toString());
      formData.append("type_id", typeId.toString());
      formData.append("name", name);

      const response = await documentAPI.uploadDocument(formData);
      const updatedDocument = await documentAPI.getDocuments(vendor.vendor_id);

      // Update the vendorDocuments state with the newly uploaded document
      const types: DocumentType[] = updatedDocument.data.data.map(
        (item: DocumentWithType) => {
          return {
            type_id: item.type_id,
            title: item.title,
            mandatory: item.document?.document_types?.mandatory ?? false,
            category_id: item.document?.document_types?.category_id ?? 0,
          };
        }
      );
      setDocumentTypes(types);

      // Extract submitted documents
      const documents: Document[] = updatedDocument.data.data
        .filter((item: DocumentWithType) => item.document !== null)
        .map((item: DocumentWithType) => item.document as Document);
      setVendorDocuments(documents);

      setUploadSuccess((prev) => ({ ...prev, [typeId]: true }));
      Helpers.notification.success("Document uploaded successfully.");
      setTimeout(() => {
        setUploadSuccess((prev) => ({ ...prev, [typeId]: false }));
      }, 3000);
      setSelectedFiles((prev) => ({
        ...prev,
        [typeId]: null,
      }));
    } catch (error) {
      Helpers.notification.error(
        "Failed to upload document. Please try again."
      );
    }
  };

  return (
    <Card
      className="DocumentCard"
      key={message?.detail ? message.detail.document_id : type_id}
      bordered
      style={{
        backgroundColor: styles.bgcolor,
        border: styles.border,
        borderRadius: 16,
        height: "100%",
      }}
    >
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {styles.icon}
            <span
              style={{
                fontWeight: 500,
                color: "#424242",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {title} {mandatory && " *"}
            </span>
          </div>

          <Tag
            style={{
              color: styles.statusColor,
              background: "transparent",
              border: `1px solid ${styles.statusColor}`,
              fontWeight: 500,
            }}
          >
            {styles.statusLabel}
          </Tag>
        </div>

        {/* Existing document */}
        {document && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "8px 0",
              gap: 6,
            }}
          >
            <InsertDriveFileOutlined style={{ color: "#757575" }} />
            <span
              style={{
                fontSize: 12,
                color: "#757575",
                cursor: url ? "pointer" : "default",
                textDecoration: url ? "underline" : "none",
              }}
              onClick={() => url && window.open(url, "_blank")}
              onMouseEnter={(e) => {
                if (url) e.currentTarget.style.color = "#1677ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#757575";
              }}
            >
              {fileName} {url && `(${t("ClickToView")})`}
            </span>
          </div>
        )}

        {/* Rejected description */}
        {document?.description && (
          <Alert
            type="error"
            showIcon={false}
            style={{
              background: "transparent",
              padding: 8,
              marginTop: 8,
            }}
            message={
              <div>
                <div style={{ fontWeight: 500, color: "#c62828" }}>
                  {document.description}
                </div>
                <div style={{ fontSize: 12, color: "#757575", marginTop: 4 }}>
                  {t("RejectedBy")}{" "}
                  <b>
                    {document?.updated_by.first_name +
                      " " +
                      document?.updated_by.last_name || "N/A"}
                  </b>{" "}
                  {t("on")}{" "}
                  <b>
                    {new Date(document?.updated_at || "").toLocaleDateString()}
                  </b>
                </div>
              </div>
            }
          />
        )}

        {/* Upload section */}
        {(status === "Not Uploaded" || status === "Denied") && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 12,
            }}
          >
            <Upload
              accept="application/pdf"
              showUploadList={false}
              beforeUpload={(file) => {
                handleDocumentUpload(type_id, file);
                setSelectedFiles((prev) => ({
                  ...prev,
                  [type_id]: file,
                }));
                return false;
              }}
            >
              <Button
                icon={<CloudUploadOutlined />}
                block
                style={{
                  borderRadius: 8,
                  padding: "8px 12px",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  color: "#424242",
                  borderColor: "#e0e0e0",
                  maxWidth: 304,
                }}
              >
                <span
                  style={{
                    maxWidth: "100%",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                  }}
                >
                  {selectedFiles?.[type_id]?.name || t("selectPDF")}
                </span>
              </Button>
            </Upload>
          </div>
        )}

        {/* Success */}
        {showSuccess && (
          <Alert
            type="success"
            style={{ marginTop: 16 }}
            message={t("successNoti")}
          />
        )}
      </div>
    </Card>
  );
};

export default DocumentCard;
