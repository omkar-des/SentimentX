export type SentimentLabel = "Bullish" | "Bearish" | "Neutral";

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  impact: "positive" | "negative" | "neutral";
  url: string;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  sentimentScore: number;
  sentiment: SentimentLabel;
  shortlisted: boolean;
  news: NewsItem[];
  summary: string;
  forecast: string;
}

export const ALL_STOCKS: Stock[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    sector: "Energy & Retail",
    price: 2847.65,
    change: 34.2,
    changePercent: 1.22,
    sentimentScore: 74,
    sentiment: "Bullish",
    shortlisted: true,
    news: [
      { id: "r1", headline: "Reliance Jio to launch 5G services across 50 new cities by Q3 FY26", source: "Economic Times", time: "2h ago", impact: "positive", url: "https://economictimes.indiatimes.com" },
      { id: "r2", headline: "RIL's retail arm posts ₹18,000 Cr revenue, beats analyst estimates by 8%", source: "Mint", time: "5h ago", impact: "positive", url: "https://livemint.com" },
      { id: "r3", headline: "Reliance New Energy eyes global partnerships for green hydrogen pilot", source: "Business Standard", time: "1d ago", impact: "positive", url: "https://business-standard.com" },
      { id: "r4", headline: "Mukesh Ambani sells $1.5B stake to fund O2C expansion", source: "Bloomberg", time: "2d ago", impact: "neutral", url: "https://bloomberg.com" },
    ],
    summary: "Reliance Industries continues to demonstrate strong multi-vertical momentum. The conglomerate's telecom arm, Jio, is accelerating 5G rollout which is driving subscriber additions at a pace that outstrips competition. Retail performance has been standout with EBITDA margin expansion driven by improved product mix and operational leverage. The green energy vertical remains in early capex phase but is attracting significant institutional interest. Analyst consensus remains positive with a 12-month price target range of ₹3,100–₹3,400.",
    forecast: "Near-term outlook for Reliance is cautiously optimistic. Q3 FY26 earnings are expected to be a key catalyst, with Jio ARPU expansion and retail festive-season tailwinds likely to push consolidated revenue above ₹2.5 lakh crore. The O2C segment faces mild headwind from softening global crude margins but this is likely to be offset by strong domestic polymer demand. Watch for FII activity — any net buying above ₹2,000 Cr in the stock could trigger a breakout above ₹2,950 resistance. Probability of a 6–8% upside over the next 30 trading sessions: ~65%.",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "Information Technology",
    price: 3521.4,
    change: -28.75,
    changePercent: -0.81,
    sentimentScore: 52,
    sentiment: "Neutral",
    shortlisted: true,
    news: [
      { id: "t1", headline: "TCS Q2 revenue growth slows to 4.1% as BFSI vertical sees client budget freezes", source: "Reuters", time: "3h ago", impact: "negative", url: "https://reuters.com" },
      { id: "t2", headline: "TCS signs $1.1B deal with UK government for digital transformation of HMRC", source: "Financial Express", time: "8h ago", impact: "positive", url: "https://financialexpress.com" },
      { id: "t3", headline: "Attrition rate drops to 12.3%, lowest in 7 quarters — signals talent stabilisation", source: "Moneycontrol", time: "1d ago", impact: "positive", url: "https://moneycontrol.com" },
    ],
    summary: "TCS is navigating a mixed macro environment where large deal wins continue to provide backlog visibility, but discretionary tech spending in key markets like North America and Europe remains muted. The BFSI vertical — TCS's largest — is showing signs of budget conservatism among Tier-1 US banks. However, the recently signed UK government deal and steady margin performance at ~24.5% EBIT are stabilizing factors. Management commentary on demand recovery in H2 FY26 will be closely watched.",
    forecast: "The near-term trajectory for TCS hinges on demand signals from the US Federal Reserve's rate path. A clear pivot to rate cuts could unlock deferred BFSI tech budgets and act as a strong re-rating catalyst. AI-related deal wins are beginning to show up in pipeline metrics but have not yet converted to meaningful revenue. Expect muted but stable returns over the next 4–6 weeks with a risk of a 3–5% correction if Q3 guidance disappoints. Overall probability of outperformance vs. Nifty IT index: ~45%.",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    sector: "Banking & Finance",
    price: 1678.9,
    change: 22.1,
    changePercent: 1.33,
    sentimentScore: 68,
    sentiment: "Bullish",
    shortlisted: true,
    news: [
      { id: "h1", headline: "HDFC Bank's credit growth rebounds to 16% YoY, NIM stabilises at 3.5%", source: "Mint", time: "1h ago", impact: "positive", url: "https://livemint.com" },
      { id: "h2", headline: "RBI grants HDFC Bank approval to increase SBL for FY26", source: "Economic Times", time: "6h ago", impact: "positive", url: "https://economictimes.indiatimes.com" },
      { id: "h3", headline: "HDFC Bank to onboard 2,000 new MSME clients via co-lending partnerships", source: "Business Line", time: "2d ago", impact: "positive", url: "https://thehindubusinessline.com" },
    ],
    summary: "HDFC Bank's post-merger integration with HDFC Ltd is progressing better than initially modelled by the street. Net Interest Margin (NIM) stabilisation has been the key re-rating trigger — after several quarters of compression due to merger-related deposit costs, NIM is showing clear signs of recovery. Credit growth is broad-based across retail, commercial, and wholesale segments. Deposit mobilisation through branch expansion remains a strategic priority and is on track.",
    forecast: "HDFC Bank is entering a favourable rate environment. With RBI likely to maintain an accommodative stance into Q1 CY27, NIM expansion has room to continue, which would drive superior RoA improvement. The bank's valuation at 2.1x FY27E book is below its historical average of 2.8x — creating a meaningful margin of safety. FII ownership is at a multi-year low, suggesting significant upside potential once global EM flows return. A 10–15% appreciation over the next 60 trading days is within reach if macro conditions stay supportive.",
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    sector: "Information Technology",
    price: 1842.3,
    change: -15.6,
    changePercent: -0.84,
    sentimentScore: 41,
    sentiment: "Bearish",
    shortlisted: true,
    news: [
      { id: "i1", headline: "Infosys cuts FY26 revenue guidance to 4.5–6.5%, citing weak discretionary spend", source: "CNBC-TV18", time: "4h ago", impact: "negative", url: "https://cnbctv18.com" },
      { id: "i2", headline: "CEO Salil Parekh confirms generative AI integration in 38 enterprise projects", source: "Tech Crunch", time: "9h ago", impact: "positive", url: "https://techcrunch.com" },
      { id: "i3", headline: "Infosys faces $40M penalty in US court over visa irregularities, to appeal", source: "Reuters", time: "1d ago", impact: "negative", url: "https://reuters.com" },
    ],
    summary: "Infosys is under pressure on multiple fronts: guidance cut, legal overhang, and a cautious management tone on near-term deal ramp-ups. The guidance reduction from a prior midpoint of 6% to a new midpoint of 5.5% has triggered a round of target price cuts from institutional brokers. The visa penalty case, while manageable in absolute financial terms, creates reputational noise. On the positive side, AI project pipeline expansion and strong deal closures in the manufacturing vertical provide medium-term hope.",
    forecast: "The risk-reward for Infosys at current levels is skewed to the downside in the near term. A further guidance cut in Q3 FY26 — which cannot be ruled out — could push the stock toward ₹1,700–₹1,720 support. Resistance is well-established at ₹1,920. Short interest in F&O segment has been rising, suggesting institutional hedging. Best strategy would be to wait for Q3 results before initiating a fresh long. The 30-day probability of downside beyond 5% from current levels: approximately 40%.",
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance Ltd",
    sector: "NBFC & Fintech",
    price: 7124.5,
    change: 89.3,
    changePercent: 1.27,
    sentimentScore: 71,
    sentiment: "Bullish",
    shortlisted: true,
    news: [
      { id: "b1", headline: "Bajaj Finance AUM crosses ₹3.8 lakh crore, new customer adds at record high", source: "Economic Times", time: "2h ago", impact: "positive", url: "https://economictimes.indiatimes.com" },
      { id: "b2", headline: "Bajaj Finance launches co-branded credit card with HDFC Bank; 2M cards targeted in Year 1", source: "Business Standard", time: "7h ago", impact: "positive", url: "https://business-standard.com" },
      { id: "b3", headline: "RBI circular on consumer credit tightening may pressure growth in unsecured segment", source: "Mint", time: "3d ago", impact: "negative", url: "https://livemint.com" },
    ],
    summary: "Bajaj Finance maintains its position as the most admired NBFC franchise in India, consistently delivering RoA above 4.5% and RoE above 22%. The latest AUM milestone reflects strong cross-sell effectiveness and geographic penetration into Tier-3 and Tier-4 markets. The new HDFC Bank co-branded card is a strategic move to diversify fee income. The only notable risk is the RBI's tightening stance on unsecured consumer credit, which could moderate growth in the personal loan and EMI finance segments.",
    forecast: "Bajaj Finance is likely to maintain double-digit AUM growth through Q4 FY26, driven by housing finance, SME lending, and new product launches. Management's ability to navigate the RBI's macro-prudential measures will be the key differentiator. If the unsecured loan portfolio shows NPA stress in Q3, the stock could see a 5–7% de-rating. However, the structural growth story remains intact. Current valuation at 7.2x FY27E book is a premium but historically justified given ROE delivery. Positive outlook maintained for a 3-month horizon.",
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    sector: "FMCG & Hotels",
    price: 465.2,
    change: -3.8,
    changePercent: -0.81,
    sentimentScore: 55,
    sentiment: "Neutral",
    shortlisted: false,
    news: [
      { id: "it1", headline: "ITC Hotels demerger gets NCLT approval; listing expected in Q2 FY26", source: "NDTV Profit", time: "5h ago", impact: "positive", url: "https://ndtvprofit.com" },
      { id: "it2", headline: "Cigarette volume growth moderates amid excise duty hike concerns", source: "Moneycontrol", time: "1d ago", impact: "negative", url: "https://moneycontrol.com" },
      { id: "it3", headline: "ITC Agri Business division sees strong kharif procurement season", source: "Financial Express", time: "2d ago", impact: "positive", url: "https://financialexpress.com" },
    ],
    summary: "ITC is in a transitional phase with the hotel demerger set to unlock value for shareholders by allowing a pure-play hotels entity to be separately valued by the market. The core cigarette business remains a cash cow with pricing power, though volume growth is moderating. The FMCG business continues to scale with improving EBITDA margins as Staples and Personal Care categories gain distribution strength.",
    forecast: "Post demerger, ITC's remaining entity — primarily cigarettes, FMCG, and agribusiness — could see a re-rating as the hotel capex overhang is removed. The stock has been range-bound between ₹430–₹490 for over a year. A decisive break above ₹495 with volume confirmation would signal institutional re-accumulation. Dividend yield of ~3.2% provides a floor for long-term investors. Neutral stance maintained; await demerger completion for a clearer directional bet.",
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    sector: "Automobiles",
    price: 912.4,
    change: -44.8,
    changePercent: -4.68,
    sentimentScore: 28,
    sentiment: "Bearish",
    shortlisted: false,
    news: [
      { id: "tm1", headline: "Jaguar Land Rover reports 18% decline in wholesale volumes amid EV transition costs", source: "Reuters", time: "30min ago", impact: "negative", url: "https://reuters.com" },
      { id: "tm2", headline: "Tata Motors EV market share in India slips to 58% as MG, Hyundai gain ground", source: "Autocar India", time: "4h ago", impact: "negative", url: "https://autocarindia.com" },
      { id: "tm3", headline: "Tata Commercial Vehicles Q2 volumes fall 9% on weak government fleet demand", source: "Business Standard", time: "1d ago", impact: "negative", url: "https://business-standard.com" },
    ],
    summary: "Tata Motors is facing a convergence of negative factors: JLR volume weakness, EV market share erosion in India, and CV cycle downturn. JLR's electrification investment programme (JEA platform) is consuming significant cash flow while the legacy ICE business is under price pressure. The India EV narrative, which was a strong re-rating catalyst in FY24, is being partially unwound as Chinese OEM-backed brands gain ground with more competitive price points.",
    forecast: "The near-term picture for Tata Motors is challenging. Consensus EPS estimates for FY26 have been cut by an average of 18% over the last 60 days. JLR recovery would require a stabilisation in European consumer sentiment and cost absorption from the electrification programme. Key downside risk: any further JLR volume miss could push the stock below ₹860 — a critical support level. Avoid initiating new long positions until Q3 FY26 JLR monthly sales data shows a sustained recovery trend. 30-day downside probability: ~55%.",
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    sector: "Information Technology",
    price: 542.8,
    change: 4.2,
    changePercent: 0.78,
    sentimentScore: 48,
    sentiment: "Neutral",
    shortlisted: false,
    news: [
      { id: "w1", headline: "Wipro wins $300M transformation deal from a European energy major", source: "Economic Times", time: "6h ago", impact: "positive", url: "https://economictimes.indiatimes.com" },
      { id: "w2", headline: "Wipro Q2 revenue flat QoQ; management guides for 0–2% growth in Q3", source: "CNBC-TV18", time: "1d ago", impact: "negative", url: "https://cnbctv18.com" },
    ],
    summary: "Wipro continues its transformation under CEO Srinivas Pallia with a focus on large deal pursuit and portfolio rationalisation. While new deal TCV has been improving, revenue conversion remains sluggish due to deal ramp timing and client-specific delays. The company's focus on strategic acquisitions in the cybersecurity and cloud infrastructure space is a long-term positive.",
    forecast: "Wipro is a show-me story — the market is waiting for revenue growth to inflect before giving the stock credit for operational improvements. An upside surprise in Q3 guidance (>2% QoQ growth) could trigger a 6–8% re-rating. Current valuation at 19x FY27E EPS is modest relative to peers. Relative underperformance to Nifty IT index over the past 12 months has been ~12%, suggesting potential catch-up if execution improves.",
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical Industries",
    sector: "Pharmaceuticals",
    price: 1724.6,
    change: 18.9,
    changePercent: 1.11,
    sentimentScore: 66,
    sentiment: "Bullish",
    shortlisted: false,
    news: [
      { id: "s1", headline: "Sun Pharma's Ilumya gets expanded indication approval from USFDA for PsA", source: "Pharma News", time: "3h ago", impact: "positive", url: "https://pharmabiz.com" },
      { id: "s2", headline: "Sun Pharma specialty business revenue grows 22% in Q2; global generic launches on track", source: "Moneycontrol", time: "8h ago", impact: "positive", url: "https://moneycontrol.com" },
    ],
    summary: "Sun Pharmaceutical is executing well on its specialty-led transformation strategy. The USFDA label expansion for Ilumya (tildrakizumab) opens a larger addressable market in psoriatic arthritis — estimated to be a $400M annual opportunity at peak. The global generics business is maintaining stable margins while specialty brands continue to outgrow the blended portfolio. India branded formulations remain the cash engine with mid-teens volume growth.",
    forecast: "Sun Pharma's specialty business pipeline has multiple potential near-term catalysts including a Phase 3 readout for GL0034 (obesity) and ANDA approvals in the US for complex generics. The stock is trading at a premium to global pharma peers at 28x FY27E EPS, but the premium is justified by its specialty pipeline quality and execution track record. A pullback to ₹1,650–₹1,680 would represent a high-quality entry point. Bull-case 12-month target: ₹2,100.",
  },
  {
    symbol: "ADANIPORTS",
    name: "Adani Ports & SEZ Ltd",
    sector: "Infrastructure & Logistics",
    price: 1342.0,
    change: 11.5,
    changePercent: 0.86,
    sentimentScore: 61,
    sentiment: "Bullish",
    shortlisted: false,
    news: [
      { id: "ap1", headline: "Adani Ports handles 420 MMT cargo in H1 FY26, up 18% YoY — guidance raised", source: "Business Standard", time: "2h ago", impact: "positive", url: "https://business-standard.com" },
      { id: "ap2", headline: "Gangavaram Port expansion phase II receives environment clearance", source: "Economic Times", time: "1d ago", impact: "positive", url: "https://economictimes.indiatimes.com" },
      { id: "ap3", headline: "Adani Group governance concerns resurface after Hindenburg follow-up note", source: "Reuters", time: "3d ago", impact: "negative", url: "https://reuters.com" },
    ],
    summary: "Adani Ports is demonstrating strong operational performance with cargo volumes growing well ahead of the industry. The port network now spans 13 ports and handles ~26% of India's total port cargo throughput — a dominant competitive position. The SEZ at Mundra is seeing strong FDI-linked manufacturing demand driven by China+1 supply chain shifts. The primary overhang remains group-level governance perceptions, which periodically create volatility.",
    forecast: "Operational fundamentals for Adani Ports remain robust and the stock tends to outperform during periods of stable group sentiment. The ₹1,300 level has acted as a strong support four times in the last 12 months. New capacity additions at Vizhinjam and Colombo Transshipment Hub add a differentiated growth vector. If group-level governance noise stays muted, expect the stock to test ₹1,450 within the next 45 trading days.",
  },
];

export const SHORTLISTED_STOCKS = ALL_STOCKS.filter(s => s.shortlisted);
