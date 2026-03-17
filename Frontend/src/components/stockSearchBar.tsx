import { Paper, TextField, Button, Divider, Box, Typography, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Search as SearchIcon } from "@mui/icons-material";
import { useState } from "react";

const accent = "#4F6EF7";
const accentDark = "#3A55D4";

type StockSearchBarProps = {
  ticker: string;
  setTicker: React.Dispatch<React.SetStateAction<string>>;
  loading?: boolean;
};

const StockSearchBar = ({ ticker, setTicker, loading = false }: StockSearchBarProps) => {
  const theme = useTheme();
  const [search, setSearch] = useState<string>("");
  const [_error, setError] = useState<string | null>(null);

  const popularTickers = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA"];

  const handleSearch = (searchTicker?: string): void => {
    const t = (searchTicker ?? search).trim();
    if (t) {
      setTicker(t.toUpperCase());
      setSearch("");
      setError(null);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: "10px 16px", mb: 2, borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap",
      }}
    >
      <TextField
        size="small"
        placeholder="Search ticker…"
        value={search}
        onChange={(e) => setSearch(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        sx={{
          width: 220,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2, fontSize: "0.875rem", fontWeight: 600,
            "& fieldset": { borderColor: theme.palette.divider },
            "&:hover fieldset": { borderColor: accent },
            "&.Mui-focused fieldset": { borderColor: accent },
          },
        }}
      />
      <Button
        variant="contained"
        onClick={() => handleSearch()}
        disabled={loading || !search.trim()}
        startIcon={<SearchIcon sx={{ fontSize: 16 }} />}
        disableElevation
        sx={{
          height: 40, px: 2.5, bgcolor: accent, fontWeight: 700,
          fontSize: "0.8rem", borderRadius: 2, textTransform: "none",
          "&:hover": { bgcolor: accentDark },
        }}
      >
        Search
      </Button>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, mr: 0.5, letterSpacing: 0.5 }}>
          POPULAR
        </Typography>
        {popularTickers.map((t) => (
          <Chip
            key={t} label={t} size="small"
            onClick={() => handleSearch(t)}
            sx={{
              height: 28, fontSize: "0.75rem", fontWeight: 700,
              bgcolor: ticker === t ? accent : "background.default",
              color: ticker === t ? "#fff" : "text.secondary",
              border: "none", cursor: "pointer", transition: "all 0.15s",
              "&:hover": { bgcolor: ticker === t ? accentDark : theme.palette.action.hover },
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default StockSearchBar;
