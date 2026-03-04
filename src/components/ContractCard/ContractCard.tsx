import React from "react";
import "./ContractCard.scss";
import Helpers from "../../utils/Helpers";
import { Button, Progress } from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useUser } from "../../contexts/UserContext";

interface IContractCard {
  contract: any;
}

const ContractCard: React.FC<IContractCard> = ({ contract }) => {
  const { getTranslation: t } = useUser();

  // Calculate progress value
  let progressValue = 33;

  const { title, events, created_at } = contract;
  let isCompleted = false;
  let isViewed = false;

  if (events && events.length > 0) {
    isCompleted =
      events[0]?.event_type === "Completed" ||
      events[0]?.event_type === "SigningSuccess";
    isViewed = events[0]?.event_type === "Viewed";
  }

  if (isViewed) progressValue = 66;
  if (isCompleted) progressValue = 100;

  const sentDate = Helpers.formatDateTime(created_at);
  const viewDate =
    progressValue >= 66
      ? Helpers.formatDateTime(
          events.find((event: any) => event.event_type === "Viewed")
            ?.created_at || "",
        )
      : "";
  const completedDate =
    progressValue === 100
      ? Helpers.formatDateTime(
          events.find(
            (event: any) =>
              event.event_type === "Completed" ||
              event.event_type === "SigningSuccess",
          ).created_at || "",
        )
      : "";

  return (
    <div className="ContractCard">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div
          style={{
            fontWeight: 500,
            color: isCompleted ? "#F57C00" : "#ffc107",
          }}
        >
          {isCompleted ? "completed" : t(187)}
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>{t(1005)}</div>

      <Progress
        percent={progressValue}
        style={{ marginBottom: 16 }}
        strokeColor="#ff6933"
        showInfo={false}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="action-info">
          <MailOutlined style={{ color: "#F57C00", fontSize: "1.25rem" }} />
          <div style={{ fontSize: "0.75rem" }}>
            {t(1006)} {t(1010)} {sentDate}
          </div>
          <Button
            type="link"
            style={{ padding: 0, fontSize: "0.75rem" }}
            onClick={() => {
              window.open(contract.url || contract.document_url, "_blank");
            }}
          >
            {t(1015)}{" "}
            <LinkOutlined style={{ color: "#F57C00", fontSize: "0.75rem" }} />
          </Button>
        </div>

        <div className="action-info">
          <EyeOutlined
            style={{
              color: progressValue >= 66 ? "#F57C00" : "#e0e0e0",
              fontSize: "1.25rem",
            }}
          />
          <div style={{ fontSize: "0.75rem" }}>
            {progressValue >= 66
              ? `${t(1008)} ${t(1010)} ${viewDate}`
              : `${t(1008)}`}
          </div>
        </div>

        <div className="action-info">
          <CheckCircleOutlined
            style={{
              color: progressValue === 100 ? "#F57C00" : "#e0e0e0",
              fontSize: "1.25rem",
            }}
          />
          <div style={{ fontSize: "0.75rem" }}>
            {progressValue == 100
              ? `${t(1009)} ${t(1010)} ${completedDate}`
              : `${t(1009)}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
