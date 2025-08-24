"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Sun,
  Moon,
  Map,
  AlertTriangle,
  Navigation,
  Home,
  BarChart3,
  Route,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  MessageSquare,
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"
import type { Page, TripData, PredictionResult } from "../page"
import DualLeafletMap from "./dual-leaflet-map"

interface ResultsPageProps {
  language: "en" | "ar"
  darkMode: boolean
  tripData: TripData | null
  predictionResult: PredictionResult | null
  onNavigate: (page: Page) => void
  onToggleLanguage: () => void
  onToggleTheme: () => void
}

export default function ResultsPage({
  language,
  darkMode,
  tripData,
  predictionResult,
  onNavigate,
  onToggleLanguage,
  onToggleTheme,
}: ResultsPageProps) {
  const [isReasoningOpen, setIsReasoningOpen] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState<"accepted" | "suggested" | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  if (!tripData || !predictionResult) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="text-center">
          <p>{language === "en" ? "No prediction data available" : "لا توجد بيانات توقع متاحة"}</p>
          <Button onClick={() => onNavigate("home")} className="mt-4">
            {language === "en" ? "Go Home" : "العودة للرئيسية"}
          </Button>
        </div>
      </div>
    )
  }

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800"
    }
  }

  const getCongestionIcon = (level: string) => {
    switch (level) {
      case "High":
        return <AlertCircle className="w-4 h-4" />
      case "Medium":
        return <AlertTriangle className="w-4 h-4" />
      case "Low":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getCongestionText = (level: string) => {
    if (language === "ar") {
      switch (level) {
        case "High":
          return "عالي"
        case "Medium":
          return "متوسط"
        case "Low":
          return "منخفض"
        default:
          return level
      }
    }
    return level
  }

  // Generate reasoning based on trip data and prediction
  const getReasoningData = () => {
    const reasons = []

    if (predictionResult.congestion === "High") {
      reasons.push({
        type: "traffic",
        message:
          language === "en"
            ? "Heavy traffic detected near city center"
            : "حركة مرور كثيفة مكتشفة بالقرب من وسط المدينة",
      })
    }

    if (tripData.city === "tunis") {
      reasons.push({
        type: "event",
        message:
          language === "en"
            ? "Friday prayer traffic near El Omrane mosque"
            : "حركة مرور صلاة الجمعة بالقرب من مسجد العمران",
      })
    }

    if (tripData.vehicle === "gas") {
      reasons.push({
        type: "restriction",
        message:
          language === "en" ? "Gas truck restrictions in historical areas" : "قيود شاحنات الغاز في المناطق التاريخية",
      })
    }

    reasons.push({
      type: "optimization",
      message:
        language === "en"
          ? "Route optimized based on real-time traffic data"
          : "تم تحسين الطريق بناءً على بيانات المرور في الوقت الفعلي",
    })

    return reasons
  }

  const handleFeedback = async (type: "accept" | "suggest") => {
    setIsSubmittingFeedback(true)

    // Simulate API call to backend for machine learning
    try {
      const feedbackData = {
        tripData,
        predictionResult,
        userFeedback: type,
        timestamp: new Date().toISOString(),
        language,
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setFeedbackSent(type === "accept" ? "accepted" : "suggested")

      setTimeout(() => {
        if (type === "accept") {
          // Could navigate to a tracking page or stay here
        } else {
          // Could open a detailed feedback form
        }
      }, 2000)
    } catch (error) {
      console.error("Feedback submission failed:", error)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const reasoningData = getReasoningData()

  // Dummy data for optimized route info, as it's not passed from DualLeafletMap
  const optimizedRouteInfo = {
    duration: "25 min",
    distance: "12 km",
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onNavigate("home")} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Navigation className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">
              {language === "en" ? "Your Smart Route" : "طريقك الذكي"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleLanguage} className="p-2 text-2xl">
            {language === "en" ? "🇹🇳" : "🇺🇸"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleTheme} className="p-2">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Congestion Level with Enhanced Colors */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                {language === "en" ? "Traffic Congestion" : "ازدحام المرور"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Current level in your area" : "المستوى الحالي في منطقتك"}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getCongestionColor(predictionResult.congestion)}`}
            >
              {getCongestionIcon(predictionResult.congestion)}
              <span className="font-semibold">{getCongestionText(predictionResult.congestion)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{language === "en" ? "Recommended Route" : "الطريق الموصى به"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm leading-relaxed">{predictionResult.routeSummary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Smart Route */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{language === "en" ? "Smart Route" : "الطريق الذكي"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === "en" ? "The fastest route based on live traffic" : "أسرع طريق بناءً على حركة المرور الحية"}
          </p>
        </CardHeader>
        <CardContent>
          {optimizedRouteInfo && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4" />
                <span className="text-lg font-bold">{optimizedRouteInfo.duration.split(" ")[0]}</span>
                <span className="text-sm text-muted-foreground">{optimizedRouteInfo.duration.split(" ")[1]}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Route className="w-4 h-4" />
                <span className="text-lg font-bold">{optimizedRouteInfo.distance.split(" ")[0]}</span>
                <span className="text-sm text-muted-foreground">{optimizedRouteInfo.distance.split(" ")[1]}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dual Maps - Original vs Optimized */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-500" />
            {language === "en" ? "Route Comparison" : "مقارنة الطرق"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === "en"
              ? "Compare direct route vs AI-optimized route"
              : "قارن بين الطريق المباشر والطريق المحسن بالذكاء الاصطناعي"}
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <DualLeafletMap
            fromAddress={tripData.fromAddress || ""}
            toAddress={tripData.toAddress || ""}
            language={language}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Advisory Message */}
      {predictionResult.advisory && (
        <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200 font-medium">
            {predictionResult.advisory}
          </AlertDescription>
        </Alert>
      )}

      {/* Reasoning Box - Collapsible */}
      <Card className="mb-6">
        <Collapsible open={isReasoningOpen} onOpenChange={setIsReasoningOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  {language === "en" ? "Decision Reasoning" : "منطق القرار"}
                </CardTitle>
                {isReasoningOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {reasoningData.map((reason, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed">{reason.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Feedback Box */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{language === "en" ? "Route Feedback" : "تقييم الطريق"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === "en" ? "Help us improve our route suggestions" : "ساعدنا في تحسين اقتراحات الطرق"}
          </p>
        </CardHeader>
        <CardContent>
          {feedbackSent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-medium text-green-600 dark:text-green-400 mb-2">
                {feedbackSent === "accepted"
                  ? language === "en"
                    ? "Route Accepted!"
                    : "تم قبول الطريق!"
                  : language === "en"
                    ? "Feedback Submitted!"
                    : "تم إرسال التقييم!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Thank you for helping us improve" : "شكراً لمساعدتنا في التحسين"}
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => handleFeedback("accept")}
                disabled={isSubmittingFeedback}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white"
              >
                {isSubmittingFeedback ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {language === "en" ? "Sending..." : "جاري الإرسال..."}
                  </div>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {language === "en" ? "Accept Route" : "قبول الطريق"}
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleFeedback("suggest")}
                disabled={isSubmittingFeedback}
                variant="outline"
                className="flex-1 h-12"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {language === "en" ? "Suggest Better" : "اقتراح أفضل"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trip Details Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{language === "en" ? "Trip Details" : "تفاصيل الرحلة"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tripData.fromAddress && (
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">{language === "en" ? "From:" : "من:"}</span>
              <span className="font-medium text-right flex-1 ml-2">{tripData.fromAddress}</span>
            </div>
          )}
          {tripData.toAddress && (
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">{language === "en" ? "To:" : "إلى:"}</span>
              <span className="font-medium text-right flex-1 ml-2">{tripData.toAddress}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{language === "en" ? "Vehicle:" : "المركبة:"}</span>
            <span className="font-medium capitalize">{tripData.vehicle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{language === "en" ? "Time:" : "الوقت:"}</span>
            <span className="font-medium">{tripData.time}</span>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex items-center justify-around py-3 max-w-md mx-auto">
          <Button variant="ghost" size="lg" className="flex-col gap-1 h-auto py-2" onClick={() => onNavigate("home")}>
            <Home className="w-6 h-6" />
            <span className="text-xs">{language === "en" ? "Home" : "الرئيسية"}</span>
          </Button>
          <Button variant="ghost" size="lg" className="flex-col gap-1 h-auto py-2 text-blue-500">
            <Route className="w-6 h-6" />
            <span className="text-xs font-medium">{language === "en" ? "Results" : "النتائج"}</span>
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
