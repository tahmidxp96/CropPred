import "./globals.css";

export const metadata = {
  title: "Bangladesh Crop Yield Digital Twin | ML-Powered Research Platform",
  description: "A machine learning-powered digital twin forecasting district-level rice yield in Bangladesh using NASA satellite climate data and official BBS publications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
