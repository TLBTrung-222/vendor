import React from "react";
import { Box, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';


interface INotiItem {
  message: {
    message: string;
    timestamp: string;
  };
}

const NotiItem: React.FC<INotiItem> = ({ message }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "5px",
        alignItems: "center",
        padding: 1,
        borderBottom: "1px solid #eee",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      <CircleIcon
        sx={{
          color: "primary.main",
          fontSize: "small",
        }}
      />

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="caption" fontWeight={500} sx={{ textWrap: "break-word" }}>
          {message?.message}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          {message?.timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

export default NotiItem;