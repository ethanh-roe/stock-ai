import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

export const About: React.FC = () => {
  const dizzyStockImg =
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgngJS8Npqh_7Svr4MMOCdISea77XosuJnvvzTedbCamtRa0BSUlx8mf9uINUhfFuIcE0NBuAZy_wC5PL3oW0BZ6VW5xVTi_-UAL2wITJULK_40OUP5ICytGTNjI6gaOOsCkepEkF4Z7mgE9r5LAR1CgjU2bteCp-yKLtmsFjH1VERE1KxzA3pLEWTZdrSr/s911/money_joucho_man.png";

  const weirdStats = [
    { value: "All", label: "Stocks Supported" },
    { value: "0", label: "AI Features" },
  ];
  return (
    <Box sx={{ bgcolor: "#f5f6fa", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                p: { xs: 3, md: 5 },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  mt: 2,
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                A Tool to
                <br />
                Help Anyone Practice
                <br />
                Investing Stocks
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 3,
                  color: "text.secondary",
                  lineHeight: 1.8,
                }}
              >
                Requested by Dr Hung D Phan, this website is a senior design
                project developed to help lorem ipsum stuff and stuff.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: { xs: 3, md: 4 },
              }}
            >
              <Box
                component="img"
                src={dizzyStockImg}
                alt="Team learning"
                sx={{
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: 4,
                  mb: 3,
                }}
              />

              <Grid container spacing={2}>
                {weirdStats.map((stat) => (
                  <Grid key={stat.label} size={{ xs: 12, sm: 6 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
