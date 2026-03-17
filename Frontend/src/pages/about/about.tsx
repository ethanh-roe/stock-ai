import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const features = [
  {
    title: "BLAHHHH",
    body: "BLAHHHH",
    icon: <ShowChartIcon sx={{ fontSize: 64, color: "text.primary", opacity: 0.25 }} />,
  },
  {
    title: "WBLAHHHH",
    body: "a;dkfklasdf",
    icon: <ShowChartIcon sx={{ fontSize: 64, color: "text.primary", opacity: 0.25 }} />,
  },
  {
    title: "faiwefhualef",
    body: "aiweuhfliauehflia",
    icon: <ShowChartIcon sx={{ fontSize: 64, color: "text.primary", opacity: 0.25 }} />,
  },
];

const platformFeatures = [
  {
    tag: "Live Data",
    title: "Real-time stock prices",
    body: "Search any ticker and get live price updates via WebSocket, with interactive historical charts across multiple time ranges.",
    img: "/money_toushi_kabu_longterm.png",
    dark: true,
    flip: false,
  },
  {
    tag: "Portfolio Tools",
    title: "Build and manage your portfolios",
    body: "Create multiple portfolios, allocate cash, track positions, and monitor your overall balance — all in one place.",
    img: "/money_risk_high.png",
    dark: false,
    flip: true,
  },
  {
    tag: "AI Insights",
    title: "Intelligent market analysis",
    body: "Our AI layer surfaces trends and patterns in market data to give you an edge when researching your next trade.",
    img: "/money_success_woman.png",
    dark: false,
    flip: false,
  },
];

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "background.default" }}>
      <Box
        sx={{
          position: "relative",
          backgroundColor: "primary.main",
          height: "380px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          px: { xs: 4, md: 7 },
          pb: 6,
          pt: 4,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            position: "relative",
            mb: 3,
            opacity: 0.7,
            color: "primary.contrastText",
          }}
        >
          Iowa State University · COMS 402 Senior Design
        </Typography>
        <Typography
          variant="h2"
          sx={{
            position: "relative",
            fontSize: { xs: "2.25rem", md: "3.25rem" },
            color: "#ffffff",
            maxWidth: 520,
            mb: 2.5,
          }}
        >
          Learn to invest without risking a dime
        </Typography>
        <Typography
          variant="body1"
          sx={{
            position: "relative",
            fontSize: "1rem",
            color: "secondary.main",
            maxWidth: 420,
          }}
        >
          Real market data, AI-powered insights, zero real money on the line.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", height: "680px", overflow: "hidden" }}>
        <Box
          sx={{
            flex: 1,
            backgroundColor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src="/money_character_happy.png"
            alt="Happy money character"
            sx={{
              width: "65%",
              maxHeight: "55vh",
              objectFit: "contain",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 4, md: 8 },
            gap: 3,
          }}
        >
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, color: "text.primary" }}
          >
            Practice investing.
            <br />
            Risk-free.
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "1.125rem", maxWidth: 460 }}
          >
            Stock-AI is a senior design project from Iowa State University — a
            paper-trading platform with real market data and AI-powered
            insights, built so anyone can learn to invest without putting real
            money on the line.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={() => navigate("/register")}>
              Get started
            </Button>
            <Button variant="outlined" onClick={() => navigate("/login")}>
              Log in
            </Button>
          </Box>
        </Box>
      </Box>
      {platformFeatures.map((f, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            flexDirection: f.flip ? "row-reverse" : "row",
            height: "600px",
            backgroundColor: f.dark
              ? "primary.main"
              : i === 1
                ? "background.paper"
                : "background.default",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 6,
            }}
          >
            <Box
              component="img"
              src={f.img}
              alt={f.title}
              sx={{
                width: "85%",
                maxHeight: "520px",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { xs: 4, md: 8 },
              gap: 2.5,
            }}
          >
            <Typography variant="overline">{f.tag}</Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "2.75rem" },
                color: f.dark ? "#ffffff" : "text.primary",
              }}
            >
              {f.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: "1.05rem",
                color: f.dark ? "secondary.main" : "text.secondary",
                maxWidth: 460,
              }}
            >
              {f.body}
            </Typography>
          </Box>
        </Box>
      ))}
      <Box sx={{ backgroundColor: "background.default", py: 12, px: { xs: 4, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, color: "text.primary", mb: 2 }}
          >
            AI Features
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            Made to accelerate your learning.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {features.map((feat, i) => (
            <Box
              key={i}
              sx={{
                flex: "1 1 280px",
                maxWidth: 360,
                backgroundColor: "#e8ddd0",
                borderRadius: "20px",
                p: 4,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minHeight: 360,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontSize: "1.4rem", color: "text.primary", lineHeight: 1.25 }}
              >
                {feat.title}
              </Typography>
              <Typography variant="body2">{feat.body}</Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  pt: 2,
                }}
              >
                {feat.icon}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: "primary.main",
          py: 5,
          px: { xs: 4, md: 8 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          sx={{ color: "primary.contrastText", fontWeight: 700, fontSize: "1.1rem" }}
        >
          STOCK-AI
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "secondary.main", fontSize: "0.875rem" }}
        >
          Iowa State University · COMS 402 Senior Design
        </Typography>
      </Box>
    </Box>
  );
};
