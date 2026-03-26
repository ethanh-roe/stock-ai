import { Paper, Box, Typography, Chip, TextField, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import {
  Send as SendIcon,
  AutoAwesome as SparkleIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import api from "../../services/apiService.ts";

const SUGGESTED_QUESTIONS = [
  "What does this company do?",
  "What are the key risks?",
  "Who are the main competitors?",
  "What's the growth outlook?",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type StockChatbotProps = {
  ticker: string;
};

const StockChatbot = ({ ticker }: StockChatbotProps) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setConversationId(null);
  }, [ticker]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOrCreateConversation = async (): Promise<number> => {
    if (conversationId !== null) return conversationId;
    const res = await api.post(`/chat/conversation/new`);
    const newId: number = res.data.id;
    setConversationId(newId);
    return newId;
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isLoading || !ticker) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const convId = await getOrCreateConversation();

      const response = await api.post(`/chat/conversation/send`, {
        conversation_id: convId,
        ticker,
        content: messageText,
      });

      const assistantText: string =
        response.data?.content ??
        "Sorry, I couldn't generate a response. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const isEmpty = messages.length === 0;

  const accentGradient = "linear-gradient(135deg, #4F6EF7 0%, #a78bfa 100%)";
  const accent = "#4F6EF7";
  const accentDark = "#3A55D4";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        height: 480,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5, py: 1.75,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex", alignItems: "center", gap: 1.25,
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: accentGradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <SparkleIcon sx={{ fontSize: 16, color: "#fff" }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
            AI Stock Assistant
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
            {ticker ? `Analyzing ${ticker}` : "Ask me anything about stocks"}
          </Typography>
        </Box>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#22c55e" }} />
          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>Online</Typography>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {isEmpty ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 2.5 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, rgba(79,110,247,0.12) 0%, rgba(167,139,250,0.12) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SparkleIcon sx={{ fontSize: 28, color: accent }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                {ticker ? `Ask me about ${ticker}` : "Select a ticker to get started"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {ticker
                  ? "Get instant insights on business model, risks, competitors, and more"
                  : "Search for a stock above, then ask questions here"}
              </Typography>
            </Box>
            {ticker && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "center", maxWidth: 480 }}>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <Chip
                    key={q} label={q} size="small"
                    onClick={() => sendMessage(q)}
                    sx={{
                      height: 28, fontSize: "0.72rem", fontWeight: 600,
                      bgcolor: "background.default", color: "text.secondary",
                      border: `1px solid ${theme.palette.divider}`, cursor: "pointer",
                      "&:hover": { bgcolor: "#eef0fb", color: accent, borderColor: "#c7d0f7" },
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: 1.25,
                }}
              >
                <Box
                  sx={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    ...(msg.role === "assistant"
                      ? { background: accentGradient }
                      : { bgcolor: "background.default", border: `1px solid ${theme.palette.divider}` }),
                  }}
                >
                  {msg.role === "assistant"
                    ? <SparkleIcon sx={{ fontSize: 14, color: "#fff" }} />
                    : <PersonIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  }
                </Box>
                <Box sx={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 0.4, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <Box
                    sx={{
                      px: 1.75, py: 1.25,
                      borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                      ...(msg.role === "user"
                        ? { bgcolor: accent, color: "#fff" }
                        : { bgcolor: "background.default", color: "text.primary", border: `1px solid ${theme.palette.divider}` }),
                    }}
                  >
                    {msg.role === "user" ? (
                      <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: "0.82rem", fontWeight: 600 }}>
                        {msg.content}
                      </Typography>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: "0.82rem", mb: 0.75, "&:last-child": { mb: 0 } }}>
                              {children}
                            </Typography>
                          ),
                          ul: ({ children }) => (
                            <Box component="ul" sx={{ pl: 2, my: 0.5 }}>
                              {children}
                            </Box>
                          ),
                          ol: ({ children }) => (
                            <Box component="ol" sx={{ pl: 2, my: 0.5 }}>
                              {children}
                            </Box>
                          ),
                          li: ({ children }) => (
                            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, fontSize: "0.82rem", mb: 0.25 }}>
                              {children}
                            </Typography>
                          ),
                          strong: ({ children }) => (
                            <Box component="span" sx={{ fontWeight: 700 }}>
                              {children}
                            </Box>
                          ),
                          em: ({ children }) => (
                            <Box component="span" sx={{ fontStyle: "italic" }}>
                              {children}
                            </Box>
                          ),
                          h1: ({ children }) => (
                            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.9rem", mb: 0.5 }}>
                              {children}
                            </Typography>
                          ),
                          h2: ({ children }) => (
                            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.87rem", mb: 0.5 }}>
                              {children}
                            </Typography>
                          ),
                          h3: ({ children }) => (
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.84rem", mb: 0.5 }}>
                              {children}
                            </Typography>
                          ),
                          code: ({ children }) => (
                            <Box
                              component="code"
                              sx={{
                                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                                px: 0.5, py: 0.1, borderRadius: 0.5,
                                fontSize: "0.78rem", fontFamily: "monospace",
                              }}
                            >
                              {children}
                            </Box>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem", px: 0.5 }}>
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: accentGradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SparkleIcon sx={{ fontSize: 14, color: "#fff" }} />
                </Box>
                <Box sx={{ px: 1.75, py: 1.25, borderRadius: "4px 16px 16px 16px", bgcolor: "background.default", border: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", gap: 0.5 }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 6, height: 6, borderRadius: "50%",
                        bgcolor: accent, opacity: 0.4,
                        animation: "bounce 1.2s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                        "@keyframes bounce": {
                          "0%, 80%, 100%": { transform: "scale(0.8)", opacity: 0.4 },
                          "40%": { transform: "scale(1.2)", opacity: 1 },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Suggested questions (after first message) */}
      {!isEmpty && ticker && !isLoading && (
        <Box sx={{ px: 2.5, pt: 1, pb: 0.5, display: "flex", gap: 0.5, flexWrap: "wrap", borderTop: `1px solid ${theme.palette.divider}` }}>
          {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
            <Chip
              key={q} label={q} size="small"
              onClick={() => sendMessage(q)}
              sx={{
                height: 24, fontSize: "0.68rem", fontWeight: 600,
                bgcolor: "background.default", color: "text.secondary", cursor: "pointer",
                "&:hover": { bgcolor: "#eef0fb", color: accent },
                transition: "all 0.15s",
              }}
            />
          ))}
        </Box>
      )}

      {/* Input */}
      <Box
        sx={{
          px: 2, py: 1.5, borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex", alignItems: "center", gap: 1,
          flexShrink: 0, bgcolor: "background.default",
        }}
      >
        <TextField
          inputRef={inputRef}
          size="small" fullWidth
          placeholder={ticker ? `Ask about ${ticker}…` : "Select a ticker first…"}
          value={input}
          disabled={!ticker || isLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          multiline maxRows={3}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5, fontSize: "0.82rem", bgcolor: "background.paper",
              "& fieldset": { borderColor: theme.palette.divider },
              "&:hover fieldset": { borderColor: accent },
              "&.Mui-focused fieldset": { borderColor: accent },
            },
          }}
        />
        <IconButton
          onClick={() => sendMessage()}
          disabled={!ticker || !input.trim() || isLoading}
          sx={{
            width: 38, height: 38, flexShrink: 0,
            bgcolor: accent, color: "#fff", borderRadius: 2,
            "&:hover": { bgcolor: accentDark },
            "&:disabled": { bgcolor: "background.default", color: "text.disabled" },
            transition: "all 0.15s",
          }}
        >
          <SendIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default StockChatbot;
