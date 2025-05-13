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
    Checkbox,
    Card,
    CardContent,
    Chip,
    styled,
    LinearProgress,
    Autocomplete,
    type SelectChangeEvent,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
// Add this import at the top of the file with other imports
import DeleteIcon from "@mui/icons-material/Delete";

// Types for API responses
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

// Document data
const germanDocuments = [
    {
        label: "Gewerbeanmeldung",
        description: "Business registration issued in Germany.",
        status: "uploaded",
        filename: "gewerbeanmeldung.pdf",
        note: null,
    },
    {
        label: "Versicherungsnachweis (Betriebshaftpflicht)",
        description: "Commercial liability insurance certificate.",
        status: "not_uploaded",
        filename: null,
        note: null,
    },
    {
        label: "§13b Freistellungsbescheinigung",
        description: "German tax exemption certificate §13b.",
        status: "approved",
        filename: "freistellung-13b.pdf",
        note: "Verified on 01.05.2025",
    },
    {
        label: "§48b Freistellungsbescheinigung",
        description: "German tax exemption certificate §48b.",
        status: "denied",
        filename: "freistellung-48b.pdf",
        note: "Document outdated (expired March 2024).",
    },
    {
        label: "Handwerkskarte (bei Meistergewerken)",
        description: "Craft license required for regulated trades.",
        status: "pending",
        filename: "handwerkskarte.pdf",
        note: null,
    },
];

const foreignDocuments = [
    {
        label: "EU VAT Certificate",
        description: "EU-wide value added tax registration certificate.",
        status: "pending",
        filename: "sample-vat.pdf",
        note: null,
    },
    {
        label: "Declaration of Posted Workers (A1 Certificate)",
        description: "A1 form issued by local authority for cross-border work.",
        status: "denied",
        filename: "posted-workers.pdf",
        note: "Document missing official stamp.",
    },
    {
        label: "Proof of Social Security Registration",
        description:
            "Proof workers are registered under EU/local social insurance.",
        status: "not_uploaded",
        filename: null,
        note: null,
    },
    {
        label: "Business Registration Extract/Certificate",
        description: "Proof of official registration in country of origin.",
        status: "approved",
        filename: "registration-extract.pdf",
        note: "Verified on 01.05.2025",
    },
];

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
        welcome: "Welcome, Mr. Mustermann",
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
        selectRole: "Select Role",
        loadingPositions: "Loading positions...",
        selectRegion: "Select Region",
        loadingRegions: "Loading regions...",
        apartmentNr: "Apartment Number",
        zip: "ZIP Code",
        city: "City",
        website: "Website URL",
        tradeTitle: "Employees per Trade",
        selectTrade: "Select Trade",
        tradeCount: "Number of Employees",
        addTrade: "+ Add Another Trade",
        regions: "Regions Covered",
        legalRep: "Legal Representative",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        phone: "Phone Number",
        role: "Role",
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
    },
};

// API endpoints
const API_BASE_URL = "https://fastapi.gesys.automate-solutions.net/gesys";

// Modify the component state
export default function VendorOnboardingFlow() {
    // Hardcode vendor_id to 15
    const VENDOR_ID = 20;

    // Form state variables
    const [step, setStep] = useState(1);
    const [language, setLanguage] = useState("EN");

    // Form field states
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
    const [vendorEmail, setVendorEmail] = useState("huynhlamduylcd@gmail.com");

    // API data states
    const [country, setCountry] = useState("");
    const [countryId, setCountryId] = useState<number | null>(null);
    const [legalForm, setLegalForm] = useState("");
    const [legalFormId, setLegalFormId] = useState<number | null>(null);
    const [trades, setTrades] = useState<
        { trade: string; count: string; gesys_gewerk_id?: number }[]
    >([]);
    const [selectedRegion, setSelectedRegion] = useState<string>("");
    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
        null
    );
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
    const [_, setVendorDetails] = useState<VendorDetail | null>(null);
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
    const [, setTradesError] = useState<string | null>(null);
    const [federalStatesError, setFederalStatesError] = useState<string | null>(
        null
    );
    const [vendorDetailsError, setVendorDetailsError] = useState<string | null>(
        null
    );
    const [positionsError, setPositionsError] = useState<string | null>(null);
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);

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
                const response = await fetch(`${API_BASE_URL}/gewerks`);
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

    // Fetch vendors
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
                console.error(
                    "Error fetching representative positions:",
                    error
                );
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

    // Fetch vendor details for vendor_id 15
    useEffect(() => {
        const fetchVendorDetails = async () => {
            setLoadingVendorDetails(true);
            setVendorDetailsError(null);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/vendors?vendor_id=${VENDOR_ID}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                if (result.data && result.data.length > 0) {
                    const vendorData = result.data[0];
                    setVendorDetails(vendorData);

                    // Set vendor email
                    if (vendorData.email) {
                        setVendorEmail(vendorData.email);
                    }

                    // Set company name if available
                    if (vendorData.company_name) {
                        setCompanyName(vendorData.company_name);
                    }

                    // Initialize trades from vendor gewerk_ids
                    if (
                        vendorData.gewerk_ids &&
                        vendorData.gewerk_ids.length > 0
                    ) {
                        const initialTrades = vendorData.gewerk_ids.map(
                            (gewerk: any) => ({
                                trade: gewerk.gewerk_name,
                                count: "",
                                gesys_gewerk_id: gewerk.gesys_gewerk_id,
                            })
                        );
                        setTrades(initialTrades);
                    }
                }
            } catch (error) {
                console.error("Error fetching vendor details:", error);
                setVendorDetailsError("Failed to load vendor details");
            } finally {
                setLoadingVendorDetails(false);
            }
        };

        fetchVendorDetails();
    }, [VENDOR_ID]);

    // Update legal form ID when legal form changes
    useEffect(() => {
        const selectedForm = legalForms.find(
            (form) => form.title === legalForm
        );
        if (selectedForm) {
            setLegalFormId(selectedForm.legal_form_id);
        } else {
            setLegalFormId(null);
        }
    }, [legalForm, legalForms]);

    // Update position ID when position changes
    useEffect(() => {
        const selectedPos = positions.find(
            (pos) => pos.title === selectedPosition
        );
        if (selectedPos) {
            setSelectedPositionId(selectedPos.position_id);
        } else {
            setSelectedPositionId(null);
        }
    }, [selectedPosition, positions]);

    const t =
        translations[language as keyof typeof translations] || translations.EN;

    const next = () => setStep(step + 1);
    const back = () => setStep(step - 1);

    // Handle region change
    const handleRegionChange = (event: SelectChangeEvent) => {
        const selectedRegionName = event.target.value;
        setSelectedRegion(selectedRegionName);

        // Find the region ID from the selected region name
        const selectedRegion = federalStates.find(
            (state) =>
                state.german_name === selectedRegionName ||
                state.english_name === selectedRegionName
        );

        if (selectedRegion) {
            setSelectedRegionId(selectedRegion.id);
        } else {
            setSelectedRegionId(null);
        }
    };

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

    // Handle file upload
    const handleFileUpload = (label: string, file: File | null) => {
        if (file) {
            setUploads((prev) => ({ ...prev, [label]: file.name }));
        }
    };

    // Handle document submission
    const handleSubmit = (label: string) => {
        alert(`Simulated submit of: ${label}`);
    };

    // Get the correct document list based on country
    const documentList =
        country === "Germany" ? germanDocuments : foreignDocuments;

    // Check if any document is in "approved" status to enable Continue button
    const getDocumentStatus = () => {
        let approvedCount = 0;

        documentList.forEach((doc) => {
            if (doc.status === "approved") {
                approvedCount++;
            }
        });

        // For simplicity, allow continue if at least one document is approved
        return approvedCount > 0;
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Prepare the request body using state variables
            const requestBody = {
                company_name: companyName,
                street: street,
                zip_code: zipCode,
                federal_state_id: selectedRegionId,
                gewerk_ids: trades
                    .filter((t) => t.gesys_gewerk_id)
                    .map((t) => t.gesys_gewerk_id),
                legal_form_id: legalFormId || 0,
                house_number: houseNumber,
                city: city,
                country_id: countryId,
                website: website,
                // first_name: firstName,
                // last_name: lastName,
                phone: phone,
                role_id: selectedPositionId || 0,
                department: "",
                description: "",
                company_size: 0,
            };

            console.log("Request body:", requestBody);

            // Make the API call
            const response = await fetch(
                `${API_BASE_URL}/vendors/update?vendor_id=${VENDOR_ID}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Update successful:", result);

            // Proceed to next step
            next();
        } catch (error) {
            console.error("Error updating vendor information:", error);
            alert("Failed to update vendor information. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDocumentCard = (document: (typeof germanDocuments)[0]) => {
        const { label, description, status, filename, note } = document;
        const userUploadedFilename = uploads[label];

        // Set styling based on status
        const getStatusStyles = () => {
            switch (status) {
                case "approved":
                    return {
                        bgcolor: "#f1f8e9",
                        border: "1px solid #c5e1a5",
                        icon: <CheckCircleIcon sx={{ color: "#2e7d32" }} />,
                        statusLabel: t.approved,
                        statusColor: "#2e7d32",
                        buttonDisabled: false,
                    };
                case "denied":
                    return {
                        bgcolor: "#ffebee",
                        border: "1px solid #ffcdd2",
                        icon: <ErrorIcon sx={{ color: "#c62828" }} />,
                        statusLabel: t.denied,
                        statusColor: "#c62828",
                        buttonDisabled: false,
                    };
                case "pending":
                    return {
                        bgcolor: "#e3f2fd",
                        border: "1px solid #bbdefb",
                        icon: <HourglassEmptyIcon sx={{ color: "#1565c0" }} />,
                        statusLabel: t.inReview,
                        statusColor: "#1565c0",
                        buttonDisabled: true,
                    };
                case "uploaded":
                    return {
                        bgcolor: "#fff8e1",
                        border: "1px solid #ffe082",
                        icon: <InfoIcon sx={{ color: "#f57c00" }} />,
                        statusLabel: t.uploaded,
                        statusColor: "#f57c00",
                        buttonDisabled: false,
                    };
                default:
                    return {
                        bgcolor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        icon: null,
                        statusLabel: t.notUploaded,
                        statusColor: "#757575",
                        buttonDisabled: false,
                    };
            }
        };

        const styles = getStatusStyles();

        return (
            <Card
                key={label}
                variant="outlined"
                sx={{
                    bgcolor: styles.bgcolor,
                    border: styles.border,
                    borderRadius: 4,
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
                            <Checkbox
                                checked={status === "approved"}
                                disabled={status !== "approved"}
                                sx={{
                                    color:
                                        status === "approved"
                                            ? "#2e7d32"
                                            : "#9e9e9e",
                                    "&.Mui-checked": { color: "#2e7d32" },
                                }}
                            />
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 500, color: "#424242" }}
                                >
                                    {label}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {description}
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

                    {filename && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1,
                                mb: 1,
                                gap: 0.5,
                            }}
                        >
                            <InsertDriveFileIcon
                                fontSize="small"
                                color="action"
                            />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {filename}
                            </Typography>
                        </Box>
                    )}

                    {note && (
                        <Typography
                            variant="caption"
                            sx={{
                                color:
                                    status === "denied"
                                        ? "#c62828"
                                        : "text.secondary",
                                display: "block",
                                mt: 0.5,
                                mb: 1,
                            }}
                        >
                            {status === "approved"
                                ? `✓ ${t.verified} 01.05.2025`
                                : note}
                        </Typography>
                    )}

                    <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mt: 2, mb: 1 }}
                    >
                        {t.uploadNewFile}
                    </Typography>

                    <Box sx={{ mb: 1.5 }}>
                        <label htmlFor={`file-upload-${label}`}>
                            <UploadInput
                                id={`file-upload-${label}`}
                                type="file"
                                onChange={(e) => {
                                    const files = (e.target as HTMLInputElement)
                                        .files;
                                    if (files && files.length > 0) {
                                        handleFileUpload(label, files[0]);
                                    }
                                }}
                            />
                            <CustomFileInput>
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {userUploadedFilename || t.noFileChosen}
                                </Box>
                                <Button
                                    component="span"
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        bgcolor: "#f5f5f5",
                                        color: "#424242",
                                        boxShadow: "none",
                                        "&:hover": {
                                            bgcolor: "#e0e0e0",
                                            boxShadow: "none",
                                        },
                                    }}
                                >
                                    {t.chooseFile}
                                </Button>
                            </CustomFileInput>
                        </label>

                        {userUploadedFilename && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 0.5, display: "block" }}
                            >
                                <InsertDriveFileIcon
                                    fontSize="inherit"
                                    sx={{ verticalAlign: "middle", mr: 0.5 }}
                                />
                                {userUploadedFilename}
                            </Typography>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        size="small"
                        disabled={styles.buttonDisabled}
                        onClick={() => handleSubmit(label)}
                        sx={{
                            bgcolor: styles.buttonDisabled
                                ? "#bdbdbd"
                                : "#F57C00",
                            color: "#fff",
                            "&:hover": {
                                bgcolor: styles.buttonDisabled
                                    ? "#bdbdbd"
                                    : "#EF6C00",
                            },
                            borderRadius: 4,
                            textTransform: "none",
                            px: 2,
                        }}
                    >
                        {t.submit}
                    </Button>
                </CardContent>
            </Card>
        );
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
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
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
                            <MailOutlineIcon
                                sx={{ color: "#F57C00", fontSize: "1.25rem" }}
                            />
                            <Typography variant="caption">{t.sent}</Typography>
                        </StatusIcon>

                        <StatusIcon>
                            <VisibilityIcon
                                sx={{
                                    color: isViewed ? "#F57C00" : "#e0e0e0",
                                    fontSize: "1.25rem",
                                }}
                            />
                            <Typography variant="caption">
                                {t.viewed}
                            </Typography>
                        </StatusIcon>

                        <StatusIcon>
                            <EditIcon
                                sx={{
                                    color: isSigned ? "#F57C00" : "#e0e0e0",
                                    fontSize: "1.25rem",
                                }}
                            />
                            <Typography variant="caption">
                                {t.signed}
                            </Typography>
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
        <Box sx={{ maxWidth: 800, margin: "0 auto", p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
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
                        <Typography variant="body2" color="text.secondary">
                            {t.companyName}
                        </Typography>
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
                                    <InputLabel id="country-label">
                                        {t.country}
                                    </InputLabel>
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
                                            <MenuItem
                                                key={country.country_id}
                                                value={country.name}
                                            >
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
                                            <CircularProgress
                                                size={16}
                                                sx={{ mr: 1 }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {t.loadingCountries}
                                            </Typography>
                                        </Box>
                                    )}
                                    {countriesError && (
                                        <Alert
                                            severity="error"
                                            sx={{ mt: 1, py: 0 }}
                                        >
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
                                        getOptionLabel={(option: any) =>
                                            option.company_name || ""
                                        }
                                        loading={isLoadingVendors}
                                        value={
                                            vendors.find(
                                                (v) =>
                                                    v.company_name ===
                                                    companyName
                                            ) || null
                                        }
                                        onChange={(_, newValue: any) => {
                                            setCompanyName(
                                                newValue
                                                    ? newValue.company_name
                                                    : ""
                                            );
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t.company}
                                                required
                                                value={companyName}
                                                onChange={(e) =>
                                                    setCompanyName(
                                                        e.target.value
                                                    )
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root":
                                                        {
                                                            borderRadius: 4,
                                                        },
                                                }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {isLoadingVendors ? (
                                                                <CircularProgress
                                                                    color="inherit"
                                                                    size={20}
                                                                />
                                                            ) : null}
                                                            {
                                                                params
                                                                    .InputProps
                                                                    .endAdornment
                                                            }
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li
                                                {...props}
                                                key={option.vendor_id}
                                            >
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
                                    <InputLabel id="legal-form-label">
                                        {t.legalForm}
                                    </InputLabel>
                                    <Select
                                        labelId="legal-form-label"
                                        value={legalForm}
                                        label={t.legalForm}
                                        onChange={(e) =>
                                            setLegalForm(e.target.value)
                                        }
                                        sx={{ borderRadius: 4 }}
                                        disabled={loadingLegalForms || !country}
                                    >
                                        <MenuItem value="">
                                            <em>{t.legalForm}</em>
                                        </MenuItem>
                                        {legalForms.map((form) => (
                                            <MenuItem
                                                key={form.legal_form_id}
                                                value={form.title}
                                            >
                                                {form.title} ({form.description}
                                                )
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
                                            <CircularProgress
                                                size={16}
                                                sx={{ mr: 1 }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {t.loadingLegalForms}
                                            </Typography>
                                        </Box>
                                    )}
                                    {legalFormsError && (
                                        <Alert
                                            severity="error"
                                            sx={{ mt: 1, py: 0 }}
                                        >
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
                                    required
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
                                    required
                                    value={houseNumber}
                                    onChange={(e) =>
                                        setHouseNumber(e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        setApartmentNumber(e.target.value)
                                    }
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
                                    required
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
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 500, mb: 1 }}
                                >
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
                                        <CircularProgress
                                            size={20}
                                            sx={{ mr: 1 }}
                                        />
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
                                                    <InputLabel
                                                        id={`trade-label-${i}`}
                                                    >
                                                        {t.selectTrade}
                                                    </InputLabel>
                                                    <Select
                                                        labelId={`trade-label-${i}`}
                                                        value={item.trade}
                                                        label={t.selectTrade}
                                                        onChange={(e) =>
                                                            updateTrade(
                                                                i,
                                                                "trade",
                                                                e.target.value
                                                            )
                                                        }
                                                        sx={{ borderRadius: 4 }}
                                                        disabled={
                                                            !!item.gesys_gewerk_id ||
                                                            loadingTrades
                                                        }
                                                    >
                                                        <MenuItem value="">
                                                            <em>
                                                                {t.selectTrade}
                                                            </em>
                                                        </MenuItem>
                                                        {/* Filter trade options to keep current selection and remove ones used elsewhere */}
                                                        {tradeOptions
                                                            .filter(
                                                                (option) => {
                                                                    // "used elsewhere"?
                                                                    const usedByAnotherRow =
                                                                        trades.some(
                                                                            (
                                                                                t,
                                                                                idx
                                                                            ) =>
                                                                                idx !==
                                                                                    i &&
                                                                                t.gesys_gewerk_id ===
                                                                                    option.gesys_gewerk_id
                                                                        );
                                                                    // keep this row's current pick, or anything not used by another
                                                                    return (
                                                                        option.gewerk_name ===
                                                                            item.trade ||
                                                                        !usedByAnotherRow
                                                                    );
                                                                }
                                                            )
                                                            .map((trade) => (
                                                                <MenuItem
                                                                    key={
                                                                        trade.gesys_gewerk_id
                                                                    }
                                                                    value={
                                                                        trade.gewerk_name
                                                                    }
                                                                >
                                                                    {
                                                                        trade.gewerk_name
                                                                    }
                                                                </MenuItem>
                                                            ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={5}>
                                                <TextField
                                                    fullWidth
                                                    label={t.tradeCount}
                                                    value={item.count}
                                                    onChange={(e) =>
                                                        updateTrade(
                                                            i,
                                                            "count",
                                                            e.target.value
                                                        )
                                                    }
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            { borderRadius: 4 },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() =>
                                                        handleDeleteTrade(i)
                                                    }
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

                            <Grid item xs={12}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 500, mb: 1 }}
                                >
                                    {t.legalRep}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t.firstName}
                                    required
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
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
                                    required
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
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
                                    required
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
                                    <InputLabel id="role-label">
                                        {t.role}
                                    </InputLabel>
                                    <Select
                                        labelId="role-label"
                                        value={selectedPosition}
                                        label={t.role}
                                        onChange={(e) =>
                                            setSelectedPosition(e.target.value)
                                        }
                                        sx={{ borderRadius: 4 }}
                                        disabled={loadingPositions}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {t.selectRole || "Select Role"}
                                            </em>
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
                                            <CircularProgress
                                                size={16}
                                                sx={{ mr: 1 }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {t.loadingPositions ||
                                                    "Loading positions..."}
                                            </Typography>
                                        </Box>
                                    )}
                                    {positionsError && (
                                        <Alert
                                            severity="error"
                                            sx={{ mt: 1, py: 0 }}
                                        >
                                            <Typography variant="caption">
                                                {positionsError}
                                            </Typography>
                                        </Alert>
                                    )}
                                </FormControl>
                            </Grid>

                            {/* Regions Covered field */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="region-label">
                                        {t.regions}
                                    </InputLabel>
                                    <Select
                                        labelId="region-label"
                                        value={selectedRegion}
                                        label={t.regions}
                                        onChange={handleRegionChange}
                                        sx={{ borderRadius: 4 }}
                                        disabled={loadingFederalStates}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {t.selectRegion ||
                                                    "Select Region"}
                                            </em>
                                        </MenuItem>
                                        {federalStates.map((state) => (
                                            <MenuItem
                                                key={state.id}
                                                value={state.german_name}
                                            >
                                                {state.german_name} (
                                                {state.english_name})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {loadingFederalStates && (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mt: 1,
                                            }}
                                        >
                                            <CircularProgress
                                                size={16}
                                                sx={{ mr: 1 }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {t.loadingRegions ||
                                                    "Loading regions..."}
                                            </Typography>
                                        </Box>
                                    )}
                                    {federalStatesError && (
                                        <Alert
                                            severity="error"
                                            sx={{ mt: 1, py: 0 }}
                                        >
                                            <Typography variant="caption">
                                                {federalStatesError}
                                            </Typography>
                                        </Alert>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleFormSubmit}
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
                                        <CircularProgress
                                            size={24}
                                            color="inherit"
                                        />
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
                        <Typography variant="body2" color="text.secondary">
                            {t.uploadDocumentsSubtitle}
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

                    <Grid container spacing={3}>
                        {documentList.map((doc) => (
                            <Grid item xs={12} sm={6} key={doc.label}>
                                {renderDocumentCard(doc)}
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
                            <Typography
                                component="span"
                                sx={{ fontWeight: 600 }}
                            >
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
