import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const font = "'Inter', sans-serif";

const features = [
  {
    title: "BLAHHHH",
    body: "BLAHHHH",
    icon: (
      <ShowChartIcon sx={{ fontSize: 64, color: "#1a1714", opacity: 0.25 }} />
    ),
  },
  {
    title: "WBLAHHHH",
    body: "a;dkfklasdf",
    icon: (
      <ShowChartIcon sx={{ fontSize: 64, color: "#1a1714", opacity: 0.25 }} />
    ),
  },
  {
    title: "faiwefhualef",
    body: "aiweuhfliauehflia",
    icon: (
      <ShowChartIcon sx={{ fontSize: 64, color: "#1a1714", opacity: 0.25 }} />
    ),
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
    <Box sx={{ backgroundColor: "#faf8f5", fontFamily: font }}>
      {/* ── Dark banner with radiating lines ── */}
      <Box
        sx={{
          position: "relative",
          backgroundColor: "#1c1c1c",
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
          sx={{
            position: "relative",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#e8ddd0",
            fontFamily: font,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            mb: 3,
            opacity: 0.7,
          }}
        >
          Iowa State University · COMS 402 Senior Design
        </Typography>
        <Typography
          sx={{
            position: "relative",
            fontSize: { xs: "2.25rem", md: "3.25rem" },
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: font,
            lineHeight: 1.1,
            letterSpacing: "-1px",
            maxWidth: 520,
            mb: 2.5,
          }}
        >
          Learn to invest without risking a dime
        </Typography>
        <Typography
          sx={{
            position: "relative",
            fontSize: "1rem",
            color: "#a89880",
            fontFamily: font,
            lineHeight: 1.7,
            maxWidth: 420,
          }}
        >
          Real market data, AI-powered insights, zero real money on the line.
        </Typography>
      </Box>

      {/* ── Hero Section ── */}
      <Box
        sx={{
          display: "flex",
          height: "680px",
          overflow: "hidden",
        }}
      >
        {/* Left — image placeholder */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#f0ebe1",
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

        {/* Right — copy */}
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
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 700,
              color: "#1a1714",
              fontFamily: font,
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            Practice investing.
            <br />
            Risk-free.
          </Typography>
          <Typography
            sx={{
              fontSize: "1.125rem",
              color: "#7a6f63",
              fontFamily: font,
              lineHeight: 1.7,
              maxWidth: 460,
            }}
          >
            Stock-AI is a senior design project from Iowa State University — a
            paper-trading platform with real market data and AI-powered
            insights, built so anyone can learn to invest without putting real
            money on the line.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "14px 32px",
                borderRadius: "50px",
                fontSize: "1rem",
                fontWeight: 600,
                fontFamily: font,
                cursor: "pointer",
                border: "none",
                backgroundColor: "#1c1c1c",
                color: "#faf8f5",
              }}
            >
              Get started
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "14px 32px",
                borderRadius: "50px",
                fontSize: "1rem",
                fontWeight: 600,
                fontFamily: font,
                cursor: "pointer",
                backgroundColor: "transparent",
                color: "#1c1c1c",
                border: "2px solid #d4c9b8",
              }}
            >
              Log in
            </button>
          </Box>
        </Box>
      </Box>

      {/* ── Platform feature sections ── */}
      {platformFeatures.map((f, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            flexDirection: f.flip ? "row-reverse" : "row",
            height: "600px",
            backgroundColor: f.dark
              ? "#1c1c1c"
              : i === 1
                ? "#f0ebe1"
                : "#faf8f5",
            overflow: "hidden",
          }}
        >
          {/* Image */}
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

          {/* Copy */}
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
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: f.dark ? "#a89880" : "#a89880",
                fontFamily: font,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {f.tag}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "2rem", md: "2.75rem" },
                fontWeight: 700,
                color: f.dark ? "#ffffff" : "#1a1714",
                fontFamily: font,
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
              }}
            >
              {f.title}
            </Typography>
            <Typography
              sx={{
                fontSize: "1.05rem",
                color: f.dark ? "#a89880" : "#7a6f63",
                fontFamily: font,
                lineHeight: 1.7,
                maxWidth: 460,
              }}
            >
              {f.body}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* ── Basics cards section (image 4 style) ── */}
      <Box sx={{ backgroundColor: "#faf8f5", py: 12, px: { xs: 4, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            sx={{
              fontSize: { xs: "2.25rem", md: "3rem" },
              fontWeight: 700,
              color: "#1a1714",
              fontFamily: font,
              letterSpacing: "-0.5px",
              mb: 2,
            }}
          >
            AI Features
          </Typography>
          <Typography
            sx={{
              fontSize: "1.1rem",
              color: "#7a6f63",
              fontFamily: font,
              lineHeight: 1.7,
            }}
          >
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
                sx={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#1a1714",
                  fontFamily: font,
                  lineHeight: 1.25,
                }}
              >
                {feat.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  color: "#5a4f45",
                  fontFamily: font,
                  lineHeight: 1.7,
                }}
              >
                {feat.body}
              </Typography>
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

      {/* ── Footer strip ── */}
      <Box
        sx={{
          backgroundColor: "#1c1c1c",
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
          sx={{
            color: "#e8ddd0",
            fontFamily: font,
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          STOCK-AI
        </Typography>
        <Typography
          sx={{ color: "#7a6f63", fontFamily: font, fontSize: "0.875rem" }}
        >
          Iowa State University · COMS 402 Senior Design
        </Typography>
      </Box>
    </Box>
  );
};
