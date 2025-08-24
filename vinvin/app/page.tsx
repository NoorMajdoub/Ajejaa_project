"use client"

import { useState } from "react"
import HomePage from "./components/home-page"
import ResultsPage from "./components/results-page"
import DashboardPage from "./components/dashboard-page"

export type Page = "home" | "results" | "dashboard"

export interface TripData {
  city: string
  vehicle: string
  time: string
  fromAddress?: string
  toAddress?: string
}

export interface PredictionResult {
  congestion: "Low" | "Medium" | "High"
  routeSummary: string
  advisory?: string
}

export default function SmartRouteApp() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [darkMode, setDarkMode] = useState(false)
  const [tripData, setTripData] = useState<TripData | null>(null)
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)

  const navigateToPage = (page: Page) => {
    setCurrentPage(page)
  }

  const handlePrediction = (data: TripData) => {
    setTripData(data)

    // Simulate prediction logic
    const predictions = {
      tunis: {
        congestion: "Medium" as const,
        routeSummary:
          language === "en"
            ? "Avoiding Avenue Habib Bourguiba due to Friday prayer traffic"
            : "تجنب شارع الحبيب بورقيبة بسبب حركة المرور يوم الجمعة",
        advisory:
          data.vehicle === "gas"
            ? language === "en"
              ? "Gas trucks not allowed in Medina after 6 PM"
              : "شاحنات الغاز غير مسموحة في المدينة القديمة بعد الساعة 6 مساءً"
            : undefined,
      },
      sfax: {
        congestion: "Low" as const,
        routeSummary:
          language === "en"
            ? "Clear route via Avenue Ali Belhouane recommended"
            : "طريق واضح عبر شارع علي بلحوان موصى به",
      },
      sousse: {
        congestion: "High" as const,
        routeSummary:
          language === "en"
            ? "Avoiding Medina area due to tourist season congestion"
            : "تجنب منطقة المدينة العتيقة بسبب ازدحام الموسم السياحي",
      },
    }

    setPredictionResult(predictions[data.city as keyof typeof predictions] || predictions.tunis)
    navigateToPage("results")
  }

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            language={language}
            darkMode={darkMode}
            onPrediction={handlePrediction}
            onNavigate={navigateToPage}
            onToggleLanguage={toggleLanguage}
            onToggleTheme={toggleTheme}
          />
        )
      case "results":
        return (
          <ResultsPage
            language={language}
            darkMode={darkMode}
            tripData={tripData}
            predictionResult={predictionResult}
            onNavigate={navigateToPage}
            onToggleLanguage={toggleLanguage}
            onToggleTheme={toggleTheme}
          />
        )
      case "dashboard":
        return (
          <DashboardPage
            language={language}
            darkMode={darkMode}
            onNavigate={navigateToPage}
            onToggleLanguage={toggleLanguage}
            onToggleTheme={toggleTheme}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {renderCurrentPage()}
    </div>
  )
}
