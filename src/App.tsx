import VendorOnboardingFlow from "./vendor-onboarding-flow";
import ThemeProvider from "./theme-provider.tsx";

export default function App() {
    return (
        <ThemeProvider>
            <VendorOnboardingFlow />
        </ThemeProvider>
    );
}
