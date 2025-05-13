import React from "react";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // For dark mode
import Brightness7Icon from "@mui/icons-material/Brightness7"; // For light mode

// Create a simple light/dark toggle without using useColorScheme
export default function ColorModeSelect(props) {
    const [mode, setMode] = React.useState("light");

    const handleModeChange = () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);

        // Apply some basic theme changes
        document.body.style.backgroundColor =
            newMode === "dark" ? "#121212" : "#ffffff";
        document.body.style.color = newMode === "dark" ? "#ffffff" : "#121212";
    };

    return (
        <IconButton onClick={handleModeChange} color="inherit" {...props}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
    );
}
