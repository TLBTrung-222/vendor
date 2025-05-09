"use client";

import { useState } from "react";
import {
    Box,
    Typography,
    Paper,
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
    ListItemText,
    Checkbox,
    OutlinedInput,
    Card,
    CardContent,
    Chip,
    styled,
    LinearProgress,
    type SelectChangeEvent,
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

// Data
const legalFormsByCountry = {
    Germany: [
        "Einzelunternehmen",
        "GbR (Gesellschaft bürgerlichen Rechts)",
        "GmbH (Gesellschaft mit beschränkter Haftung)",
        "UG (haftungsbeschränkt)",
        "OHG (Offene Handelsgesellschaft)",
        "KG (Kommanditgesellschaft)",
    ],
    Poland: [
        "JDG (Jednoosobowa działalność gospodarcza)",
        "Sp. z o.o. (Spółka z ograniczoną odpowiedzialnością)",
        "Spółka cywilna (s.c.)",
        "Spółka jawna (sp.j.)",
        "Spółka komandytowa (sp.k.)",
        "Spółka akcyjna (S.A.)",
    ],
    Slovakia: [
        "živnosť",
        "s.r.o. (Spoločnosť s ručením obmedzeným)",
        "v.o.s. (verejná obchodná spoločnosť)",
        "k.s. (komanditná spoločnosť)",
        "a.s. (akciová spoločnosť)",
    ],
};

const germanRegions = [
    "Baden-Württemberg",
    "Bayern",
    "Berlin",
    "Brandenburg",
    "Bremen",
    "Hamburg",
    "Hessen",
    "Mecklenburg-Vorpommern",
    "Niedersachsen",
    "Nordrhein-Westfalen",
    "Rheinland-Pfalz",
    "Saarland",
    "Sachsen",
    "Sachsen-Anhalt",
    "Schleswig-Holstein",
    "Thüringen",
];

const tradesOptions = [
    "Electrical",
    "Roofing",
    "Heating",
    "Plumbing",
    "Carpentry",
    "PV Installation",
];

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

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

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
    },
};

export default function VendorOnboardingFlow() {
    const [step, setStep] = useState(1);
    const [country, setCountry] = useState("Germany");
    const [legalForm, setLegalForm] = useState("");
    const [trades, setTrades] = useState([{ trade: "", count: "" }]);
    const [language, setLanguage] = useState("EN");
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [uploads, setUploads] = useState<Record<string, string>>({});

    const t =
        translations[language as keyof typeof translations] || translations.EN;

    const next = () => setStep(step + 1);
    const back = () => setStep(step - 1);

    const addTrade = () => setTrades([...trades, { trade: "", count: "" }]);

    const updateTrade = (index: number, field: string, value: string) => {
        const updated = [...trades];
        updated[index][field as keyof (typeof updated)[0]] = value;
        setTrades(updated);
    };

    const handleRegionChange = (
        event: SelectChangeEvent<typeof selectedRegions>
    ) => {
        const {
            target: { value },
        } = event;
        setSelectedRegions(
            typeof value === "string" ? value.split(",") : value
        );
    };

    const handleFileUpload = (label: string, file: File | null) => {
        if (file) {
            setUploads((prev) => ({ ...prev, [label]: file.name }));
        }
    };

    const handleSubmit = (label: string) => {
        alert(`Simulated submit of: ${label}`);
    };

    // Get the correct document list based on country
    const documentList =
        country === "Germany" ? germanDocuments : foreignDocuments;

    // Check if any document is in "approved" status to enable Continue button
    const getDocumentStatus = () => {
        let approvedCount = 0;
        const totalRequired = documentList.length;

        documentList.forEach((doc) => {
            if (doc.status === "approved") {
                approvedCount++;
            }
        });

        // For simplicity, allow continue if at least one document is approved
        // In a real app, you might have different requirements
        return approvedCount > 0;
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
                                        onChange={(e) => {
                                            setCountry(e.target.value);
                                            setLegalForm("");
                                        }}
                                        sx={{ borderRadius: 4 }}
                                    >
                                        <MenuItem value="">
                                            <em>{t.country}</em>
                                        </MenuItem>
                                        <MenuItem value="Germany">
                                            Germany
                                        </MenuItem>
                                        <MenuItem value="Poland">
                                            Poland
                                        </MenuItem>
                                        <MenuItem value="Slovakia">
                                            Slovakia
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={t.company}
                                    required
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 4,
                                        },
                                    }}
                                />
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
                                    >
                                        <MenuItem value="">
                                            <em>{t.legalForm}</em>
                                        </MenuItem>
                                        {country &&
                                            legalFormsByCountry[
                                                country as keyof typeof legalFormsByCountry
                                            ].map((form, i) => (
                                                <MenuItem key={i} value={form}>
                                                    {form}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={t.taxId}
                                    required
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
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 4,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 500, mb: 1 }}
                                >
                                    {t.tradeTitle}
                                </Typography>
                                {trades.map((item, i) => (
                                    <Grid
                                        container
                                        spacing={2}
                                        key={i}
                                        sx={{ mb: 2 }}
                                    >
                                        <Grid item xs={6}>
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
                                                >
                                                    <MenuItem value="">
                                                        <em>{t.selectTrade}</em>
                                                    </MenuItem>
                                                    {tradesOptions.map(
                                                        (option, idx) => (
                                                            <MenuItem
                                                                key={idx}
                                                                value={option}
                                                            >
                                                                {option}
                                                            </MenuItem>
                                                        )
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
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
                                    </Grid>
                                ))}
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
                                <FormControl fullWidth>
                                    <InputLabel id="regions-label">
                                        {t.regions}
                                    </InputLabel>
                                    <Select
                                        labelId="regions-label"
                                        multiple
                                        value={selectedRegions}
                                        onChange={handleRegionChange}
                                        input={
                                            <OutlinedInput label={t.regions} />
                                        }
                                        renderValue={(selected) =>
                                            selected.join(", ")
                                        }
                                        MenuProps={MenuProps}
                                        sx={{ borderRadius: 4 }}
                                    >
                                        {germanRegions.map((region) => (
                                            <MenuItem
                                                key={region}
                                                value={region}
                                            >
                                                <Checkbox
                                                    checked={
                                                        selectedRegions.indexOf(
                                                            region
                                                        ) > -1
                                                    }
                                                />
                                                <ListItemText
                                                    primary={region}
                                                />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
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
                                    required
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
                                    label={t.phone}
                                    required
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
                                    label={t.role}
                                    required
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
                                    label={t.department}
                                    required
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 4,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={next}
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
                                    {t.continue}
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
                            {t.contractsSentTo}{" "}
                            <Typography
                                component="span"
                                sx={{ fontWeight: 600, color: "#F57C00" }}
                            >
                                jonas.mueller@example.com
                            </Typography>
                            .<br />
                            {t.pleaseSignAll}{" "}
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
