"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon, Navigation, Home, BarChart3, Route, Clock, MapPin, TrendingUp, RotateCcw,Zap } from "lucide-react"
import type { Page } from "../page"

interface DashboardPageProps {
  language: "en" | "ar"
  darkMode: boolean
  onNavigate: (page: Page) => void
  onToggleLanguage: () => void
  onToggleTheme: () => void
}

export default function DashboardPage({
  language,
  darkMode,
  onNavigate,
  onToggleLanguage,
  onToggleTheme,
}: DashboardPageProps) {
  const [weeklyData] = useState({
    kmAvoided: 23,
    timeSaved: { hours: 1, minutes: 15 },
    tripsOptimized: 5,
    dailyTimeSaved: [
      { day: language === "en" ? "Mon" : "الإثنين", minutes: 12 },
      { day: language === "en" ? "Tue" : "الثلاثاء", minutes: 8 },
      { day: language === "en" ? "Wed" : "الأربعاء", minutes: 15 },
      { day: language === "en" ? "Thu" : "الخميس", minutes: 20 },
      { day: language === "en" ? "Fri" : "الجمعة", minutes: 25 },
      { day: language === "en" ? "Sat" : "السبت", minutes: 10 },
      { day: language === "en" ? "Sun" : "الأحد", minutes: 5 },
    ],
  })

  const handleResetData = () => {
    // Simulate data reset
    alert(language === "en" ? "Data has been reset!" : "تم إعادة تعيين البيانات!")
  }

  const maxMinutes = Math.max(...weeklyData.dailyTimeSaved.map((d) => d.minutes))

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Navigation className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold text-foreground">
            {language === "en" ? "Your Weekly Impact" : "تأثيرك الأسبوعي"}
          </h1>
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

      {/* Metric Cards */}
      <div className="space-y-4 mb-6">
        {/* Kilometers Avoided */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  {language === "en" ? "Distance Avoided" : "المسافة المتجنبة"}
                </p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {weeklyData.kmAvoided} {language === "en" ? "km" : "كم"}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {language === "en" ? "this week" : "هذا الأسبوع"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Saved */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                  {language === "en" ? "Time Saved" : "الوقت المُوفر"}
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {weeklyData.timeSaved.hours}
                  {language === "en" ? "h " : "س "}
                  {weeklyData.timeSaved.minutes}
                  {language === "en" ? "m" : "د"}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {language === "en" ? "this week" : "هذا الأسبوع"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips Optimized */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
                  {language === "en" ? "Routes Improved" : "الطرق المُحسنة"}
                </p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{weeklyData.tripsOptimized}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {language === "en" ? "routes optimized" : "طريق محسن"}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{language === "en" ? "Time Saved Per Day" : "الوقت المُوفر يومياً"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyData.dailyTimeSaved.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-sm font-medium text-muted-foreground">{day.day}</div>
                <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm font-medium text-right">
                  {day.minutes}
                  {language === "en" ? "m" : "د"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button
        onClick={handleResetData}
        variant="outline"
        className="w-full h-12 text-lg font-medium mb-8 bg-transparent"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        {language === "en" ? "Reset Data" : "إعادة تعيين البيانات"}
      </Button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex items-center justify-around py-3 max-w-md mx-auto">
          <Button variant="ghost" size="lg" className="flex-col gap-1 h-auto py-2" onClick={() => onNavigate("home")}>
            <Home className="w-6 h-6" />
            <span className="text-xs">{language === "en" ? "Home" : "الرئيسية"}</span>
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
          <Button variant="ghost" size="lg" className="flex-col gap-1 h-auto py-2 text-blue-500">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">{language === "en" ? "Dashboard" : "لوحة القيادة"}</span>
          </Button>
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="h-20"></div>
    </div>
  )
}
