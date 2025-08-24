"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Bike, Truck, Navigation, Sun, Moon, Clock, Home, BarChart3, Route, MapPin,Zap } from "lucide-react"
import type { Page, TripData } from "../page"

interface HomePageProps {
  language: "en" | "ar"
  darkMode: boolean
  onPrediction: (data: TripData) => void
  onNavigate: (page: Page) => void
  onToggleLanguage: () => void
  onToggleTheme: () => void
}
interface SummaryData {
  fromm: string
  dest: string
  time: string
  vehicule: string
}
export default function HomePage({
  language,
  darkMode,
  onPrediction,
  onNavigate,
  onToggleLanguage,
  onToggleTheme,
}: HomePageProps) {
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)

  // Remove the tunisianCities array and selectedCity state
  // Replace with:
  const [fromAddress, setFromAddress] = useState("")
  const [toAddress, setToAddress] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null)

  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setActiveInput(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add this function to simulate address suggestions
  const getAddressSuggestions = (query: string): string[] => {
    if (!query || query.length < 2) return []

    const tunisianLocations = [
      "Avenue Habib Bourguiba, Tunis",
      "Medina, Tunis",
      "El Omrane, Tunis",
      "Bab El Khadra, Tunis",
      "Carthage, Tunis",
      "Sidi Bou Said, Tunis",
      "La Marsa, Tunis",
      "Ariana Centre, Ariana",
      "Centre Ville, Sfax",
      "Medina, Sfax",
      "Sakiet Ezzit, Sfax",
      "Port de Sfax, Sfax",
      "Centre Ville, Sousse",
      "Medina, Sousse",
      "Port El Kantaoui, Sousse",
      "Hammam Sousse, Sousse",
      "Centre Ville, Gabès",
      "Jara, Gabès",
      "Menzel, Gabès",
      "Centre Ville, Bizerte",
      "Corniche, Bizerte",
      "Ras Jebel, Bizerte",
      "Centre Ville, Kairouan",
      "Medina, Kairouan",
      "Mosquée Okba, Kairouan",
      "Centre Ville, Monastir",
      "Marina, Monastir",
      "Skanes, Monastir",
      "Centre Ville, Nabeul",
      "Hammamet, Nabeul",
      "Kelibia, Nabeul",
      "Centre Ville, Mahdia",
      "Zone Touristique, Mahdia",
      "Ksour Essef, Mahdia",
      "Université de Manouba, Manouba",
      "Centre Ville, Manouba",
      "Douar Hicher, Manouba",
      "Centre Ville, Gafsa",
      "Metlaoui, Gafsa",
      "Redeyef, Gafsa",
      "Centre Ville, Kasserine",
      "Sbeitla, Kasserine",
      "Foussana, Kasserine",
      "Centre Ville, Medenine",
      "Djerba Houmt Souk, Medenine",
      "Zarzis, Medenine",
      "Centre Ville, Tataouine",
      "Chenini, Tataouine",
      "Douiret, Tataouine",
      "Centre Ville, Tozeur",
      "Nefta, Tozeur",
      "Douz, Tozeur",
      "Centre Ville, Zaghouan",
      "Hammam Zriba, Zaghouan",
      "Bir Mcherga, Zaghouan",
    ]

    return tunisianLocations
      .filter(
        (location) =>
          location.toLowerCase().includes(query.toLowerCase()) ||
          location.toLowerCase().includes(query.toLowerCase().replace(/[aeiou]/g, "")),
      )
      .slice(0, 5)
  }

  const handleAddressChange = (value: string, type: "from" | "to") => {
    if (type === "from") {
      setFromAddress(value)
    } else {
      setToAddress(value)
    }

    const newSuggestions = getAddressSuggestions(value)
    setSuggestions(newSuggestions)
    setShowSuggestions(newSuggestions.length > 0)
    setActiveInput(type)
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (activeInput === "from") {
      setFromAddress(suggestion)
    } else if (activeInput === "to") {
      setToAddress(suggestion)
    }
    setShowSuggestions(false)
    setActiveInput(null)
  }

  // Update the handleSubmit function
  const handleSubmit = async () => {
    if (fromAddress && toAddress && selectedVehicle) {
      onPrediction({
        city: fromAddress, // Using fromAddress as city for backward compatibility
        vehicle: selectedVehicle,
        time: selectedTime || new Date().toTimeString().slice(0, 5),
        fromAddress,
        toAddress,
      })
      console.log(toAddress)
   const newSummaryData = {
  fromm: fromAddress,
  dest: toAddress,
  time: selectedTime || new Date().toTimeString().slice(0, 5),
  vehicule: selectedVehicle,
};
setSummaryData(newSummaryData);
console.log("no", newSummaryData);

try {
  const response = await fetch("http://localhost:8001/data", {
 method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
body: JSON.stringify(newSummaryData)

  });
const data = await response.json();
console.log(data)
  if (!response.ok) { // Check if the HTTP status is 2xx
    // Handle HTTP errors (e.g., 404, 500)
    throw new Error(`HTTP error! Status: ${response.status} `);
  }

 
  // You might want to update state or perform other actions with 'data' here
} catch (error) {
  console.error("Fetch failed:", error);
} finally {
  console.log("huh");
}



    }
    
  }

  const vehicles = [
    {
      value: "car",
      label: language === "en" ? "Car" : "سيارة",
      icon: Car,
      color: "bg-blue-500",
    },
    {
      value: "moto",
      label: language === "en" ? "Motorcycle" : "دراجة نارية",
      icon: Bike,
      color: "bg-green-500",
    },
    {
      value: "van",
      label: language === "en" ? "Delivery Van" : "شاحنة توصيل",
      color: "bg-orange-500",
      icon: Truck,
    },
    {
      value: "gas",
      label: language === "en" ? "Gas Truck" : "شاحنة غاز",
      color: "bg-red-500",
      icon: Truck,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">3jeja</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button variant="ghost" size="sm" onClick={onToggleLanguage} className="p-2 text-2xl">
            {language === "en" ? "🇹🇳" : "🇺🇸"}
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={onToggleTheme} className="p-2">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Vehicle Selection - Swipeable */}
      <div className="mb-6">
        <Label className="text-lg font-semibold mb-4 block">
          {language === "en" ? "Select Vehicle Type" : "اختر نوع المركبة"}
        </Label>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {vehicles.map((vehicle) => {
            const IconComponent = vehicle.icon
            return (
              <Card
                key={vehicle.value}
                className={`min-w-[120px] cursor-pointer transition-all duration-200 ${
                  selectedVehicle === vehicle.value
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedVehicle(vehicle.value)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-12 h-12 ${vehicle.color} rounded-lg flex items-center justify-center mx-auto mb-2`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{vehicle.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Address Input Section */}
      <div className="mb-6 space-y-4">
        <Label className="text-lg font-semibold block">{language === "en" ? "Route Planning" : "تخطيط الطريق"}</Label>

        {/* From Address */}
        <div className="relative">
          <Label htmlFor="from" className="text-sm font-medium mb-2 block">
            {language === "en" ? "From" : "من"}
          </Label>
          <div className="relative">
            <Input
              id="from"
              type="text"
              value={fromAddress}
              onChange={(e) => handleAddressChange(e.target.value, "from")}
              onFocus={() => {
                setActiveInput("from")
                if (fromAddress) {
                  setSuggestions(getAddressSuggestions(fromAddress))
                  setShowSuggestions(true)
                }
              }}
              placeholder={language === "en" ? "Enter starting location..." : "أدخل موقع البداية..."}
              className="h-12 text-base pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* To Address */}
        <div className="relative">
          <Label htmlFor="to" className="text-sm font-medium mb-2 block">
            {language === "en" ? "To" : "إلى"}
          </Label>
          <div className="relative">
            <Input
              id="to"
              type="text"
              value={toAddress}
              onChange={(e) => handleAddressChange(e.target.value, "to")}
              onFocus={() => {
                setActiveInput("to")
                if (toAddress) {
                  setSuggestions(getAddressSuggestions(toAddress))
                  setShowSuggestions(true)
                }
              }}
              placeholder={language === "en" ? "Enter destination..." : "أدخل الوجهة..."}
              className="h-12 text-base pl-10"
            />
            <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Address Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Card ref={suggestionsRef} className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
            <CardContent className="p-0">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Time Selection */}
      <div className="mb-8">
        <Label htmlFor="time" className="text-lg font-semibold mb-2 block">
          {language === "en" ? "Departure Time" : "وقت المغادرة"}
        </Label>
        <div className="flex gap-2">
          <Input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="h-14 text-lg flex-1"
          />
          <Button
            variant="outline"
            onClick={() => {
              const now = new Date()
              setSelectedTime(now.toTimeString().slice(0, 5))
            }}
            className="h-14 px-4"
          >
            <Clock className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Prediction Button */}
      <Button
        onClick={handleSubmit}
        disabled={!fromAddress || !toAddress || !selectedVehicle}
        className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 mb-8"
      >
        {language === "en" ? "Predict Traffic & Suggest Route" : "توقع حركة المرور واقتراح الطريق"}
      </Button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex items-center justify-around py-3 max-w-md mx-auto">
          <Button variant="ghost" size="lg" className="flex-col gap-1 h-auto py-2 text-blue-500">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">{language === "en" ? "Home" : "الرئيسية"}</span>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => onNavigate("results")}
          >
            <Route className="w-6 h-6" />
            <span className="text-xs">{language === "en" ? "Results" : "النتائج"}</span>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => onNavigate("dashboard")}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs">{language === "en" ? "Dashboard" : "لوحة القيادة"}</span>
          </Button>
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="h-20"></div>
    </div>
  )
}
