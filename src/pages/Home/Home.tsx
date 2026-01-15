import React, { useEffect, useRef, useState } from "react";
import "./Home.scss";
import {
  Badge,
  Button,
  Dropdown,
  Modal,
  Popover,
  Progress,
  Select,
  Spin,
  Tabs,
  Typography,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import logoImage from "../../assets/logo.png";
import { useTranslation } from "react-i18next";
import { Notifications } from "@mui/icons-material";
import { languagesList } from "../../utils/Languages";
import { usePusher } from "../../contexts/PusherContext";
import { vendorAPI } from "../../services/vendorAPI";
import Helpers from "../../utils/Helpers";
import CompanyDetail from "../../containers/CompanyDetail/CompanyDetail";
import DocumentUpload from "../../containers/DocumentUpload/DocumentUpload";
import { contractAPI } from "../../services/contractAPI";
import { Cookies } from "react-cookie";
import Pusher from "pusher-js";
import ContractSignature from "../../containers/ContractSignature/ContractSignature";
import NotiItem from "../NotiItem/NotiItem";
import { documentAPI } from "../../services/documentAPI";

interface DocumentWithType {
  type_id: number;
  title: string;
  country_id: number;
  document: Document | null;
  issued_by: string;
  how_to_obtain: string;
  appearance: string;
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

interface IHome {}

const Home: React.FC<IHome> = () => {
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("onboardingStep");
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [vendor, setVendor] = useState<any>(null);

  const [companyDetailForm, setCompanyDetailForm] = useState<any>({
    onboardingStatus: "",
    pmName: "",
    updateDate: "",
    companyName: "",
    country: "",
    legalFormId: null,
    taxId: "",
    street: "",
    houseNumber: "",
    apartmentNumber: "",
    zipCode: "",
    city: "",
    website: "",
    trades: [],
    region: "3",
    postalCode: [],
    selectedRegions: [],
    firstName: "",
    lastName: "",
    phone: "",
    selectedPositionId: null,
    selectedPosition: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const [notiItems, setNotiItems] = useState<any>([]);
  const { message, playNoti } = usePusher();
  const [isOpenNotiDropdown, setIsOpenNotiDropdown] = useState(false);
  const [isLoadingVendorId, setIsLoadingVendorId] = useState<boolean>(false);
  const [vendorIdError, setVendorIdError] = useState<string | null>(null);
  const [vendorDocuments, setVendorDocuments] = useState<Array<Document>>([]);
  const [documentTypes, setDocumentTypes] = useState<Array<any>>([]);

  const [contracts, setContracts] = useState<any[]>([]);
  const [isStepAvailable, setIsStepAvailable] = useState<boolean>(true);

  const { t, i18n } = useTranslation();
  const updateStep = (step: number) => {
    setStep(step);
    localStorage.setItem("onboardingStep", step.toString());
  };
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    const fetchVendorIdByEmail = async () => {
      setIsLoadingVendorId(true);
      setVendorIdError(null);

      try {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const userEmail =
          urlSearchParams.get("userEmail") ||
          localStorage?.getItem("userEmail");

        if (!userEmail) {
          throw new Error("User email not found");
        }

        const response = await vendorAPI.getVendorByContactEmail(userEmail);
        setVendor(response.data.data);
        localStorage.setItem(
          "onboardingStep",
          response.data.data.onboarding_status_id === 1 ||
            response.data.data.onboarding_status_id === 3
            ? "1"
            : response.data.data.onboarding_status_id === 2 ||
              response.data.data.onboarding_status_id === 4 ||
              response.data.data.onboarding_status_id === 5 ||
              response.data.data.onboarding_status_id === 6 ||
              response.data.data.onboarding_status_id === 7
            ? "2"
            : "3"
        );
        setCompanyDetailForm({
          onboardingStatus:
            response.data.data.onboarding_transaction?.stage_1
              ?.status_description || "",
          pmName:
            response.data.data.onboarding_transaction?.stage_1?.pm_name || "",
          updateDate: new Date(
            response.data.data.onboarding_transaction?.stage_1?.created_at || ""
          ).toLocaleDateString(),
          companyName: response.data.data.company_name || "",
          country: response.data.data.country_id || "",
          legalFormId: response.data.data.legal_form_id || null,
          taxId: response.data.data.tax_id || "",
          street: response.data.data.street || "",
          houseNumber: response.data.data.house_number || "",
          apartmentNumber: response.data.data.apartment_number || "",
          zipCode: response.data.data.zip_code || "",
          city: response.data.data.city || "",
          website: response.data.data.website_url || "",
          trades:
            response.data.data.gewerks?.map((gewerk: any) => ({
              trade: gewerk.name,
              count: gewerk.employee_number,
              gesys_gewerk_id: gewerk.gewerk_id,
            })) || [],
          region:
            response.data.data.cover_region === "NationalWide"
              ? "3"
              : response.data.data.cover_region === "States"
              ? "2"
              : "1",
          postalCode:
            response.data.data.postcodes?.map((item: any) => ({
              code: item.postcode,
              radius: item.radius,
            })) || [],
          selectedRegions: response.data.data.federal_state_ids,
          firstName: response.data.data.contact_user?.first_name || "",
          lastName: response.data.data.contact_user?.last_name || "",
          email: response.data.data.contact_user?.email || "",
          phone: response.data.data.contact_user?.phone_number || "",
          selectedPositionId:
            response.data.data.contact_user?.position?.position_id || null,
          selectedPosition:
            response.data.data.contact_user?.position?.title || "",
        });
      } catch (error: any) {
        setVendorIdError(
          error.response?.data?.message || "Failed to fetch vendor data"
        );
      } finally {
        setIsLoadingVendorId(false);
      }
    };

    if (!vendor) {
      fetchVendorIdByEmail();
    }
  }, []);

  useEffect(() => {
    const fetchVendorContracts = async () => {
      if (!vendor?.vendor_id) return;

      try {
        const response = await contractAPI.getContracts(vendor?.vendor_id);
        if (response.data.data) {
          setContracts(response.data.data);
        }
      } catch (error) {
        Helpers.notification.error("Failed to load contracts.");
      }
    };

    fetchVendorContracts();
  }, []);

  useEffect(() => {
    if (!vendor?.vendor_id) return;

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
  }, [vendor?.vendor_id]);

  const handleRedirect = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      const response = await contractAPI.refreshToken();
      const cookies = new Cookies();
      cookies.set("atk", response.data.data.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        //secure: true,
        sameSite: "strict",
      });
      cookies.set("rtk", response.data.data.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        //secure: true,
        sameSite: "strict",
      });

      localStorage.setItem("accessToken", response.data.data.access_token);
      localStorage.setItem("refreshToken", response.data.data.refresh_token);
      updateStep(1);
      window.location.href =
        `${import.meta.env.VITE_REACT_APP_REDIRECT_URL}/redirect?access=` +
        response.data.data.access_token +
        "&refresh=" +
        response.data.data.refresh_token;
    } catch (error) {
      Helpers.notification.error("Failed to refresh token.");
    }
  };

  useEffect(() => {
    if (contracts.length === 0) return;
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(
        import.meta.env.VITE_REACT_APP_PUSHER_KEY!,
        {
          cluster: import.meta.env.VITE_REACT_APP_PUSHER_CLUSTER!,
          // authEndpoint: process.env.REACT_APP_HAY2U_ENDPOINT + "/auth/pusher",
        }
      );
    }

    const pusher = pusherRef.current;
    const userChannel = pusher.subscribe("PRIVATE-MONTAGO");

    userChannel.bind(
      `vendor-${vendor?.vendor_id}-contract-${contracts[0].contract_id}`,
      (data: any) => {
        setContracts((prevContracts) =>
          prevContracts.map((contract) =>
            contract.contract_id === data.contract_id
              ? {
                  ...contract,
                  events: [
                    {
                      ...data,
                    },
                    ...contract.events,
                  ],
                }
              : contract
          )
        );
      }
    );

    if (
      contracts.every((item: any) => {
        const events = item.events;
        return (
          events && events.length > 0 && events[0]?.event_type === "Completed"
        );
      })
    ) {
      updateStep(1);
      handleRedirect();
    }
  }, [contracts]);

  useEffect(() => {
    if (message) {
      if (message?.events) {
        setContracts((prevContracts) =>
          prevContracts.map((contract) =>
            contract.submission_id === message.events[0].submission_id
              ? {
                  ...contract,
                  events: [...message.events, ...contract.events],
                }
              : contract
          )
        );
      }
      if (message?.embed_links) {
        setContracts(
          message.embed_links.map((c: any) => ({
            ...c,
            events: c.events ?? [],
            created_at: c.created_at ?? new Date().toISOString(),
          }))
        );
        updateStep(3);
      } else if (message?.detail?.description) {
        updateStep(1);
        // setOnboardingStatus(message?.detail?.description);
        // setPmName(
        //   message?.detail?.updated_by?.first_name +
        //     " " +
        //     message?.detail?.updated_by?.last_name
        // );
        // setUpdateDate(
        //   new Date(message?.detail?.updated_by?.created_at).toLocaleDateString()
        // );
        setCompanyDetailForm((prev: any) => ({
          ...prev,
          onboardingStatus: message?.detail?.description,
          pmName:
            message?.detail?.updated_by?.first_name +
            " " +
            message?.detail?.updated_by?.last_name,
          updateDate: new Date(
            message?.detail?.updated_by?.created_at
          ).toLocaleDateString(),
        }));
      }
      if (message.changes) {
        message.changes.forEach((change: any) => {
          if (change?.field === "trades") {
            setCompanyDetailForm((prev: any) => {
              let updatedTrades = [...prev.trades];
              const added = change.added || [];
              const removed = change.removed || [];
              const updated = change.updated || [];
              if (removed.length > 0) {
                updatedTrades = updatedTrades.filter(
                  (trade: any) =>
                    !removed.some(
                      (r: any) => r.gewerk_id === trade.gesys_gewerk_id
                    )
                );
              }
              if (added.length > 0) {
                added.forEach((a: any) => {
                  updatedTrades.push({
                    trade:
                      documentTypes.find((t) => t.type_id === a.gewerk_id)
                        ?.title || "",
                    count: a.employee_number,
                    gesys_gewerk_id: a.gewerk_id,
                  });
                });
              }
              if (updated.length > 0) {
                updated.forEach((u: any) => {
                  const index = updatedTrades.findIndex(
                    (trade: any) => trade.gesys_gewerk_id === u.gewerk_id
                  );
                  if (index !== -1) {
                    updatedTrades[index] = {
                      ...updatedTrades[index],
                      count: u.new_employee_number,
                      gesys_gewerk_id: u.gewerk_id,
                    };
                  }
                });
              }
              return {
                ...prev,
                trades: updatedTrades,
              };
            });
            // setTrades((prev) => {
            //   let updatedTrades = [...prev];

            //   const added = change.added || [];
            //   const removed = change.removed || [];
            //   const updated = change.updated || [];

            //   if (removed.length > 0) {
            //     updatedTrades = updatedTrades.filter(
            //       (trade) =>
            //         !removed.some(
            //           (r: any) => r.gewerk_id === trade.gesys_gewerk_id
            //         )
            //     );
            //   }

            //   if (added.length > 0) {
            //     added.forEach((a: any) => {
            //       updatedTrades.push({
            //         trade:
            //           tradeOptions.find(
            //             (t) => t.gesys_gewerk_id === a.gewerk_id
            //           )?.gewerk_name || "",
            //         count: a.employee_number,
            //         gesys_gewerk_id: a.gewerk_id,
            //       });
            //     });
            //   }

            //   if (updated.length > 0) {
            //     updated.forEach((u: any) => {
            //       const index = updatedTrades.findIndex(
            //         (trade) => trade.gesys_gewerk_id === u.gewerk_id
            //       );
            //       if (index !== -1) {
            //         updatedTrades[index] = {
            //           ...updatedTrades[index],
            //           count: u.new_employee_number,
            //           gesys_gewerk_id: u.gewerk_id,
            //         };
            //       }
            //     });
            //   }

            //   return updatedTrades;
            // });
          }
        });
      }

      playNoti();
      const newMessageItem = {
        key: Math.random(),
        label: (
          <NotiItem message={message.events ? message.events[0] : message} />
        ),
      };
      setNotiItems((prev: any) => [newMessageItem, ...prev!]);
    }
  }, [message]);

  const handleFormSubmit = async () => {
    if (!vendor?.vendor_id) {
      Helpers.notification.error("Vendor ID is missing");
      return;
    }

    if (!companyDetailForm.country) {
      Helpers.notification.error("Please select a country");
      return;
    }

    if (!companyDetailForm.companyName) {
      Helpers.notification.error("Please enter a company name");
      return;
    }

    if (!companyDetailForm.legalFormId) {
      Helpers.notification.error("Please select a legal form");
      return;
    }

    if (!companyDetailForm.taxId) {
      Helpers.notification.error("Please enter a tax ID");
      return;
    }

    if (
      !companyDetailForm.street ||
      !companyDetailForm.houseNumber ||
      !companyDetailForm.zipCode ||
      !companyDetailForm.city
    ) {
      Helpers.notification.error("Please fill in the complete address");
      return;
    }

    if (
      companyDetailForm.country === "Poland" &&
      !companyDetailForm.apartmentNumber
    ) {
      Helpers.notification.error("Please add an apartment number");
      return;
    }

    if (!companyDetailForm.trades || companyDetailForm.trades[0].trade === "") {
      Helpers.notification.error("Please add at least one trade");
      return;
    }

    if (companyDetailForm.region === "") {
      Helpers.notification.error("Please select a cover region");
      return;
    }

    if (
      companyDetailForm.region === "2" &&
      companyDetailForm.selectedRegions.length === 0
    ) {
      Helpers.notification.error("Please select at least one federal state");
      return;
    }

    if (
      companyDetailForm.region === "1" &&
      companyDetailForm.postalCode.length === 0
    ) {
      Helpers.notification.error("Please add at least one postal code");
      return;
    }

    if (
      !companyDetailForm.firstName ||
      !companyDetailForm.lastName ||
      !companyDetailForm.phone
    ) {
      Helpers.notification.error("Please fill in all contact details");
      return;
    }

    if (!companyDetailForm.selectedPosition) {
      Helpers.notification.error("Please select a position");
      return;
    }

    const hasEmptyTradeCount = companyDetailForm.trades.some(
      (trade) =>
        trade.count === null ||
        trade.count === undefined ||
        trade.count === "" ||
        trade.count === "0"
    );

    if (hasEmptyTradeCount) {
      Helpers.notification.error("Please enter employee count for all trades");
      return;
    }

    const userRequestBody = {
      first_name: companyDetailForm.firstName,
      last_name: companyDetailForm.lastName,
      phone_number: companyDetailForm.phone,
      email: vendor.contact_user?.email || "",
      representative_position_id: companyDetailForm.selectedPositionId,
    };

    try {
      await vendorAPI.updateUser(userRequestBody);
    } catch (error: any) {
      Helpers.notification.error(
        error.response?.data?.message || t("updateFailed")
      );
      return;
    }

    const vendorRequestBody = {
      company_name: companyDetailForm.companyName,
      street: companyDetailForm.street,
      zip_code: companyDetailForm.zipCode,
      federal_state_ids: companyDetailForm.selectedRegions,
      tax_id: companyDetailForm.taxId || "",
      trades: companyDetailForm.trades.map((trade: any) => ({
        gewerk_id: trade.gesys_gewerk_id,
        employee_number: trade.count,
      })),
      legal_form_id: companyDetailForm.legalFormId || "null",
      house_number: companyDetailForm.houseNumber,
      apartment_number: companyDetailForm.apartmentNumber || "",
      city: companyDetailForm.city,
      country_id: companyDetailForm.country,
      website_url: companyDetailForm.website || "",
      cover_region:
        companyDetailForm.region === "3"
          ? "NationalWide"
          : companyDetailForm.region === "2"
          ? "States"
          : "PostCode",
      postcodes: companyDetailForm.postalCode.map((item) => ({
        postcode: item.code,
        radius: item.radius,
      })),
    };

    try {
      await vendorAPI.updateVendor(vendor.vendor_id, vendorRequestBody);
      Helpers.notification.success("Updated successfully");
      setIsEditing(false);
      updateStep(2);
    } catch (error: any) {
      Helpers.notification.error(
        error.response?.data?.message || t("updateFailed")
      );
    }
  };

  return (
    <div className="Home">
      {/* <Modal
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div>
          <Typography id="modal-modal-title">{t("infoNotSaved")}</Typography>
          <Typography id="modal-modal-description">
            {t("warningMessage")}
          </Typography>
          <div>
            <Button variant="outlined" onClick={() => setIsOpenModal(false)}>
              {t("close")}
            </Button>
            <Button
              onClick={() => {
                updateStep(2);
                handleCancel();
                setIsOpenModal(false);
              }}
            >
              {t("continue")}
            </Button>
          </div>
        </div>
      </Modal> */}
      <div className="header-container">
        <div className="header">
          <div className="logo">
            <img
              src={logoImage}
              alt="Galvanek Logo"
              style={{
                height: "40px",
                width: "auto",
                display: "block",
              }}
            />
          </div>

          <div className="actions">
            <div className="language-box">
              <Select
                value={i18n.language || "en"}
                onChange={(e) => i18n.changeLanguage(e)}
                className="select-language"
                options={languagesList.map((item) => {
                  return {
                    value: item.value,
                    label: (
                      <div className="label-group d-flex gap-1 align-items-center">
                        <img
                          width="22"
                          height="22"
                          src={item.icon}
                          alt="icon"
                        />
                        {t(item.label)}
                      </div>
                    ),
                  };
                })}
              ></Select>
            </div>
            <Dropdown
              menu={{ items: notiItems }}
              trigger={["click"]}
              placement="bottomRight"
              open={isOpenNotiDropdown}
              overlayClassName="noti-dropdown"
              overlayStyle={{ width: 300 }}
              onOpenChange={(isOpen) => {
                setIsOpenNotiDropdown(isOpen);
              }}
            >
              <Badge dot={notiItems.length > 0}>
                <Button
                  icon={<BellOutlined style={{ fontSize: "16px" }} />}
                  variant="link"
                  color="default"
                />
              </Badge>
            </Dropdown>
          </div>
        </div>
        <div className="welcome-section">
          <div className="welcome-message">{t("welcome")}</div>
          {vendor?.company_name && <div>{vendor?.company_name}</div>}
        </div>
      </div>
      <Progress
        percent={(100 / 3) * step}
        showInfo={false}
        strokeColor="#FF6933"
        className="onboarding-progress"
      />
      <div className="step-text">
        {t("step")} {step}/3: {t("step1")}
      </div>
      <Tabs
        activeKey={step.toString()}
        onChange={(key) => {
          setStep(Number(key));
        }}
        tabBarExtraContent={
          <Button
            htmlType="button"
            className="save-btn"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleFormSubmit();
            }}
            disabled={!isEditing}
          >
            Save
          </Button>
        }
        items={[
          {
            key: "1",
            label: t("step1"),
          },
          {
            key: "2",
            label: t("step2"),
            disabled: vendor?.onboarding_status_id === 1,
          },
          {
            key: "3",
            label: t("step3"),
            disabled: !isStepAvailable || vendor?.onboarding_status_id < 7,
          },
        ]}
        className="onboarding-tabs"
      />{" "}
      <div className="tab-content">
        {step === 1 && (
          <CompanyDetail
            vendor={vendor}
            companyDetailForm={companyDetailForm}
            setCompanyDetailForm={setCompanyDetailForm}
            setIsEditing={setIsEditing}
            setNotiItems={setNotiItems}
          />
        )}
        {step === 2 && (
          <DocumentUpload
            documentTypes={documentTypes}
            setDocumentTypes={setDocumentTypes}
            vendorDocuments={vendorDocuments}
            setVendorDocuments={setVendorDocuments}
            vendor={vendor}
            setNotiItems={setNotiItems}
            updateStep={updateStep}
            setIsStepAvailable={setIsStepAvailable}
          />
        )}
        {step === 3 && <ContractSignature contracts={contracts} />}
      </div>
    </div>
  );
};

export default Home;
