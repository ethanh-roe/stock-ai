from pydantic import BaseModel, Field, HttpUrl

class StockProfile(BaseModel):
    ticker: str
    name: str
    country: str
    currency: str
    exchange: str
    ipo: str
    market_cap: float = Field(alias="marketCapitalization")
    phone: str
    share_outstanding: float = Field(alias="shareOutstanding")
    web_url: HttpUrl = Field(alias="weburl")
    logo: HttpUrl
    industry: str = Field(alias="finnhubIndustry")

    class Config:
        populate_by_name = True

class StockNews(BaseModel):
    category: str
    datetime: int 
    headline: str
    id: int
    image: str
    related: str
    source: str
    summary: str
    url: str

