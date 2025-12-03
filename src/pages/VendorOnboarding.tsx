"use client";

import { useState, useEffect, useRef, use } from "react";
import {
  Box,
  Typography,
  Alert,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  styled,
  LinearProgress,
  Autocomplete,
  type SelectChangeEvent,
  CircularProgress,
  Tooltip,
  Tab,
  Checkbox,
  InputAdornment,
  Slider,
  createFilterOptions,
  Badge,
  IconButton,
  Popover,
  Modal,
  Link,
} from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import AddIcon from "@mui/icons-material/Add";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import logoImage from "../assets/logo.png"; // Import the logo at the top of your file
import HelpIcon from "@mui/icons-material/HelpOutline"; // Types for API responses
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { postcodeList } from "../utils/PostalcodeList.ts";
import { usePusher } from "../contexts/PusherContext.tsx";
import NotiItem from "./NotiItem/NotiItem.tsx";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckIcon from "@mui/icons-material/Check";
import Pusher from "pusher-js";
import { Cookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { languagesList } from "../utils/Languages";
import dayjs from "dayjs";
import Helpers from "../utils/Helpers.tsx";

interface Country {
  country_id: number;
  name: string;
}

interface LegalForm {
  legal_form_id: number;
  title: string;
  description: string;
  country_id: number;
}

interface Trade {
  gesys_gewerk_id: number;
  gewerk_name: string;
}

// Add a new interface for federal states
interface FederalState {
  id: number;
  german_name: string;
  english_name: string;
}

// Add a new interface for representative positions
interface RepresentativePosition {
  position_id: number;
  description: string | null;
  title: string;
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

type PostalCode = {
  code: string;
  label: string;
};

// Styled components
const StepperContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const FormContainer = styled("form")(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const UploadInput = styled("input")({
  display: "none",
});

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
    backgroundColor: "#F57C00",
  },
}));

const StatusIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(0.5),
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

// API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const VITE_REACT_APP_REDIRECT_URL =
  import.meta.env.VITE_REACT_APP_REDIRECT_URL || "http://localhost:3000";

// Modify the component state
export default function VendorOnboardingFlow() {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(i18n.language);
  }, [i18n.language]);
  const { playNoti } = usePusher();
  const { message } = usePusher();
  const [notiItems, setNotiItems] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /* -------------------------------------------------------------------------- */
  /*                        States for uploading document                       */
  /* -------------------------------------------------------------------------- */
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [vendorDocuments, setVendorDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<Record<number, boolean>>({});
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<Record<number, boolean>>(
    {}
  );
  const [selectedFiles, setSelectedFiles] = useState<
    Record<number, File | null>
  >({});

  /* -------------------------------------------------------------------------- */
  /*                           // Form state variables                          */
  /* -------------------------------------------------------------------------- */
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("vendorOnboardingStep");
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  // Create a custom function to update step that also saves to localStorage
  const updateStep = (newStep: number) => {
    setStep(newStep);
    localStorage.setItem("vendorOnboardingStep", newStep.toString());
  };

  /* -------------------------------------------------------------------------- */
  /*                            // Form field states                            */
  /* -------------------------------------------------------------------------- */
  const [isEditing, setIsEditing] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<any>(null);
  const [isInfoUpdated, setIsInfoUpdated] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState("");
  const [pmName, setPmName] = useState("");
  const [updateDate, setUpdateDate] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [region, setRegion] = useState("1");
  const [postalCode, setPostalCode] = useState<
    { code: string; radius: number }[]
  >([]);
  const [newPostalCode, setNewPostalCode] = useState({
    code: "",
    radius: 100,
  });
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);

  /* -------------------------------------------------------------------------- */
  /*                             // API data states                             */
  /* -------------------------------------------------------------------------- */
  const [country, setCountry] = useState("");
  const [countryId, setCountryId] = useState<number | null>(null);
  const [legalForm, setLegalForm] = useState("");
  const [legalFormId, setLegalFormId] = useState<number | null>(null);
  const [trades, setTrades] = useState<
    { trade: string; count: string; gesys_gewerk_id?: number }[]
  >([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
    null
  );

  // API data
  const [countries, setCountries] = useState<Country[]>([]);
  const [legalForms, setLegalForms] = useState<LegalForm[]>([]);
  const [tradeOptions, setTradeOptions] = useState<Trade[]>([]);
  const [federalStates, setFederalStates] = useState<FederalState[]>([]);
  const [positions, setPositions] = useState<RepresentativePosition[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingLegalForms, setLoadingLegalForms] = useState(false);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [loadingFederalStates, setLoadingFederalStates] = useState(false);
  const [loadingVendorDetails, setLoadingVendorDetails] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error states
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [legalFormsError, setLegalFormsError] = useState<string | null>(null);
  const [tradesError, setTradesError] = useState<string | null>(null);
  const [federalStatesError, setFederalStatesError] = useState<string | null>(
    null
  );
  const [vendorDetailsError, setVendorDetailsError] = useState<string | null>(
    null
  );
  const [positionsError, setPositionsError] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [isLoadingVendorId, setIsLoadingVendorId] = useState(false);
  const [vendorIdError, setVendorIdError] = useState<string | null>(null);

  const pusherRef = useRef<Pusher | null>(null);

  /* -------------------------------------------------------------------------- */
  /*                                For screen 2                                */
  /* -------------------------------------------------------------------------- */

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
      `vendor-${vendorId}-contract-${contracts[0].contract_id}`,
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

  const handleRedirect = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      const cookies = new Cookies();
      cookies.set("atk", result.data.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        //secure: true,
        sameSite: "strict",
      });
      cookies.set("rtk", result.data.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        //secure: true,
        sameSite: "strict",
      });

      localStorage.setItem("accessToken", result.data.access_token);
      localStorage.setItem("refreshToken", result.data.refresh_token);
      updateStep(1);
      window.location.href =
        `${VITE_REACT_APP_REDIRECT_URL}/redirect?access=` +
        result.data.access_token +
        "&refresh=" +
        result.data.refresh_token;
    } catch (error) {
      console.error("Error redirecting", error);
    }
  };

  useEffect(() => {
    if (message) {
      console.log(message);
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
          Array.isArray(message.embed_links)
            ? message.embed_links.map((c: any) => ({ ...c, events: c.events ?? [] }))
            : []
        );
        updateStep(3);
      } else if (message?.detail?.document_id) {
        setVendorDocuments((prev) =>
          prev.map((doc) =>
            doc.document_id === message?.detail.document_id
              ? {
                  ...doc,
                  description: message?.detail.description,
                  updated_by: {
                    ...doc.updated_by,
                    first_name: message?.detail.updated_by.first_name,
                    last_name: message?.detail.updated_by.last_name,
                  },
                  updated_at: message?.detail.updated_by.created_at,
                  document_status: {
                    ...doc.document_status,
                    title: message?.detail.is_rejected ? "Denied" : "Approved",
                  },
                }
              : doc
          )
        );
      } else if (message?.detail?.description) {
        updateStep(1);
        setOnboardingStatus(message?.detail?.description);
        setPmName(
          message?.detail?.updated_by?.first_name +
            " " +
            message?.detail?.updated_by?.last_name
        );
        setUpdateDate(
          new Date(message?.detail?.updated_by?.created_at).toLocaleDateString()
        );
      }
      if (message.changes) {
        message.changes.forEach((change: any) => {
          if (change?.field === "trades") {
            setTrades((prev) => {
              let updatedTrades = [...prev];

              const added = change.added || [];
              const removed = change.removed || [];
              const updated = change.updated || [];

              if (removed.length > 0) {
                updatedTrades = updatedTrades.filter(
                  (trade) =>
                    !removed.some(
                      (r: any) => r.gewerk_id === trade.gesys_gewerk_id
                    )
                );
              }

              if (added.length > 0) {
                added.forEach((a: any) => {
                  updatedTrades.push({
                    trade:
                      tradeOptions.find(
                        (t) => t.gesys_gewerk_id === a.gewerk_id
                      )?.gewerk_name || "",
                    count: a.employee_number,
                    gesys_gewerk_id: a.gewerk_id,
                  });
                });
              }

              if (updated.length > 0) {
                updated.forEach((u: any) => {
                  const index = updatedTrades.findIndex(
                    (trade) => trade.gesys_gewerk_id === u.gewerk_id
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

              return updatedTrades;
            });
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

  console.log(contracts);

  useEffect(() => {
    if (!vendorId) return;

    const fetchVendorDocuments = async () => {
      setLoadingDocuments(true);
      setDocumentError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/documents/vendors/${vendorId}/documents`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.data) {
          // Extract document types from the response
          const types: DocumentType[] = result.data.map(
            (item: DocumentWithType) => {
              return {
                type_id: item.type_id,
                title: item.title,
                mandatory: item.document?.document_types?.mandatory ?? false,
                category_id: item.document?.document_types?.category_id ?? 0,
                issued_by: item?.issued_by ?? "",
                how_to_obtain: item?.how_to_obtain ?? "",
                appearance: item?.appearance ?? "",
              };
            }
          );
          setDocumentTypes(types);

          // Extract submitted documents
          const documents: Document[] = result.data
            .filter((item: DocumentWithType) => item.document !== null)
            .map((item: DocumentWithType) => item.document as Document);
          setVendorDocuments(documents);
        }
      } catch (error) {
        console.error("Error fetching vendor documents:", error);
        setDocumentError("Failed to load document requirements");
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchVendorDocuments();
  }, [vendorId, step]);

  const consolidateEmail = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      await fetch(
        `${API_BASE_URL}/documents/vendors/consolidated-email?${accessToken}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      Helpers.notification.error("Error sending consolidated email");
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        consolidateEmail();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      consolidateEmail();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const renderDocumentCard = (docType: DocumentType) => {
    const { type_id, title, mandatory, issued_by, how_to_obtain, appearance } =
      docType;
    const document = getDocumentForType(type_id);
    const status = document?.document_status?.title || "Not Uploaded";
    const fileName = document?.name || "";
    const url = document?.url || "";
    const showSuccess = uploadSuccess[type_id] || false;
    const selectedFile = selectedFiles[type_id];

    // Get styling based on status
    const getStatusStyles = () => {
      switch (status.toLowerCase()) {
        case "approved":
          return {
            bgcolor: "#f1f8e9",
            border: "1px solid #c5e1a5",
            icon: (
              <Tooltip
                title={
                  <Box
                    sx={{
                      width: 150,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className="tooltip"
                  >
                    <Box sx={{ display: "flex", gap: 1 }} className="issued-by">
                      <Typography variant="subtitle2">
                        {t("IssuedBy")}:{" "}
                      </Typography>
                      <Typography variant="body2">{issued_by}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1 }}
                      className="how-to-obtain"
                    >
                      <Typography variant="subtitle2">
                        {t("HowToObtain")}:{" "}
                      </Typography>
                      <Typography variant="body2">{how_to_obtain}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1 }}
                      className="appearance"
                    >
                      <Typography variant="subtitle2">
                        {t("Appearance")}:{" "}
                      </Typography>
                      <Typography variant="body2">{appearance}</Typography>
                    </Box>
                  </Box>
                }
                placement="bottom"
                arrow
              >
                <HelpIcon
                  sx={{
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
                  <Box
                    sx={{
                      width: 150,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className="tooltip"
                  >
                    <Box sx={{ display: "flex", gap: 1 }} className="issued-by">
                      <Typography variant="subtitle2">
                        {t("IssuedBy")}:{" "}
                      </Typography>
                      <Typography variant="body2">{issued_by}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1 }}
                      className="how-to-obtain"
                    >
                      <Typography variant="subtitle2">
                        {t("HowToObtain")}:{" "}
                      </Typography>
                      <Typography variant="body2">{how_to_obtain}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1 }}
                      className="appearance"
                    >
                      <Typography variant="subtitle2">
                        {t("Appearance")}:{" "}
                      </Typography>
                      <Typography variant="body2">{appearance}</Typography>
                    </Box>
                  </Box>
                }
                placement="bottom"
                arrow
              >
                <HelpIcon
                  sx={{
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
                  <Box
                    sx={{
                      width: 150,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className="tooltip"
                  >
                    <Box sx={{ display: "flex", gap: 1 }} className="issued-by">
                      <Typography variant="subtitle2">
                        {t("IssuedBy")}:{" "}
                      </Typography>
                      <Typography variant="body2">{issued_by}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1 }}
                      className="how-to-obtain"
                    >
                      <Typography variant="subtitle2">
                        {t("HowToObtain")}:{" "}
                      </Typography>
                      <Typography variant="body2">{how_to_obtain}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1 }}
                      className="appearance"
                    >
                      <Typography variant="subtitle2">
                        {t("Appearance")}:{" "}
                      </Typography>
                      <Typography variant="body2">{appearance}</Typography>
                    </Box>
                  </Box>
                }
                placement="bottom"
                arrow
              >
                <HelpIcon
                  sx={{
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
                  <Box
                    sx={{
                      width: 150,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className="tooltip"
                  >
                    <Box sx={{ display: "flex", gap: 1 }} className="issued-by">
                      <Typography variant="subtitle2">
                        {t("IssuedBy")}:{" "}
                      </Typography>
                      <Typography variant="body2">{issued_by}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1 }}
                      className="how-to-obtain"
                    >
                      <Typography variant="subtitle2">
                        {t("HowToObtain")}:{" "}
                      </Typography>
                      <Typography variant="body2">{how_to_obtain}</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1 }}
                      className="appearance"
                    >
                      <Typography variant="subtitle2">
                        {t("Appearance")}:{" "}
                      </Typography>
                      <Typography variant="body2">{appearance}</Typography>
                    </Box>
                  </Box>
                }
                placement="bottom"
                arrow
              >
                <HelpIcon
                  sx={{
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

    return (
      <Card
        key={message?.detail ? message.detail.document_id : type_id}
        variant="outlined"
        sx={{
          bgcolor: styles.bgcolor,
          border: styles.border,
          borderRadius: 4,
          height: "100%",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {styles.icon}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    color: "#424242",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {title} {mandatory && " *"}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={styles.statusLabel}
              sx={{
                color: styles.statusColor,
                bgcolor: "transparent",
                border: `1px solid ${styles.statusColor}`,
                fontWeight: 500,
              }}
            />
          </Box>

          {document && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: 1,
                mb: 1,
                gap: 0.5,
              }}
            >
              <InsertDriveFileIcon fontSize="small" color="action" />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  ml: 1,
                  textDecoration: url ? "underline" : "none",
                  cursor: url ? "pointer" : "default",
                  "&:hover": {
                    color: url ? "primary.main" : "text.secondary",
                  },
                }}
                onClick={() => url && window.open(url, "_blank")}
              >
                {fileName} {url && `(${t("ClickToView")})`}
              </Typography>
            </Box>
          )}

          {document?.description && (
            <Alert
              severity="error"
              sx={{
                backgroundColor: "transparent",
                color: "#c62828",
                padding: 0,
                fontWeight: 500,
                overflowWrap: "anywhere",
              }}
            >
              {document?.description}
              <br />
              <Typography variant="caption" color="text.secondary">
                {t("RejectedBy")}{" "}
                <b>
                  {document?.updated_by.first_name +
                    " " +
                    " " +
                    document?.updated_by.last_name || "N/A"}
                </b>{" "}
                {t("on")}{" "}
                <b>
                  {new Date(document?.updated_at || "").toLocaleDateString()}
                </b>
              </Typography>
            </Alert>
          )}

          {/* Simplified upload section */}
          {(status === "Not Uploaded" || status === "Denied") && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <label htmlFor={`file-upload-${type_id}`} style={{ flexGrow: 1 }}>
                <UploadInput
                  id={`file-upload-${type_id}`}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    handleDocumentUpload(type_id, file);
                  }}
                />
                <Button
                  component="span"
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    justifyContent: "flex-start",
                    textAlign: "left",
                    color: "#424242",
                    borderColor: "#e0e0e0",
                    maxWidth: "304px",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: "100%",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      textWrap: "nowrap",
                    }}
                  >
                    {selectedFile ? selectedFile.name : t("selectPDF")}
                  </Typography>
                </Button>
              </label>
            </Box>
          )}

          {showSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {t("successNoti")}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleDocumentUpload = async (typeId: number, file: File | null) => {
    if (!vendorId) {
      alert("Vendor ID not available. Please try again later.");
      return;
    }

    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    // Use the file's name directly
    const name = file.name;

    setUploadingDoc((prev) => ({ ...prev, [typeId]: true }));
    setUploadSuccess((prev) => ({ ...prev, [typeId]: false }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("vendor_id", vendorId.toString());
      formData.append("type_id", typeId.toString());
      formData.append("name", name);

      const response = await fetch(
        `${API_BASE_URL}/documents/vendors/documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Refresh the documents list with the new combined API
      const docResponse = await fetch(
        `${API_BASE_URL}/documents/vendors/${vendorId}/documents`
      );
      const docResult = await docResponse.json();

      if (docResponse.ok && docResult.data) {
        // Extract document types from the response
        const types: DocumentType[] = docResult.data.map(
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
        const documents: Document[] = docResult.data
          .filter((item: DocumentWithType) => item.document !== null)
          .map((item: DocumentWithType) => item.document as Document);
        setVendorDocuments(documents);
      }

      setUploadSuccess((prev) => ({ ...prev, [typeId]: true }));

      // Clear the success message after a delay
      setTimeout(() => {
        setUploadSuccess((prev) => ({ ...prev, [typeId]: false }));
      }, 3000);

      // Clear the selected file
      setSelectedFiles((prev) => ({ ...prev, [typeId]: null }));
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploadingDoc((prev) => ({ ...prev, [typeId]: false }));
    }
  };

  // Get document status for a given type
  const getDocumentForType = (typeId: number) => {
    return vendorDocuments.find((doc) => doc.type_id === typeId);
  };

  // Check if any mandatory document is not yet approved to enable Continue button
  const getDocumentStatus = () => {
    return documentTypes.every((type) => {
      const doc = getDocumentForType(type.type_id);
      return doc !== undefined && doc.document_status?.title === "Approved";
    });
  };

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      setCountriesError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/countries`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.data) {
          setCountries(result.data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountriesError("Failed to load countries");
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch legal forms when country changes
  useEffect(() => {
    if (!countryId) return;

    const fetchLegalForms = async () => {
      setLoadingLegalForms(true);
      setLegalFormsError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/legal-forms/country?country_id=${countryId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.data) {
          setLegalForms(result.data);
        }
      } catch (error) {
        console.error("Error fetching legal forms:", error);
        setLegalFormsError("Failed to load legal forms");
      } finally {
        setLoadingLegalForms(false);
      }
    };

    fetchLegalForms();
  }, [countryId]);

  // Fetch trades on component mount
  useEffect(() => {
    const fetchTrades = async () => {
      setLoadingTrades(true);
      setTradesError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/gewerks/assign`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.data) {
          setTradeOptions(result.data);
        }
      } catch (error) {
        console.error("Error fetching trades:", error);
        setTradesError("Failed to load trades");
      } finally {
        setLoadingTrades(false);
      }
    };

    fetchTrades();
  }, []);

  // Fetch vendor contracts
  useEffect(() => {
    const fetchVendorContracts = async () => {
      if (!vendorId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/contracts/vendor?vendor_id=${vendorId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.data) {
          setContracts(result.data);
        }
      } catch (error) {
        console.error("Error fetching vendor contracts:", error);
      }
    };

    fetchVendorContracts();
  }, [vendorId]);

  // Fetch representative positions
  useEffect(() => {
    const fetchPositions = async () => {
      setLoadingPositions(true);
      setPositionsError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/representative_positions/representative-positions`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.data) {
          setPositions(result.data);
        }
      } catch (error) {
        console.error("Error fetching representative positions:", error);
        setPositionsError("Failed to load representative positions");
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, []);

  // Fetch federal states
  useEffect(() => {
    const fetchFederalStates = async () => {
      setLoadingFederalStates(true);
      setFederalStatesError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/vendors/state`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.data) {
          setFederalStates(result.data);
        }
      } catch (error) {
        console.error("Error fetching federal states:", error);
        setFederalStatesError("Failed to load federal states");
      } finally {
        setLoadingFederalStates(false);
      }
    };

    fetchFederalStates();
  }, []);

  // fetching vendor details:
  useEffect(() => {
    const fetchVendorIdByEmail = async () => {
      setIsLoadingVendorId(true);
      setVendorIdError(null);

      try {
        // const userEmail = localStorage?.getItem("userEmail");
        const urlSearchParams = new URLSearchParams(window.location.search);
        const userEmail =
          urlSearchParams.get("userEmail") ||
          localStorage?.getItem("userEmail");

        if (!userEmail) {
          throw new Error("User email not found");
        }

        // Now, get the vendor ID using the user's email
        const response = await fetch(
          `${API_BASE_URL}/vendors/contact-email?email=${encodeURIComponent(
            userEmail
          )}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.data) {
          setVendorDetails(result.data);

          // Set vendor ID
          if (result.data.vendor_id) {
            setVendorId(result.data.vendor_id);
          }

          // Prefill form fields with vendor data
          if (result.data.onboarding_transaction.stage_1.status_description) {
            setOnboardingStatus(
              result.data.onboarding_transaction.stage_1.status_description
            );
            setPmName(result.data.onboarding_transaction.stage_1.pm_name);
            setUpdateDate(
              new Date(
                result.data.onboarding_transaction.stage_1.created_at
              ).toLocaleDateString()
            );
          }

          if (result.data.company_name)
            setCompanyName(result.data.company_name);
          if (result.data.tax_id) setTaxId(result.data.tax_id);
          if (result.data.street) setStreet(result.data.street);
          if (result.data.house_number)
            setHouseNumber(result.data.house_number);
          if (result.data.apartment_number)
            setApartmentNumber(result.data.apartment_number);
          if (result.data.zip_code) setZipCode(result.data.zip_code);
          if (result.data.city) setCity(result.data.city);
          if (result.data.website_url) setWebsite(result.data.website_url);
          if (result.data.cover_region)
            setRegion(
              result.data.cover_region === "NationalWide"
                ? "3"
                : result.data.cover_region === "States"
                ? "2"
                : "1"
            );
          if (result.data.postcodes) {
            const postcodes = result.data.postcodes.map((item: any) => ({
              code: item.postcode,
              radius: item.radius,
            }));
            setPostalCode(postcodes);
          }

          // Set country and country ID
          if (result.data.country_id) {
            setCountryId(result.data.country_id);
            // Find country name from countries array
            const countryObj = countries.find(
              (c) => c.country_id === result.data.country_id
            );
            if (countryObj) {
              setCountry(countryObj.name);
            } else if (result.data.country_name) {
              setCountry(result.data.country_name);
            }
          }

          // Set legal form ID
          if (result.data.legal_form_id) {
            setLegalFormId(result.data.legal_form_id);
          }

          // Set federal states (regions)
          if (
            result.data.federal_state_ids &&
            result.data.federal_state_ids.length > 0
          ) {
            setSelectedRegions(result.data.federal_state_ids);
          }

          // Set contact user information
          if (result.data.contact_user) {
            if (result.data.contact_user.first_name)
              setFirstName(result.data.contact_user.first_name);
            if (result.data.contact_user.last_name)
              setLastName(result.data.contact_user.last_name);
            if (result.data.contact_user.email)
              setVendorEmail(result.data.contact_user.email);
            if (result.data.contact_user.phone_number)
              setPhone(result.data.contact_user.phone_number);
            if (result.data.legal_form_id) {
              setLegalFormId(result.data.legal_form_id);
            }
            if (
              result.data.contact_user.position &&
              result.data.contact_user.position.position_id
            ) {
              setSelectedPositionId(
                result.data.contact_user.position.position_id
              );
              const position = positions.find(
                (pos) =>
                  pos.position_id ===
                  result.data.contact_user.position.position_id
              );
              if (position) {
                setSelectedPosition(position.title);
              }
            }
            if (result.data.contact_user.position) {
              setSelectedPositionId(
                result.data.contact_user.position.position_id
              );
            }
            if (result.data.contact_user.position) {
              setSelectedPosition(result.data.contact_user.position.title);
            }
          }

          // Initialize trades from vendor gewerks
          if (result.data.gewerks && result.data.gewerks.length > 0) {
            const initialTrades = result.data.gewerks.map((gewerk: any) => ({
              trade: gewerk.name,
              count: gewerk.employee_number,
              gesys_gewerk_id: gewerk.gewerk_id,
            }));
            setTrades(initialTrades);
          }
        } else {
          throw new Error("Vendor data not found in response");
        }
      } catch (error) {
        console.error("Error fetching vendor data by email:", error);
        setVendorIdError("Failed to load vendor information");
      } finally {
        setIsLoadingVendorId(false);
      }
    };

    fetchVendorIdByEmail();
  }, []);

  // Update legal form ID when legal form changes
  useEffect(() => {
    const selectedForm = legalForms.find(
      (form) => form.legal_form_id === legalFormId
    );
    if (selectedForm) {
      setLegalFormId(selectedForm.legal_form_id);
      setLegalForm(selectedForm.title);
    } else {
      setLegalFormId(null);
      setLegalForm("");
    }
  }, [legalForm, legalForms]);

  // Update position ID when position changes
  useEffect(() => {
    const selectedPos = positions.find((pos) => pos.title === selectedPosition);
    if (selectedPos) {
      setSelectedPositionId(selectedPos.position_id);
    }
  }, [selectedPosition, positions]);

  const next = () => updateStep(step + 1);

  // Handle trade deletion
  const handleDeleteTrade = (index: number) => {
    const updatedTrades = [...trades];
    updatedTrades.splice(index, 1);
    setTrades(updatedTrades);
  };

  // Update trade
  const updateTrade = (index: number, field: string, value: string) => {
    const updated = [...trades];

    if (field === "trade") {
      // Find the trade option to get its ID
      const tradeOption = tradeOptions.find(
        (option) => option.gewerk_name === value
      );
      if (tradeOption) {
        updated[index] = {
          ...updated[index],
          trade: value,
          gesys_gewerk_id: tradeOption.gesys_gewerk_id,
        };
      } else {
        updated[index] = {
          ...updated[index],
          trade: value,
        };
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }

    setTrades(updated);
  };

  // Add a new trade
  const addTrade = () => {
    setTrades([...trades, { trade: "", count: "" }]);
  };

  // Handle country change
  const handleCountryChange = (event: SelectChangeEvent) => {
    const selectedCountryName = event.target.value;
    setCountry(selectedCountryName);
    setLegalForm("");

    // Find the country ID from the selected country name
    const selectedCountry = countries.find(
      (c) => c.name === selectedCountryName
    );
    if (selectedCountry) {
      setCountryId(selectedCountry.country_id);
    } else {
      setCountryId(null);
    }
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    // Check if vendorId is available
    if (!vendorId) {
      alert("Vendor ID not available. Please try again later.");
      setIsInfoUpdated(false);
      return;
    }
    // Validate mandatory fields
    if (!country) {
      alert("Please select a country");
      setIsInfoUpdated(false);
      return;
    }

    if (!companyName) {
      alert("Please enter a company name");
      setIsInfoUpdated(false);
      return;
    }

    if (!legalForm) {
      alert("Please select a legal form");
      setIsInfoUpdated(false);
      return;
    }

    if (!taxId) {
      alert("Please enter a tax ID");
      setIsInfoUpdated(false);
      return;
    }

    if (!street || !houseNumber || !zipCode || !city) {
      alert("Please fill in the complete address");
      setIsInfoUpdated(false);
      return;
    }

    if (country === "Poland" && !apartmentNumber) {
      alert("Please add an apartment number");
      setIsInfoUpdated(false);
      return;
    }

    if (!trades || trades[0].trade === "") {
      alert("Please add at least one trade");
      setIsInfoUpdated(false);
      return;
    }

    if (region === "") {
      alert("Please select a cover region");
      setIsInfoUpdated(false);
      return;
    }

    if (region === "2" && selectedRegions.length === 0) {
      alert("Please select at least one federal state");
      setIsInfoUpdated(false);
      return;
    }

    if (region === "1" && postalCode.length === 0) {
      alert("Please add at least one postal code");
      setIsInfoUpdated(false);
      return;
    }

    if (!firstName || !lastName || !phone) {
      alert("Please fill in all contact details");
      setIsInfoUpdated(false);
      return;
    }

    if (!selectedPosition) {
      alert("Please select a position");
      setIsInfoUpdated(false);
      return;
    }

    // Check if any trade has a null, undefined, or empty count
    const hasEmptyTradeCount = trades.some(
      (trade) =>
        trade.count === null ||
        trade.count === undefined ||
        trade.count === "" ||
        trade.count === "0"
    );

    // Example usage in validation
    if (hasEmptyTradeCount) {
      alert("Please enter employee count for all trades");
      setIsInfoUpdated(false);
      return;
    }
    try {
      setIsSubmitting(true);

      // Transform trades to the new format
      const formattedTrades = trades
        .filter((t) => t.gesys_gewerk_id && t.count)
        .map((t) => ({
          gewerk_id: t.gesys_gewerk_id,
          employee_number: Number.parseInt(t.count) || 0,
        }));

      const userEmail = localStorage.getItem("userEmail");
      const accessToken = localStorage.getItem("accessToken");

      if (userEmail && accessToken) {
        // Prepare the request body for user update with email included in the payload
        const userRequestBody = {
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone || "",
          representative_position_id: selectedPositionId || null,
        };

        // Make the user update API call with authorization header
        const userResponse = await fetch(`${API_BASE_URL}/users/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(userRequestBody),
        });

        if (!userResponse.ok) {
          console.error("Error updating user:", await userResponse.text());
          // Don't throw error here, as we've already updated the vendor successfully
        } else {
          const userResult = await userResponse.json();
          setVendorDetails((prev: any) => ({
            ...prev,
            contact_user: {
              ...userResult.data,
            },
          }));
        }
      } else {
        console.error("User email or access token not found in localStorage");
      }

      // Prepare the request body using state variables with the new format
      const vendorRequestBody = {
        company_name: companyName,
        street: street,
        zip_code: zipCode,
        federal_state_ids: selectedRegions, // Use the array of selected region IDs
        tax_id: taxId || "",
        trades: formattedTrades,
        legal_form_id: legalFormId || "null",
        house_number: houseNumber,
        apartment_number: apartmentNumber || "",
        city: city,
        country_id: countryId,
        website_url: website || "",
        cover_region:
          region === "3"
            ? "NationalWide"
            : region === "2"
            ? "States"
            : "PostCode",
        postcodes: postalCode.map((item) => ({
          postcode: item.code,
          radius: item.radius,
        })),
      };

      const vendorAccessToken = localStorage.getItem("accessToken");

      // Make the API call
      const vendorResponse = await fetch(
        `${API_BASE_URL}/vendors/update?vendor_id=${vendorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${vendorAccessToken}`,
          },
          body: JSON.stringify(vendorRequestBody),
        }
      );

      if (!vendorResponse.ok) {
        throw new Error(`HTTP error! Status: ${vendorResponse.status}`);
      }

      const vendorResult = await vendorResponse.json();
      setVendorDetails((prev: any) => ({
        ...prev,
        ...vendorResult.data,
      }));

      // Proceed to next step
      updateStep(2);
      setIsInfoUpdated(true);
      setIsEditing(false);
      setOnboardingStatus("");
      setIsEditing(false);
      setOnboardingStatus("");
    } catch (error) {
      console.error("Error updating vendor information:", error);
      alert("Failed to update vendor information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.getDate().toString().padStart(2, "0") +
      "/" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      date.getFullYear() +
      " " +
      date.getHours().toString().padStart(2, "0") +
      ":" +
      date.getMinutes().toString().padStart(2, "0")
    );
  };

  const renderContractCard = (contract: (typeof contracts)[0]) => {
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

    const sentDate = formatDate(created_at)
      ? formatDate(created_at)
      : formatDate(new Date().toISOString());
    const viewDate =
      progressValue >= 66
        ? formatDate(
            events.find((event: any) => event.event_type === "Viewed")
              ?.created_at || ""
          )
        : "";
    const completedDate =
      progressValue === 100
        ? formatDate(
            events.find(
              (event: any) =>
                event.event_type === "Completed" ||
                event.event_type === "SigningSuccess"
            ).created_at || ""
          )
        : "";

    return (
      <Card variant="outlined" sx={{ borderRadius: 4, height: "100%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: isCompleted ? "#F57C00" : "#ffc107",
              }}
            >
              {isCompleted ? t("completed") : t("waitingForVendorSignature")}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("signatureProgress")}
          </Typography>

          <StyledLinearProgress
            variant="determinate"
            value={progressValue}
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <StatusIcon>
              <MailOutlineIcon sx={{ color: "#F57C00", fontSize: "1.25rem" }} />
              <Typography variant="caption">
                {t("receivedAt")} {sentDate}
              </Typography>
              <Link
                href={contract.url || contract.document_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("clickToSign")}{" "}
                <OpenInNewIcon sx={{ color: "#F57C00", fontSize: "0.75rem" }} />
              </Link>
            </StatusIcon>

            <StatusIcon>
              <VisibilityIcon
                sx={{
                  color: progressValue >= 66 ? "#F57C00" : "#e0e0e0",
                  fontSize: "1.25rem",
                }}
              />
              <Typography variant="caption">
                {progressValue >= 66
                  ? `${t("viewed")} ${t("at")} ${viewDate}`
                  : `${t("viewed")}`}
              </Typography>
            </StatusIcon>

            <StatusIcon>
              <CheckIcon
                sx={{
                  color: progressValue === 100 ? "#F57C00" : "#e0e0e0",
                  fontSize: "1.25rem",
                }}
              />
              <Typography variant="caption">
                {progressValue == 100
                  ? `${t(`completed`)} ${t(`at`)} ${completedDate}`
                  : t(`completed`)}
              </Typography>
            </StatusIcon>
          </Box>
        </CardContent>
      </Card>
    );
  };

  useEffect(() => {
    const tmp = postcodeList
      .map((item, index) => {
        let code: string = item.code.toString().padStart(5, "0");
        let label: string =
          item.code.toString().padStart(5, "0") +
          " - " +
          item.state +
          " - " +
          item.district;
        return { code: code!, label: label! };
      })
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex((t) => t.code === item.code && t.label === item.label)
      );
    setPostalCodes(tmp);
  }, []);

  const filterOptions = createFilterOptions<PostalCode>({
    stringify: (option) => `${option.label}`,
    matchFrom: "start",
  });

  const handleCancel = () => {
    setOnboardingStatus(
      vendorDetails?.onboarding_transaction?.stage_1?.status_description || ""
    );
    setPmName(vendorDetails?.onboarding_transaction?.stage_1?.pm_name || "");
    setUpdateDate(
      new Date(
        vendorDetails?.onboarding_transaction?.stage_1?.created_at || ""
      ).toLocaleDateString()
    );
    setCompanyName(vendorDetails?.company_name || "");
    setCountry(vendorDetails?.country_name || "");
    setLegalFormId(vendorDetails?.legal_form_id || null);
    setTaxId(vendorDetails?.tax_id || "");
    setStreet(vendorDetails?.street || "");
    setHouseNumber(vendorDetails?.house_number || "");
    setApartmentNumber(vendorDetails?.apartment_number || "");
    setZipCode(vendorDetails?.zip_code || "");
    setCity(vendorDetails?.city || "");
    setWebsite(vendorDetails?.website_url || "");
    setTrades(
      vendorDetails?.gewerks?.map((gewerk: any) => ({
        trade: gewerk.name,
        count: gewerk.employee_number,
        gesys_gewerk_id: gewerk.gewerk_id,
      })) || []
    );

    setRegion(
      vendorDetails?.cover_region === "NationalWide"
        ? "3"
        : vendorDetails?.cover_region === "States"
        ? "2"
        : "1"
    );
    setPostalCode(
      vendorDetails?.postcodes?.map((item: any) => ({
        code: item.postcode,
        radius: item.radius,
      })) || []
    );
    setSelectedRegions(vendorDetails?.federal_state_ids || []);
    setFirstName(vendorDetails?.contact_user?.first_name || "");
    setLastName(vendorDetails?.contact_user?.last_name || "");
    setPhone(vendorDetails?.contact_user?.phone_number || "");
    const position = vendorDetails?.contact_user?.position;
    if (position) {
      setSelectedPositionId(position.position_id || null);
      setSelectedPosition(position.title || "");
    }
    setIsEditing(false);
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: "0 auto", p: 2 }}>
      <Modal
        open={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {t("infoNotSaved")}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {t("warningMessage")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsOpenModal(false)}
              sx={{
                mt: 2,
                borderColor: "#F57C00",
                color: "#F57C00",
                borderRadius: 4,
              }}
            >
              {t("close")}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                updateStep(2);
                handleCancel();
                setIsOpenModal(false);
              }}
              sx={{
                mt: 2,
                backgroundColor: "#F57C00",
                color: "#fff",
                borderRadius: 4,
              }}
            >
              {t("continue")}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Box
        sx={{
          height: "20%",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {/* Left side - could be empty or add a logo here */}
          <Box>
            <img
              src={logoImage}
              alt="Galvanek Logo"
              style={{
                height: "40px", // Adjust size as needed
                width: "auto",
                display: "block",
              }}
            />
          </Box>

          {/* Right side - language selector and logout button */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <IconButton onClick={handleClick}>
              <Badge badgeContent={notiItems.length} color="error">
                <NotificationsIcon sx={{ fontSize: 20, color: "#000" }} />
              </Badge>
            </IconButton>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: { width: "fit-content" },
                className: "noti-dropdown",
              }}
            >
              <Box>
                {notiItems.length === 0 ? (
                  <MenuItem disabled>{t("noNewNotifications")}</MenuItem>
                ) : (
                  notiItems.map((item: any) => (
                    <MenuItem key={item.key} onClick={handleClose}>
                      {item.label}
                    </MenuItem>
                  ))
                )}
              </Box>
            </Popover>
            <FormControl size="small" sx={{ width: 160 }}>
              <Select
                value={i18n.language || "en"}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                sx={{ borderRadius: 4 }}
              >
                {languagesList.map((item, index) => {
                  return (
                    <MenuItem value={item.value} key={index}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <img
                          width="20"
                          height="20"
                          src={item.icon}
                          alt="icon"
                        />
                        {t(item.label)}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {t("welcome")}
          </Typography>
          {companyName && (
            <Typography variant="body2" color="text.secondary">
              {companyName}
            </Typography>
          )}
        </Box>
        <StepperContainer>
          <LinearProgress
            variant="determinate"
            value={(100 / 3) * step}
            sx={{ borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {t("step")} {step}/3: {t("step1")}
          </Typography>
        </StepperContainer>{" "}
      </Box>
      <TabContext value={step.toString()}>
        <Box
          sx={{
            position: "sticky",
            p: 1,
            top: "10rem",
            padding: "0 16px",
            zIndex: 900,
            backgroundColor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              width: "50%",
              ".Mui-disabled": {
                color: "rgba(0,0,0,0.2) !important",
              },
            }}
          >
            <TabList
              onChange={(_event: React.SyntheticEvent, value: string) => {
                isInfoUpdated && setStep(Number(value));
              }}
              variant="fullWidth"
            >
              <Tab
                sx={{
                  textTransform: "none",
                }}
                label={t("step1")}
                value="1"
                onClick={() => updateStep(1)}
              />
              <Tab
                sx={{
                  textTransform: "none",
                }}
                label={t("step2")}
                value="2"
                onClick={() => {
                  if (isEditing) {
                    setIsOpenModal(true);
                    updateStep(step);
                    updateStep(step);
                  } else {
                    updateStep(2);
                  }
                }}
                disabled={
                  vendorDetails?.country_name === undefined ||
                  vendorDetails?.country_name === null ||
                  onboardingStatus !== ""
                }
              />
              <Tab
                sx={{
                  textTransform: "none",
                }}
                label={t("step3")}
                value="3"
                onClick={() => updateStep(3)}
                disabled={
                  !getDocumentStatus() ||
                  vendorDetails?.country_name === undefined ||
                  vendorDetails?.country_name === null
                }
              />
            </TabList>
          </Box>
          {step === 1 && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {vendorDetails?.country_name !== null && isEditing ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleCancel();
                    setIsEditing(false);
                  }}
                  sx={{
                    borderRadius: 4,
                    borderColor: "#F57C00",
                    color: "#F57C00",
                    "&:hover": {
                      backgroundColor: "#FFF3E0",
                      borderColor: "#EF6C00",
                    },
                  }}
                >
                  {t("cancel")}
                </Button>
              ) : null}
              <Button
                variant="contained"
                onClick={() => {
                  if (isEditing) {
                    handleFormSubmit();
                  } else {
                    updateStep(2);
                  }
                }}
                disabled={isSubmitting || !isEditing}
                sx={{
                  borderRadius: 4,
                  backgroundColor: "#F57C00",
                  "&:hover": {
                    backgroundColor: "#EF6C00",
                  },
                  color: "#fff",
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t("update")
                )}
              </Button>
            </Box>
          )}
          {step === 2 && (
            <Button
              variant="contained"
              onClick={next}
              disabled={!getDocumentStatus()}
              sx={{
                borderRadius: 4,
                backgroundColor: "#F57C00",
                "&:hover": {
                  backgroundColor: "#EF6C00",
                },
                color: "#fff",
                "&.Mui-disabled": {
                  backgroundColor: "#e0e0e0",
                  color: "#9e9e9e",
                },
              }}
            >
              {t("continue")}
            </Button>
          )}
        </Box>
        {/* Step 1: Company Details */}
        <TabPanel value="1">
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 4,
              backgroundColor: "#FFF3E0",
              color: "text.primary",
              border: "1px solid #FFE0B2",
            }}
          >
            {t("infoBox")}
          </Alert>

          {onboardingStatus && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderLeft: "5px solid #D74141",
              }}
            >
              <Typography>{onboardingStatus} </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("RejectedBy")} <b>{pmName}</b> {t("on")} <b>{updateDate}</b>
              </Typography>
            </Alert>
          )}

          <FormContainer>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel
                    id="country-label"
                    sx={{ display: "flex", gap: 0.5 }}
                  >
                    {t("country")}
                    <Typography color="error.main">*</Typography>
                  </InputLabel>
                  <Select
                    labelId="country-label"
                    value={country}
                    label={t("country") + "**"}
                    onChange={handleCountryChange}
                    sx={{ borderRadius: 4 }}
                    disabled={
                      loadingCountries || vendorDetails?.country_name !== null
                    }
                  >
                    <MenuItem value="">
                      <em>{t("country")} *</em>
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.country_id} value={country.name}>
                        {t(country.name)}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingCountries && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t("loadingCountries")}
                      </Typography>
                    </Box>
                  )}
                  {countriesError && (
                    <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                      <Typography variant="caption">
                        {countriesError}
                      </Typography>
                    </Alert>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    fullWidth
                    label={
                      <Box
                        id="tax-label"
                        sx={{
                          display: "flex",
                          gap: 0.5,
                        }}
                      >
                        {t("company")}
                        <Typography color="error.main">*</Typography>
                      </Box>
                    }
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setIsEditing(true);
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                      },
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth disabled={!country}>
                  <InputLabel
                    id="legal-form-label"
                    sx={{ display: "flex", gap: 0.5 }}
                  >
                    {t("legalForm")}
                    <Typography color="error.main">*</Typography>
                  </InputLabel>
                  <Select
                    labelId="legal-form-label"
                    value={legalForm}
                    required
                    label={t("legalForm")}
                    onChange={(e) => {
                      setLegalForm(e.target.value);
                      const selectedForm = legalForms.find(
                        (form: any) => form.title === e.target.value
                      );
                      if (selectedForm) {
                        setLegalFormId(selectedForm.legal_form_id);
                      } else {
                        setLegalFormId(null);
                      }
                      setIsEditing(true);
                    }}
                    sx={{ borderRadius: 4 }}
                    disabled={loadingLegalForms || !country}
                  >
                    <MenuItem value="">
                      <em>{t("legalForm")}</em>
                    </MenuItem>
                    {legalForms.map((form) => (
                      <MenuItem key={form.legal_form_id} value={form.title}>
                        {form.title} ({form.description})
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingLegalForms && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t("loadingLegalForms")}
                      </Typography>
                    </Box>
                  )}
                  {legalFormsError && (
                    <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                      <Typography variant="caption">
                        {legalFormsError}
                      </Typography>
                    </Alert>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={
                    <Box id="tax-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("taxId")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  value={taxId}
                  onChange={(e) => {
                    setTaxId(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={
                    <Box id="street-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("street")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={
                    <Box id="house-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("houseNr")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  value={houseNumber}
                  onChange={(e) => {
                    setHouseNumber(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={
                    <Box id="house-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("apartmentNr")}
                      {country === "Poland" && (
                        <Typography color="error.main">*</Typography>
                      )}
                    </Box>
                  }
                  value={apartmentNumber}
                  onChange={(e) => {
                    setApartmentNumber(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={
                    <Box id="zip-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("zip")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={
                    <Box id="city-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("city")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={
                    <Box id="website-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("website")}
                    </Box>
                  }
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              {/* Employees per Trade section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  {t("tradeTitle")}
                </Typography>
                {loadingVendorDetails ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {t("loadingTrades")}
                    </Typography>
                  </Box>
                ) : vendorDetailsError ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {vendorDetailsError}
                  </Alert>
                ) : (
                  trades.map((item, i) => (
                    <Grid
                      container
                      spacing={2}
                      key={i}
                      sx={{ mb: 2 }}
                      alignItems="center"
                    >
                      <Grid item xs={5.6}>
                        <FormControl fullWidth>
                          <InputLabel
                            id="trade-label"
                            sx={{
                              display: "flex",
                              gap: 0.5,
                            }}
                          >
                            {t("selectTrade")}
                            <Typography color="error.main">*</Typography>
                          </InputLabel>
                          <Select
                            labelId={`trade-label-${i}`}
                            value={item.trade}
                            label={"Select Trade **"}
                            onChange={(e) => {
                              updateTrade(i, "trade", e.target.value);
                              setIsEditing(true);
                            }}
                            sx={{ borderRadius: 4 }}
                            disabled={!!item.gesys_gewerk_id || loadingTrades}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 300,
                                  overflowY: "auto",
                                },
                              },
                            }}
                          >
                            <MenuItem value="">
                              <em>{t("selectTrade")}</em>
                            </MenuItem>
                            {tradeOptions
                              .filter((option) => {
                                const usedByAnotherRow = trades.some(
                                  (t, idx) =>
                                    idx !== i &&
                                    t.gesys_gewerk_id === option.gesys_gewerk_id
                                );
                                return (
                                  option.gewerk_name === item.trade ||
                                  !usedByAnotherRow
                                );
                              })
                              .map((trade) => (
                                <MenuItem
                                  key={trade.gesys_gewerk_id}
                                  value={trade.gewerk_name}
                                >
                                  {t(trade.gewerk_name.replace(/\s+/g, ""))}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={5.6}>
                        <TextField
                          fullWidth
                          label={
                            <Box
                              id="trade-count-label"
                              sx={{
                                display: "flex",
                                gap: 0.5,
                              }}
                            >
                              {t("tradeCount")}
                              <Typography color="error.main">*</Typography>
                            </Box>
                          }
                          value={item.count}
                          onChange={(e) => {
                            updateTrade(i, "count", e.target.value);
                            setIsEditing(true);
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 4 },
                          }}
                        />
                      </Grid>
                      <Grid item xs={0.5}>
                        <Button
                          variant="outlined"
                          color="error"
                          disabled={trades.length === 1 && item.trade === ""}
                          onClick={() => {
                            handleDeleteTrade(i);
                            if (trades.length === 1) {
                              setTrades([
                                {
                                  trade: "",
                                  count: "",
                                },
                              ]);
                            }
                            setIsEditing(true);
                          }}
                          sx={{
                            borderRadius: 4,
                            minWidth: "auto",
                            p: 1,
                          }}
                        >
                          <DeleteIcon />
                        </Button>
                      </Grid>
                    </Grid>
                  ))
                )}

                <Button
                  startIcon={<AddIcon />}
                  onClick={addTrade}
                  sx={{
                    color: "primary.main",
                    textTransform: "none",
                    p: 0,
                    "&:hover": {
                      backgroundColor: "transparent",
                      textDecoration: "underline",
                    },
                  }}
                >
                  {t("addTrade")}
                </Button>
              </Grid>

              {/* Regions Covered field - Multiple Select */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  {t("regions")}
                </Typography>
                <Box
                  border={1}
                  borderColor="#e0e0e0"
                  borderRadius={2}
                  sx={{ p: 2 }}
                >
                  <TabContext value={region}>
                    <TabList
                      onChange={(
                        _event: React.SyntheticEvent,
                        value: string
                      ) => {
                        setRegion(value);
                        setIsEditing(true);
                      }}
                      variant="fullWidth"
                      sx={{
                        "& .MuiTabs-indicator": {
                          display: "none",
                        },
                      }}
                    >
                      <Tab
                        sx={{
                          backgroundColor:
                            region === "1" ? "#F57C00" : "transparent",
                          color: region === "1" ? "#fff" : "#000",
                          "&.Mui-selected": {
                            color: "#fff",
                          },
                          borderRadius: 2,
                          textTransform: "none",
                          p: 1,
                        }}
                        label={
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <PlaceOutlinedIcon
                              sx={{
                                fontSize: 20,
                              }}
                            />
                            {t("postcode")}
                          </span>
                        }
                        value="1"
                      />
                      <Tab
                        sx={{
                          backgroundColor:
                            region === "2" ? "#F57C00" : "transparent",
                          color: region === "2" ? "#fff" : "#000",
                          "&.Mui-selected": {
                            color: "#fff",
                          },
                          borderRadius: 2,
                          textTransform: "none",
                        }}
                        label={
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <MapOutlinedIcon
                              sx={{
                                fontSize: 20,
                              }}
                            />
                            {t("states")}
                          </span>
                        }
                        value="2"
                      />
                      <Tab
                        sx={{
                          backgroundColor:
                            region === "3" ? "#F57C00" : "transparent",
                          color: region === "3" ? "#fff" : "#000",
                          "&.Mui-selected": {
                            color: "#fff",
                          },
                          borderRadius: 2,
                          textTransform: "none",
                          padding: "6px 16px",
                        }}
                        label={
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <LanguageOutlinedIcon
                              sx={{
                                fontSize: 20,
                              }}
                            />
                            {t("nationwide")}
                          </span>
                        }
                        value="3"
                      />
                    </TabList>
                    <TabPanel value="1">
                      <Typography sx={{ mb: 2 }}>
                        {t("postcodeInfo")}
                      </Typography>
                      <FormControl variant="outlined" fullWidth size="small">
                        {/* <InputLabel>Enter postcode</InputLabel> */}
                        <Autocomplete
                          freeSolo
                          options={postalCodes}
                          filterOptions={filterOptions}
                          value={null}
                          onChange={(e, newValue: any) => {
                            if (!newValue) return;
                            setIsEditing(true);
                            setPostalCode((prev) => [
                              ...prev,
                              {
                                code: newValue?.code,
                                radius: newValue?.radius || 100,
                              },
                            ]);
                            setNewPostalCode({ code: "", radius: 100 });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              onChange={(e) => {
                                setNewPostalCode({
                                  ...newPostalCode,
                                  code: e.target.value,
                                });
                              }}
                              label={t("selectPostcode")}
                              variant="outlined"
                            />
                          )}
                        />
                      </FormControl>
                      {postalCode &&
                        postalCode.map((_, index) => (
                          <Box
                            key={index}
                            sx={{
                              mt: 1,
                              border: "1px solid #e0e0e0",
                              borderRadius: 2,
                              p: 0.5,
                            }}
                          >
                            <Typography sx={{ p: 1 }}>
                              {postalCode[index].code}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                ml: 2,
                                gap: 4,
                                width: "100%",
                              }}
                            >
                              <Slider
                                value={postalCode[index].radius}
                                aria-label="Small"
                                size="small"
                                valueLabelDisplay="auto"
                                onChange={(_event, value) =>
                                  setPostalCode((prev) =>
                                    prev.map((item, idx) =>
                                      idx === index
                                        ? {
                                            ...item,
                                            radius: parseInt(value.toString()),
                                          }
                                        : item
                                    )
                                  )
                                }
                                min={1}
                                max={500}
                                sx={{
                                  width: "80%",
                                }}
                              />
                              <Typography>
                                {t("Radius")}: {postalCode[index].radius} km
                              </Typography>
                            </Box>
                            <Button
                              variant="text"
                              onClick={() => {
                                setPostalCode((prev) =>
                                  prev.filter((_item, idx) => idx !== index)
                                );
                              }}
                              sx={{
                                color: "red",
                              }}
                            >
                              {t("remove")}
                            </Button>
                          </Box>
                        ))}
                    </TabPanel>
                    <TabPanel value="2">
                      <Typography sx={{ mb: 2 }}>{t("stateInfo")}</Typography>
                      <Box
                        sx={{
                          maxHeight: 200,
                          overflowY: "auto",
                        }}
                      >
                        {federalStates.map((state) => (
                          <Box
                            key={state.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              maxHeight: 32,
                            }}
                          >
                            <Checkbox
                              checked={selectedRegions.includes(state.id)}
                              onChange={(e) => {
                                const selectedValues = e.target.checked
                                  ? [...selectedRegions, state.id]
                                  : selectedRegions.filter(
                                      (id) => id !== state.id
                                    );
                                setSelectedRegions(selectedValues);
                                setIsEditing(true);
                              }}
                            />
                            <Typography>
                              {state.german_name} ({state.english_name})
                            </Typography>
                          </Box>
                        ))}
                        {loadingFederalStates && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t("loadingRegions")}
                            </Typography>
                          </Box>
                        )}
                        {federalStatesError && (
                          <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                            <Typography variant="caption">
                              {federalStatesError}
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                      {selectedRegions.map((id) => (
                        <Chip
                          key={id}
                          label={
                            <Typography>
                              {
                                federalStates.find((s) => s.id === id)
                                  ?.german_name
                              }{" "}
                              (
                              {
                                federalStates.find((s) => s.id === id)
                                  ?.english_name
                              }
                              )
                            </Typography>
                          }
                          onDelete={() => {
                            setSelectedRegions((prev) =>
                              prev.filter((regionId) => regionId !== id)
                            );
                            setIsEditing(true);
                          }}
                          sx={{
                            mr: 1,
                            mt: 1,
                            backgroundColor: "rgba(245, 124, 0, 0.1)",
                            color: "primary.main",
                          }}
                        />
                      ))}
                    </TabPanel>
                    <TabPanel value="3">{t("nationwideInfo")}</TabPanel>
                  </TabContext>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  {t("legalRep")}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    <Box
                      id="first-name-label"
                      sx={{ display: "flex", gap: 0.5 }}
                    >
                      {t("firstName")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    <Box
                      id="last-name-label"
                      sx={{ display: "flex", gap: 0.5 }}
                    >
                      {t("lastName")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    <Box id="email-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("email")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  type="email"
                  value={vendorEmail}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    <Box id="phone-label" sx={{ display: "flex", gap: 0.5 }}>
                      {t("phone")}
                      <Typography color="error.main">*</Typography>
                    </Box>
                  }
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setIsEditing(true);
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel
                    id="position-label"
                    sx={{ display: "flex", gap: 0.5 }}
                  >
                    {t("position")}
                    <Typography color="error.main">*</Typography>
                  </InputLabel>
                  <Select
                    labelId="role-label"
                    value={selectedPosition}
                    label={
                      <Box
                        id="position-label"
                        sx={{
                          display: "flex",
                          gap: 0.5,
                        }}
                      >
                        {t("position")}
                        <Typography color="error.main">*</Typography>
                      </Box>
                    }
                    onChange={(e) => {
                      setSelectedPosition(e.target.value);
                      setIsEditing(true);
                    }}
                    sx={{ borderRadius: 4 }}
                    disabled={loadingPositions}
                  >
                    <MenuItem value="">
                      <em>{t("selectRole")}</em>
                    </MenuItem>
                    {positions.map((position) => (
                      <MenuItem
                        key={position.position_id}
                        value={position.title}
                      >
                        {t(position.title.replace(/\s+/g, ""))}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingPositions && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t("loadingPositions")}
                      </Typography>
                    </Box>
                  )}
                  {positionsError && (
                    <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                      <Typography variant="caption">
                        {positionsError}
                      </Typography>
                    </Alert>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </FormContainer>
        </TabPanel>

        {/* Step 2: Document Upload */}
        <TabPanel value="2">
          <Box>
            {loadingDocuments ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  my: 4,
                }}
              >
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>
                  {t("loadingRequiredDocuments")}
                </Typography>
              </Box>
            ) : documentError ? (
              <Alert severity="error" sx={{ my: 2 }}>
                {documentError}
              </Alert>
            ) : documentTypes.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  my: 4,
                }}
              >
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>
                  {t("loadingRequiredDocuments")}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {documentTypes.map((docType) => (
                  <Grid item xs={12} sm={6} key={docType.type_id}>
                    {renderDocumentCard(docType)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* Step 3: Contract Signature */}
        <TabPanel value="3">
          <Box>
            {contracts.length > 0 &&
            contracts.every(
              (contract) =>
                contract.events &&
                contract.events[0]?.event_type === "Completed"
            ) ? (
              <Alert
                severity="success"
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  color: "text.primary",
                }}
              >
                {t("successMessage")}
                <br />
                {t("readyForOnboarding")}
              </Alert>
            ) : (
              <Alert
                severity="info"
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  backgroundColor: "#FFF3E0",
                  color: "text.primary",
                  border: "1px solid #FFE0B2",
                }}
              >
                {contracts.length === 0 ? (
                  <Typography variant="body2">
                    {t("waitingForContracts")}
                  </Typography>
                ) : (
                  <Typography variant="body2">{t("reviewMessage")}</Typography>
                )}
              </Alert>
            )}

            <Grid>
              {contracts?.map((contract) => (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  key={contract.submission_id}
                  sx={{ mb: 2 }}
                >
                  {renderContractCard(contract)}
                </Grid>
              ))}
            </Grid>
          </Box>
          {/* {contracts.every(
            (item: any) => item.events[0]?.event_type === "Completed"
          ) && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleRedirect}
            >
              Start Onboarding
            </Button>
          )} */}
        </TabPanel>
      </TabContext>
      <Box
        sx={{
          mt: 4,
          textAlign: "center",
          color: "text.secondary",
          fontSize: "0.875rem",
        }}
      >
        <Typography variant="body2">
          {t("version")}: {import.meta.env.VITE_REACT_APP_VERSION_TAG}
        </Typography>
      </Box>
    </Box>
  );
}
