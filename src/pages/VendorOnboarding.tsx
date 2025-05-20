"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
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
  OutlinedInput,
  IconButton,
  InputAdornment,
  Slider,
} from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import AddIcon from "@mui/icons-material/Add";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import { useContext } from "react";
import { AuthContext } from "../App";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import logoImage from "../assets/logo.png"; // Import the logo at the top of your file
import HelpIcon from "@mui/icons-material/HelpOutline"; // Types for API responses
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { color } from "@mui/system";
import { VisibilityOff, Visibility } from "@mui/icons-material";

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

// Add a new interface for vendor details with gewerk_ids
interface VendorDetail {
  vendor_id: number;
  contact_user_id: number;
  onboarding_status_id: number;
  legal_form_id: number | null;
  country_id: number | null;
  gewerk_ids: {
    scope_id: number | null;
    gewerk_name: string;
    gesys_gewerk_id: number;
  }[];
  name: string | null;
  company_name: string | null;
  email: string;
  phone: string | null;
  department: string | null;
  description: string | null;
  address: string | null;
  company_size: string | null;
  website: string | null;
  contact_user: string | null;
  contact_user_role: string | null;
  country_name: string | null;
}

// Update the Vendor interface
interface Vendor {
  vendor_id: number;
  company_name: string | null;
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
}

interface DocumentWithType {
  type_id: number;
  title: string;
  country_id: number;
  document: Document | null;
}

// Contract data
const contracts = [
  {
    title: "Photovoltaik Framework Agreement",
    email: "jonas.mueller@example.com",
    status: ["Sent", "Viewed", "Signed"],
  },
  {
    title: "Heat Pump Framework Agreement",
    email: "jonas.mueller@example.com",
    status: ["Sent", "Viewed", "Signed"],
  },
  {
    title: "Appendix incl. Price List",
    email: "jonas.mueller@example.com",
    status: ["Sent", "Viewed"],
  },
  {
    title: "NDA",
    email: "jonas.mueller@example.com",
    status: ["Sent", "Viewed", "Signed"],
  },
  {
    title: "Non-solicitation Agreement (Abwehrverbot)",
    email: "jonas.mueller@example.com",
    status: ["Sent", "Viewed", "Signed"],
  },
];

// Styled components
const StepperContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ActiveStep = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const FormContainer = styled("form")(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const UploadInput = styled("input")({
  display: "none",
});

const CustomFileInput = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: "8px",
  border: `1px solid ${theme.palette.divider}`,
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

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

// Translation data
const translations = {
  EN: {
    welcome: "Welcome at Galvanek Atlas",
    companyName: "SolarService GmbH",
    infoBox:
      "Please fill out the form below to provide your company's information and upload all required documents.",
    step1: "Company Details",
    step2: "Document Upload",
    step3: "Contract Signature",
    country: "Select Country",
    company: "Company Name",
    legalForm: "Select Legal Form",
    taxId: "Tax ID",
    street: "Street",
    houseNr: "House Number",
    apartmentNr: "Apartment Number",
    zip: "ZIP Code",
    city: "City",
    website: "Website URL",
    tradeTitle: "Employees per Trade",
    selectTrade: "Select Trade",
    tradeCount: "Number of Employees",
    addTrade: "Add Another Trade",
    regions: "Regions Covered",
    legalRep: "Legal Representative",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone Number",
    position: "Position",
    department: "Department",
    continue: "Continue",
    back: "Back",
    uploadDocumentsTitle: "Upload Required Documents",
    uploadDocumentsSubtitle:
      "Please upload your business documents for verification.",
    uploadNewFile: "Upload New File",
    submit: "Submit",
    chooseFile: "Choose file",
    noFileChosen: "No file chosen",
    notUploaded: "Not Uploaded Yet",
    uploaded: "Uploaded",
    approved: "Approved",
    denied: "Denied",
    inReview: "In Review",
    verified: "Verified on",
    contractSigningTitle: "Contract Signing Dashboard",
    contractSigningSubtitle: "Manage and track your contract signatures",
    dataEntry: "1. Data Entry",
    documentUpload: "2. Document Upload",
    signContracts: "3. Sign Contracts",
    contractsSentTo: "Contracts were sent to",
    pleaseSignAll: "Please sign all contracts (including the mandatory",
    toProceed: "to proceed.",
    signatureProgress: "Signature progress:",
    sent: "Sent",
    viewed: "Viewed",
    signed: "Signed",
    completed: "Completed",
    awaitingSignature: "Awaiting Signature",
    loadingCountries: "Loading countries...",
    loadingLegalForms: "Loading legal forms...",
    loadingTrades: "Loading trades...",
    errorLoading: "Error loading data. Please try again.",
    loadingRegions: "Loading regions...",
    selectRole: "Select roles",
    loadingPositions: "Loading positions...",
  },
};

// API endpoints
const API_BASE_URL = "https://fastapi.gesys.automate-solutions.net/gesys";

// Modify the component state
export default function VendorOnboardingFlow() {
  const { logout } = useContext(AuthContext);

  // Add logout handler function
  const handleLogout = () => {
    logout();
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
  const [documentNames, setDocumentNames] = useState<Record<number, string>>(
    {}
  );
  const [expiryDates, setExpiryDates] = useState<Record<number, string>>({});

  /* -------------------------------------------------------------------------- */
  /*                           // Form state variables                          */
  /* -------------------------------------------------------------------------- */
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("vendorOnboardingStep");
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [language, setLanguage] = useState("EN");

  // Create a custom function to update step that also saves to localStorage
  const updateStep = (newStep: number) => {
    setStep(newStep);
    localStorage.setItem("vendorOnboardingStep", newStep.toString());
  };

  /* -------------------------------------------------------------------------- */
  /*                            // Form field states                            */
  /* -------------------------------------------------------------------------- */
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
  const [postalCode, setPostalCode] = useState({
    code: "",
    radius: 0,
  });
  const [isAddedCode, setIsAddedCode] = useState(false);

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
  const [uploads, setUploads] = useState<Record<string, string>>({});

  // API data
  const [countries, setCountries] = useState<Country[]>([]);
  const [legalForms, setLegalForms] = useState<LegalForm[]>([]);
  const [tradeOptions, setTradeOptions] = useState<Trade[]>([]);
  const [federalStates, setFederalStates] = useState<FederalState[]>([]);
  const [vendorDetails, setVendorDetails] = useState<VendorDetail | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [positions, setPositions] = useState<RepresentativePosition[]>([]);

  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingLegalForms, setLoadingLegalForms] = useState(false);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [loadingFederalStates, setLoadingFederalStates] = useState(false);
  const [loadingVendorDetails, setLoadingVendorDetails] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
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
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [isLoadingVendorId, setIsLoadingVendorId] = useState(false);
  const [vendorIdError, setVendorIdError] = useState<string | null>(null);

  /* -------------------------------------------------------------------------- */
  /*                                For screen 2                                */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!vendorId || step !== 2) return;

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

  const renderDocumentCard = (docType: DocumentType) => {
    const { type_id, title, mandatory } = docType;
    const document = getDocumentForType(type_id);
    const status = document?.document_status?.title || "Not Uploaded";
    const fileName = document?.name || "";
    const url = document?.url || "";
    const isUploading = uploadingDoc[type_id] || false;
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
              <Tooltip title="Document approved" placement="bottom" arrow>
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
            statusLabel: "Approved",
            statusColor: "#2e7d32",
            buttonDisabled: true,
          };
        case "denied":
        case "rejected":
          return {
            bgcolor: "#ffebee",
            border: "1px solid #ffcdd2",
            icon: (
              <HelpIcon
                sx={{
                  color: "#2563eb",
                  background: "#dbeafe",
                  borderRadius: 50,
                  padding: 0.3,
                }}
              />
            ),
            statusLabel: "Denied",
            statusColor: "#c62828",
            buttonDisabled: false,
          };
        case "pending":
          return {
            bgcolor: "#e3f2fd",
            border: "1px solid #bbdefb",
            icon: (
              <HelpIcon
                sx={{
                  color: "#2563eb",
                  background: "#dbeafe",
                  borderRadius: 50,
                  padding: 0.3,
                }}
              />
            ),
            statusLabel: "In Review",
            statusColor: "#1565c0",
            buttonDisabled: false,
          };
        default:
          return {
            bgcolor: "#f5f5f5",
            border: "1px solid #e0e0e0",
            icon: (
              <HelpIcon
                sx={{
                  color: "#2563eb",
                  background: "#dbeafe",
                  borderRadius: 50,
                  padding: 0.3,
                }}
              />
            ),
            statusLabel: "Not Uploaded",
            statusColor: "#757575",
            buttonDisabled: false,
          };
      }
    };

    const styles = getStatusStyles();

    return (
      <Card
        key={type_id}
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
              {/* <Checkbox
                checked={status.toLowerCase() === "approved"}
                disabled={status.toLowerCase() !== "approved"}
                sx={{
                  color:
                    status.toLowerCase() === "approved" ? "#2e7d32" : "#9e9e9e",
                  "&.Mui-checked": { color: "#2e7d32" },
                }}
              /> */}
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
                {/* <Typography variant="body2" color="text.secondary">
                  {mandatory ? "Required document" : "Optional document"}
                </Typography> */}
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
                  textDecoration: url ? "underline" : "none",
                  cursor: url ? "pointer" : "default",
                  "&:hover": {
                    color: url ? "primary.main" : "text.secondary",
                  },
                }}
                onClick={() => url && window.open(url, "_blank")}
              >
                {fileName} {url && "(Click to view)"}
              </Typography>
            </Box>
          )}

          {/* {document?.document_status?.description && (
            <Typography
              variant="caption"
              sx={{
                color:
                  status.toLowerCase() === "denied" ||
                  status.toLowerCase() === "rejected"
                    ? "#c62828"
                    : "text.secondary",
                display: "block",
                mt: 0.5,
                mb: 1,
              }}
            >
              {document.document_status.description}
            </Typography>
          )} */}

          {/* <Divider sx={{ my: 2 }} /> */}

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
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      handleFileSelection(type_id, files[0]);
                    }
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
                  }}
                >
                  {selectedFile ? selectedFile.name : "Select PDF File"}
                </Button>
              </label>

              <Button
                variant="contained"
                disabled={isUploading || !selectedFile || styles.buttonDisabled}
                onClick={() => handleDocumentUpload(type_id)}
                sx={{
                  bgcolor: styles.buttonDisabled ? "#bdbdbd" : "#F57C00",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: styles.buttonDisabled ? "#bdbdbd" : "#EF6C00",
                  },
                  borderRadius: 4,
                  //whiteSpace: "nowrap",
                }}
              >
                {isUploading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Upload"
                )}
              </Button>
            </Box>
          )}

          {showSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Document uploaded successfully
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  // Handle file selection
  const handleFileSelection = (typeId: number, file: File | null) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [typeId]: file,
    }));
  };

  const handleDocumentUpload = async (typeId: number) => {
    if (!vendorId) {
      alert("Vendor ID not available. Please try again later.");
      return;
    }

    const file = selectedFiles[typeId];

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

      const result = await response.json();
      //console.log("Upload successful:", result);

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

  // Handle dropdown closing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showVendorDropdown && !target.closest('input[type="text"]')) {
        setShowVendorDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVendorDropdown]);

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

  // Fetch vendors to get all companies name
  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoadingVendors(true);
      try {
        const response = await fetch(`${API_BASE_URL}/vendors`);
        const result = await response.json();
        if (result.data) {
          setVendors(
            result.data.map((vendor: any) => ({
              vendor_id: vendor.vendor_id,
              company_name: vendor.company_name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setIsLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  // fetching vendor details:
  useEffect(() => {
    const fetchVendorIdByEmail = async () => {
      setIsLoadingVendorId(true);
      setVendorIdError(null);

      try {
        // Get the email of the logged-in user
        const userEmail = localStorage.getItem("userEmail");

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
        console.log("Vendor data:", result);

        if (result.data) {
          // Set vendor ID
          if (result.data.vendor_id) {
            setVendorId(result.data.vendor_id);
          }

          // Prefill form fields with vendor data
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
                ? "1"
                : result.data.cover_region === "State"
                ? "2"
                : "3"
            );
          if (result.data.postcode) {
            setPostalCode({
              code: result.data.postcode,
              radius: result.data.radius,
            });
            setIsAddedCode(true);
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
            // Find legal form from ID (will be populated after country is set)
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
            // Set role
            // if (
            //     result.data.contact_user.role &&
            //     result.data.contact_user.role.title
            // ) {
            //     setSelectedPosition(
            //         result.data.contact_user.role.title
            //     );
            // }
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
  }, [countries]);

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

  const t =
    translations[language as keyof typeof translations] || translations.EN;

  const next = () => updateStep(step + 1);
  const back = () => updateStep(step - 1);

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
      return;
    }
    // Validate mandatory fields
    if (!country) {
      alert("Please select a country");
      return;
    }

    if (!legalForm) {
      alert("Please select a legal form");
      return;
    }

    if (!selectedPosition) {
      alert("Please select a position");
      return;
    }

    // Check if any trade has a null, undefined, or empty count
    const hasEmptyTradeCount = trades.some(
      (trade) =>
        trade.count === null || trade.count === undefined || trade.count === ""
    );

    // Example usage in validation
    if (hasEmptyTradeCount) {
      alert("Please enter employee count for all trades");
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
        website_url: website || "", // Note the name change from website to website_url
        cover_region:
          region === "1"
            ? "NationalWide"
            : region === "2"
            ? "State"
            : "PostCode",
        postcode: region === "3" ? postalCode.code : "",
        radius: region === "3" ? postalCode.radius : "",
      };

      // Make the API call
      const vendorResponse = await fetch(
        `${API_BASE_URL}/vendors/update?vendor_id=${vendorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vendorRequestBody),
        }
      );

      if (!vendorResponse.ok) {
        throw new Error(`HTTP error! Status: ${vendorResponse.status}`);
      }

      const vendorResult = await vendorResponse.json();
      //console.log("Vendor update successful:", vendorResult);

      // Now prepare and send the legal representative (user) update request
      // Get the user email and access token from localStorage
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
          //console.log("User update successful:", userResult);
        }
      } else {
        console.error("User email or access token not found in localStorage");
      }

      // Proceed to next step
      next();
    } catch (error) {
      console.error("Error updating vendor information:", error);
      alert("Failed to update vendor information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContractCard = (contract: (typeof contracts)[0]) => {
    const { title, status } = contract;
    const isSigned = status.includes("Signed");
    const isViewed = status.includes("Viewed");

    // Calculate progress value
    let progressValue = 33.3; // Sent
    if (isViewed) progressValue = 66.6; // Viewed
    if (isSigned) progressValue = 100; // Signed

    return (
      <Card variant="outlined" sx={{ borderRadius: 4, height: "100%" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t.signatureProgress}
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
              <Typography variant="caption">{t.sent}</Typography>
            </StatusIcon>

            <StatusIcon>
              <VisibilityIcon
                sx={{
                  color: isViewed ? "#F57C00" : "#e0e0e0",
                  fontSize: "1.25rem",
                }}
              />
              <Typography variant="caption">{t.viewed}</Typography>
            </StatusIcon>

            <StatusIcon>
              <EditIcon
                sx={{
                  color: isSigned ? "#F57C00" : "#e0e0e0",
                  fontSize: "1.25rem",
                }}
              />
              <Typography variant="caption">{t.signed}</Typography>
            </StatusIcon>
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: isSigned ? "#F57C00" : "#ffc107",
            }}
          >
            {isSigned ? t.completed : t.awaitingSignature}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: "0 auto", p: 2 }}>
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
          <FormControl size="small" sx={{ width: 120 }}>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as string)}
              sx={{ borderRadius: 4 }}
            >
              <MenuItem value="EN">English</MenuItem>
              <MenuItem value="DE">Deutsch</MenuItem>
              <MenuItem value="PL">Polski</MenuItem>
              <MenuItem value="SK">Slovenský</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: 4,
              borderColor: "#ffcdd2",
              color: "#d32f2f",
              "&:hover": {
                backgroundColor: "#ffebee",
                borderColor: "#ef9a9a",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Step 1: Company Details */}
      {step === 1 && (
        <Box>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {t.welcome}
            </Typography>
            {companyName && (
              <Typography variant="body2" color="text.secondary">
                {companyName}
              </Typography>
            )}
          </Box>
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
            {t.infoBox}
          </Alert>

          <StepperContainer>
            <Stepper activeStep={0} alternativeLabel>
              <Step>
                <StepLabel>
                  <ActiveStep>{t.step1}</ActiveStep>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>{t.step2}</StepLabel>
              </Step>
              <Step>
                <StepLabel>{t.step3}</StepLabel>
              </Step>
            </Stepper>
          </StepperContainer>

          <FormContainer>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="country-label">{t.country}</InputLabel>
                  <Select
                    labelId="country-label"
                    value={country}
                    label={t.country}
                    onChange={handleCountryChange}
                    sx={{ borderRadius: 4 }}
                    disabled={loadingCountries}
                  >
                    <MenuItem value="">
                      <em>{t.country}</em>
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.country_id} value={country.name}>
                        {country.name}
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
                        {t.loadingCountries}
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
                  <Autocomplete
                    id="company-name-autocomplete"
                    options={vendors}
                    getOptionLabel={(option: any) => option.company_name || ""}
                    loading={isLoadingVendors}
                    value={
                      vendors.find((v) => v.company_name === companyName) ||
                      null
                    }
                    onChange={(event, newValue: any) => {
                      setCompanyName(newValue ? newValue.company_name : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t.company}
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 4,
                          },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingVendors ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.vendor_id}>
                        {option.company_name}
                      </li>
                    )}
                    freeSolo
                    autoHighlight
                    autoComplete
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth disabled={!country}>
                  <InputLabel id="legal-form-label">{t.legalForm}</InputLabel>
                  <Select
                    labelId="legal-form-label"
                    value={legalForm}
                    required
                    label={t.legalForm}
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
                    }}
                    sx={{ borderRadius: 4 }}
                    disabled={loadingLegalForms || !country}
                  >
                    <MenuItem value="">
                      <em>{t.legalForm}</em>
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
                        {t.loadingLegalForms}
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
                  label={t.taxId}
                  required
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
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
                  label={t.street}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
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
                  label={t.houseNr}
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
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
                  label={t.apartmentNr}
                  value={apartmentNumber}
                  onChange={(e) => setApartmentNumber(e.target.value)}
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
                  label={t.zip}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
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
                  label={t.city}
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
                  label={t.website}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
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
                  {t.tradeTitle}
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
                      Loading vendor trades...
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
                      <Grid item xs={5}>
                        <FormControl fullWidth>
                          <InputLabel id={`trade-label-${i}`}>
                            {t.selectTrade}
                          </InputLabel>
                          <Select
                            labelId={`trade-label-${i}`}
                            value={item.trade}
                            label={t.selectTrade}
                            onChange={(e) =>
                              updateTrade(i, "trade", e.target.value)
                            }
                            sx={{ borderRadius: 4 }}
                            disabled={!!item.gesys_gewerk_id || loadingTrades}
                          >
                            <MenuItem value="">
                              <em>{t.selectTrade}</em>
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
                                  {trade.gewerk_name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          required
                          label={t.tradeCount}
                          value={item.count}
                          onChange={(e) =>
                            updateTrade(i, "count", e.target.value)
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 4 },
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteTrade(i)}
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
                  {t.addTrade}
                </Button>
              </Grid>

              {/* Regions Covered field - Multiple Select */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  {t.regions}
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
                            <LanguageOutlinedIcon sx={{ fontSize: 20 }} />
                            Nationwide
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
                            <MapOutlinedIcon sx={{ fontSize: 20 }} />
                            States
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
                            <PlaceOutlinedIcon sx={{ fontSize: 20 }} />
                            Postcode
                          </span>
                        }
                        value="3"
                      />
                    </TabList>
                    <TabPanel value="1">
                      Your services reach the whole country
                    </TabPanel>
                    <TabPanel value="2">
                      <Typography sx={{ mb: 2 }}>
                        If you operate in specific postal code areas, switch to
                        the Postcode tab.
                      </Typography>
                      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                        {federalStates.map((state) => (
                          <Box
                            key={state.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
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
                              {t.loadingRegions || "Loading regions..."}
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
                    <TabPanel value="3">
                      <Typography sx={{ mb: 2 }}>
                        If you cover entire states, switch to the States tab.
                      </Typography>

                      {isAddedCode ? (
                        <Box
                          sx={{
                            mt: 1,
                            border: "1px solid #e0e0e0",
                            borderRadius: 2,
                            p: 0.5,
                          }}
                        >
                          <Typography sx={{ p: 1 }}>
                            {postalCode.code}
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
                              value={postalCode.radius}
                              aria-label="Small"
                              size="small"
                              valueLabelDisplay="auto"
                              onChange={(_event, value) =>
                                setPostalCode({
                                  ...postalCode,
                                  radius: parseInt(value.toString()),
                                })
                              }
                              min={1}
                              sx={{ width: "80%" }}
                            />
                            <Typography>Radius: {postalCode.radius}</Typography>
                          </Box>
                          <Button
                            variant="text"
                            onClick={() => {
                              setPostalCode({
                                code: "",
                                radius: 0,
                              });
                              setIsAddedCode(false);
                            }}
                            sx={{ color: "red" }}
                          >
                            Remove
                          </Button>
                        </Box>
                      ) : (
                        <FormControl variant="outlined" fullWidth size="small">
                          <InputLabel>Enter postcode</InputLabel>
                          <OutlinedInput
                            id="outlined-adornment-password"
                            value={postalCode.code}
                            onChange={(e) => {
                              setPostalCode({
                                ...postalCode,
                                code: e.target.value,
                              });
                            }}
                            disabled={isAddedCode}
                            endAdornment={
                              <InputAdornment position="end">
                                <Button
                                  onClick={() => {
                                    if (!postalCode.code) {
                                      alert("Please enter a postcode");
                                      return;
                                    }
                                    setIsAddedCode(true);
                                  }}
                                >
                                  Add
                                </Button>
                              </InputAdornment>
                            }
                            label="Enter postcode"
                          />
                        </FormControl>
                      )}
                    </TabPanel>
                  </TabContext>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  {t.legalRep}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  label={t.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                  label={t.email}
                  type="email"
                  value={vendorEmail}
                  InputProps={{
                    readOnly: true,
                  }}
                  required
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
                  label={t.phone}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">{t.position}</InputLabel>
                  <Select
                    labelId="role-label"
                    value={selectedPosition}
                    required
                    label={t.position}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    sx={{ borderRadius: 4 }}
                    disabled={loadingPositions}
                  >
                    <MenuItem value="">
                      <em>{t.selectRole || "Select Role"}</em>
                    </MenuItem>
                    {positions.map((position) => (
                      <MenuItem
                        key={position.position_id}
                        value={position.title}
                      >
                        {position.title}
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
                        {t.loadingPositions || "Loading positions..."}
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

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleFormSubmit} // TODO: change to handleSubmit function
                  disabled={isSubmitting}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 4,
                    backgroundColor: "#F57C00",
                    "&:hover": {
                      backgroundColor: "#EF6C00",
                    },
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t.continue
                  )}
                </Button>
              </Grid>
            </Grid>
          </FormContainer>
        </Box>
      )}

      {/* Step 2: Document Upload */}
      {step === 2 && (
        <Box>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {t.uploadDocumentsTitle}
            </Typography>
          </Box>

          <StepperContainer>
            <Stepper activeStep={1} alternativeLabel>
              <Step>
                <StepLabel>{t.step1}</StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <ActiveStep>{t.step2}</ActiveStep>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>{t.step3}</StepLabel>
              </Step>
            </Stepper>
          </StepperContainer>

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
                Loading required documents...
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
                Loading required documents...
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={back}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 4,
                borderColor: "#e0e0e0",
                color: "#616161",
                "&:hover": {
                  borderColor: "#bdbdbd",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              {t.back}
            </Button>
            <Button
              variant="contained"
              onClick={next}
              disabled={!getDocumentStatus()}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 4,
                backgroundColor: "#F57C00",
                "&:hover": {
                  backgroundColor: "#EF6C00",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#e0e0e0",
                  color: "#9e9e9e",
                },
              }}
            >
              {t.continue}
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 3: Contract Signature */}
      {step === 3 && (
        <Box>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {t.welcome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.companyName}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1,
              }}
            >
              {t.contractSigningTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t.contractSigningSubtitle}
            </Typography>
          </Box>

          <StepperContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#F57C00", fontWeight: 500 }}
              >
                {t.dataEntry}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#F57C00", fontWeight: 500 }}
              >
                {t.documentUpload}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#F57C00", fontWeight: 500 }}
              >
                {t.signContracts}
              </Typography>
            </Box>
            <StyledLinearProgress
              variant="determinate"
              value={100}
              sx={{ mb: 3 }}
            />
          </StepperContainer>

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
            <Typography variant="body2">
              {t.contractsSentTo}
              <Typography
                component="span"
                sx={{ fontWeight: 600, color: "#F57C00" }}
              >
                jonas.mueller@example.com
              </Typography>
              .<br />
              {t.pleaseSignAll}
              <Typography component="span" sx={{ fontWeight: 600 }}>
                Non-solicitation Agreement (Abwehrverbot)
              </Typography>
              ) {t.toProceed}
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {contracts.map((contract) => (
              <Grid item xs={12} sm={4} key={contract.title}>
                {renderContractCard(contract)}
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={back}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 4,
                borderColor: "#e0e0e0",
                color: "#616161",
                "&:hover": {
                  borderColor: "#bdbdbd",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              {t.back}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
