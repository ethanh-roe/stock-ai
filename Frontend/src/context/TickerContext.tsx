import { createContext, useContext, useState } from "react";

interface TickerContext {
  ticker: string;
  setTicker: React.Dispatch<React.SetStateAction<string>>;
}

const TickerContext = createContext<TickerContext>({
  ticker: "",
  setTicker: () => {},
});

export const TickerProvider = ({ children }: { children: React.ReactNode }) => {
  const [ticker, setTicker] = useState<string>("");

  return (
    <TickerContext.Provider value={{ ticker, setTicker }}>
      {children}
    </TickerContext.Provider>
  );
};

export const useTicker = () => useContext(TickerContext);
