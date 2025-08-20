"use client"

import { useState, useEffect } from "react"
import { supabase, type UserProfile } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoginForm from "@/components/auth/login-form"
import AdminPanel from "@/components/auth/admin-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Droplets,
  Minus,
  ChefHat,
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  LogOut,
  Settings,
} from "lucide-react"

// Macro data for different day types
const dayTypeData = {
  Descanso: { calories: 1978, carbs: 214, protein: 121, fat: 71 },
  Treino: { calories: 2275, carbs: 288, protein: 121, fat: 71 },
  Cardio: { calories: 2176, carbs: 263, protein: 121, fat: 71 },
  "Treino + Cardio": { calories: 2473, carbs: 337, protein: 121, fat: 71 },
}

const mealPlans = {
  Descanso: {
    Almoço: {
      time: "12:00",
      items: [
        "Arroz integral – 100g cozido (25g carb)",
        "Feijão preto – 120g (20g carb / 8g prot)",
        "Carne de panela – 120g (26g prot / 10g gord)",
        "Abóbora cozida – 100g (8g carb)",
        "Azeite e preparo – ~15g gordura (135 kcal)",
      ],
    },
    Lanche: {
      time: "16:00",
      items: [
        "Iogurte Itambé Zero – 1 unidade (9g prot / 8g carb)",
        "1 banana média (25g carb)",
        "Queijo minas – 40g (9g prot / 8g gord)",
      ],
    },
    Jantar: {
      time: "19:00",
      items: [
        "Purê de batata – 150g (30g carb / 3g gord)",
        "Frango grelhado – 130g (32g prot / 7g gord)",
        "Salada de alface/tomate – à vontade, azeite 1 colher (10g gord)",
      ],
    },
    Ceia: {
      time: "22:00",
      items: ["Ovos cozidos – 2 unidades (12g prot / 10g gord)", "Pão francês – 50g (28g carb / 4g prot)"],
    },
  },
  Treino: {
    Almoço: {
      time: "12:00",
      items: [
        "Arroz integral – 150g cozido (40g carb)",
        "Feijão preto – 120g (20g carb / 8g prot)",
        "Frango no molho – 150g (32g prot / 8g gord)",
        "Abóbora – 100g (8g carb)",
        "Óleo do preparo – 15g gordura",
      ],
    },
    Lanche: {
      time: "16:00",
      items: [
        "Iogurte Itambé Zero – 1 unidade",
        "1 maçã média (20g carb)",
        "Queijo mussarela – 30g (7g prot / 6g gord)",
      ],
    },
    Jantar: {
      time: "19:00",
      items: [
        "Macarrão alho e óleo – 150g cozido (45g carb / 10g gord)",
        "Carne moída – 130g (28g prot / 12g gord)",
        "Salada de repolho + azeite 1 colher (10g gord)",
      ],
    },
    Ceia: {
      time: "22:00",
      items: [
        "Ovos mexidos – 2 unidades (12g prot / 10g gord)",
        "Pão francês – 70g (38g carb / 5g prot)",
        "1 fatia de queijo minas – 20g",
      ],
    },
  },
  Cardio: {
    Almoço: {
      time: "12:00",
      items: [
        "Arroz integral – 120g cozido (32g carb)",
        "Feijão preto – 120g (20g carb / 8g prot)",
        "Frango grelhado – 150g (36g prot / 7g gord)",
        "Abóbora – 100g (8g carb)",
        "Óleo do preparo – 15g gordura",
      ],
    },
    Lanche: {
      time: "16:00",
      items: [
        "Iogurte Itambé Zero – 1 unidade",
        "1 fatia pão francês – 50g (28g carb / 4g prot)",
        "Queijo minas – 40g (9g prot / 8g gord)",
      ],
    },
    Jantar: {
      time: "19:00",
      items: [
        "Purê de batata – 150g (30g carb)",
        "Almôndegas (carne moída + molho) – 130g (25g prot / 12g gord)",
        "Salada de repolho e tomate + azeite 1 colher (10g gord)",
      ],
    },
    Ceia: {
      time: "22:00",
      items: ["Ovos cozidos – 2 unidades", "Banana pequena – 80g (18g carb)"],
    },
  },
  "Treino + Cardio": {
    Almoço: {
      time: "12:00",
      items: [
        "Arroz integral – 150g cozido (40g carb)",
        "Feijão preto – 150g (25g carb / 9g prot)",
        "Frango no molho – 150g (32g prot / 8g gord)",
        "Abóbora – 150g (12g carb)",
        "Óleo do preparo – 15g gordura",
      ],
    },
    Lanche: {
      time: "16:00",
      items: ["Iogurte Itambé Zero – 1 unidade", "1 banana + 1 maçã (45g carb)", "Queijo minas – 40g"],
    },
    Jantar: {
      time: "19:00",
      items: [
        "Macarrão alho e óleo – 200g cozido (60g carb / 12g gord)",
        "Carne moída – 150g (32g prot / 14g gord)",
        "Salada à vontade + azeite 1 colher (10g gord)",
      ],
    },
    Ceia: {
      time: "22:00",
      items: ["Ovos mexidos – 2 unidades", "Pão francês – 80g (44g carb / 6g prot)", "Queijo mussarela – 30g"],
    },
  },
}

const proteinOptions = [
  { name: "Frango grelhado/peito", portion: "130g", protein: "~30g", note: "Opção mais magra" },
  { name: "Frango no molho", portion: "150g", protein: "~32g", note: "Mais saboroso" },
  { name: "Coxa/sobrecoxa no molho", portion: "150g", protein: "~28g", note: "Mais gordura, já ajustado" },
  { name: "Carne moída 2ª ou patinho", portion: "130g", protein: "~28g", note: "Refogado" },
  { name: "Carne de panela", portion: "120-130g", protein: "~26g", note: "Bem macia" },
  { name: "Almôndega caseira", portion: "130g", protein: "~25g", note: "2 unidades médias" },
  { name: "Ovos cozidos/mexidos", portion: "2 ovos grandes", protein: "~12g", note: "Somar queijo para 25g" },
  { name: "Queijo minas/mussarela", portion: "40-50g", protein: "~15g", note: "Complemento, não principal" },
  { name: "Contrafilé (churrasco)", portion: "130g", protein: "~30g", note: "Final de semana" },
  { name: "Fraldinha (churrasco)", portion: "130g", protein: "~28g", note: "Final de semana" },
  { name: "Asinha de frango", portion: "150g", protein: "~25g", note: "Mais gordura, natural" },
]

const carbOptions = [
  { name: "Arroz integral", portion: "100g cozido", carbs: "~32g", note: "Base principal" },
  { name: "Feijão preto", portion: "120g cozido", carbs: "~20g", note: "+8g proteína extra" },
  { name: "Macarrão alho e óleo", portion: "100g cozido", carbs: "~30g", note: "Dias de treino" },
  { name: "Purê de batata", portion: "150g", carbs: "~30g", note: "Cremoso e saboroso" },
  { name: "Abóbora cozida", portion: "150g", carbs: "~12g", note: "Mais leve, combinar" },
  { name: "Pão francês", portion: "50g", carbs: "~28g", note: "Meio pão" },
  { name: "Banana média", portion: "1 unid (~100g)", carbs: "~25g", note: "Pré/pós treino" },
  { name: "Maçã média", portion: "1 unid (~130g)", carbs: "~20g", note: "Lanche da tarde" },
  { name: "Aveia", portion: "30g", carbs: "~18g", note: "No iogurte" },
]

const supplements = [
  { name: "Creatina", dose: "3g/dia", time: "Manhã" },
  { name: "Polivitamínico", dose: "1 cápsula", time: "Café da manhã" },
  { name: "Ômega-3", dose: "2g/dia", time: "Almoço" },
  { name: "Whey Protein", dose: "Opcional", time: "Pós-treino" },
]

type DietDay = {
  id: string
  date: string
  day_type: string
  completed: boolean
  meals_completed: { [key: string]: boolean }
  supplements_completed: boolean[]
  water_intake: number
  created_at: string
  updated_at: string
}

export default function DietPlanner() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [selectedDayType, setSelectedDayType] = useState<keyof typeof dayTypeData>("Descanso")
  const [waterIntake, setWaterIntake] = useState(0)
  const [supplementsChecked, setSupplementsChecked] = useState<boolean[]>(new Array(supplements.length).fill(false))
  const [mealsCompleted, setMealsCompleted] = useState<{ [key: string]: boolean }>({})
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [mealCustomizations, setMealCustomizations] = useState<{ [key: string]: { [key: string]: string } }>({})
  const [dietDays, setDietDays] = useState<{ [key: string]: any }>({})
  const [customMealItems, setCustomMealItems] = useState<{ [key: string]: string[] }>({})

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
        await loadTodayData()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
        await loadTodayData()
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      if (error) {
        if (error.message.includes("table") || error.message.includes("schema cache")) {
          console.log("[v0] User profiles table not created yet, using default profile")
          const {
            data: { session },
          } = await supabase.auth.getSession()
          const userEmail = session?.user?.email || ""
          const isAdmin = userEmail === "fernando.sousa027@gmail.com"

          const defaultProfile: UserProfile = {
            id: userId,
            email: userEmail,
            full_name: userEmail.split("@")[0] || "Usuário",
            role: isAdmin ? "admin" : "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          console.log("[v0] Created default profile:", defaultProfile)
          setUserProfile(defaultProfile)
          return
        }
        throw error
      }
      setUserProfile(data)
    } catch (error) {
      console.error("Error loading user profile:", error)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const userEmail = session?.user?.email || ""
      const isAdmin = userEmail === "fernando.sousa027@gmail.com"

      const fallbackProfile: UserProfile = {
        id: userId,
        email: userEmail,
        full_name: userEmail.split("@")[0] || "Usuário",
        role: isAdmin ? "admin" : "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Created fallback profile:", fallbackProfile)
      setUserProfile(fallbackProfile)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const loadTodayData = async () => {
    if (!user) return

    const today = new Date().toISOString().split("T")[0]

    try {
      const { data, error } = await supabase
        .from("diet_days")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()

      if (data) {
        setSelectedDayType(data.day_type as keyof typeof dayTypeData)
        setWaterIntake(data.water_intake)
        setSupplementsChecked(data.supplements_completed)
        setMealsCompleted(data.meals_completed)
      }
    } catch (error) {
      console.log("No data for today, using defaults")
    }
  }

  const saveDayData = async () => {
    if (!user) return

    const today = new Date().toISOString().split("T")[0]
    const completedMeals = Object.keys(mealPlans[selectedDayType]).filter((meal) => mealsCompleted[meal]).length
    const totalMeals = Object.keys(mealPlans[selectedDayType]).length
    const supplementsComplete = supplementsChecked.filter(Boolean).length
    const waterComplete = waterIntake >= 3500
    const isCompleted = completedMeals === totalMeals && supplementsComplete >= 2 && waterComplete

    try {
      const { error } = await supabase.from("diet_days").upsert({
        id: `${user.id}-${today}`,
        user_id: user.id,
        date: today,
        day_type: selectedDayType,
        completed: isCompleted,
        meals_completed: mealsCompleted,
        supplements_completed: supplementsChecked,
        water_intake: waterIntake,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update local state
      setDietDays((prev) => ({
        ...prev,
        [today]: {
          id: `${user.id}-${today}`,
          user_id: user.id,
          date: today,
          day_type: selectedDayType,
          completed: isCompleted,
          meals_completed: mealsCompleted,
          supplements_completed: supplementsChecked,
          water_intake: waterIntake,
        },
      }))
    } catch (error) {
      console.error("Error saving day data:", error)
    }
  }

  const customizeMealItem = async (mealName: string, originalItem: string, newItem: string) => {
    const today = new Date().toISOString().split("T")[0]

    const key = `${today}-${mealName}`
    setMealCustomizations((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [originalItem]: newItem,
      },
    }))

    console.log("[v0] Meal customization saved to local state")
  }

  const addCustomMealItem = (mealName: string) => {
    const key = `${new Date().toISOString().split("T")[0]}-${mealName}`
    setCustomMealItems((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), "Novo item - clique para editar"],
    }))
  }

  const removeCustomMealItem = (mealName: string, index: number) => {
    const key = `${new Date().toISOString().split("T")[0]}-${mealName}`
    setCustomMealItems((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }))
  }

  const updateCustomMealItem = (mealName: string, index: number, value: string) => {
    const key = `${new Date().toISOString().split("T")[0]}-${mealName}`
    setCustomMealItems((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((item, i) => (i === index ? value : item)),
    }))
  }

  const removeMealItem = (mealName: string, item: string) => {
    const today = new Date().toISOString().split("T")[0]
    const key = `${today}-${mealName}`

    // Add to removed items list
    setMealCustomizations((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [`__removed__${item}`]: "REMOVED",
      },
    }))
  }

  const isMealItemRemoved = (mealName: string, item: string) => {
    const today = new Date().toISOString().split("T")[0]
    const key = `${today}-${mealName}`
    return mealCustomizations[key]?.[`__removed__${item}`] === "REMOVED"
  }

  const currentMacros = dayTypeData[selectedDayType]
  const currentMealPlan = mealPlans[selectedDayType]
  const waterGoal = 3500
  const waterProgress = Math.min((waterIntake / waterGoal) * 100, 100)

  const addWater = (amount: number) => {
    setWaterIntake((prev) => {
      const newAmount = prev + amount
      setTimeout(() => saveDayData(), 100)
      return newAmount
    })
  }

  const toggleSupplement = (index: number) => {
    setSupplementsChecked((prev) => {
      const newChecked = [...prev]
      newChecked[index] = !newChecked[index]
      setTimeout(() => saveDayData(), 100)
      return newChecked
    })
  }

  const toggleMeal = (mealName: string) => {
    setMealsCompleted((prev) => {
      const newCompleted = {
        ...prev,
        [mealName]: !prev[mealName],
      }
      setTimeout(() => saveDayData(), 100)
      return newCompleted
    })
  }

  const getCalendarDays = () => {
    const days = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const today = new Date()

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split("T")[0]
      const dayData = dietDays[dateStr]
      const isToday = date.toDateString() === today.toDateString()

      days.push({
        date: dateStr,
        day: day,
        weekDay: date.toLocaleDateString("pt-BR", { weekday: "short" }),
        isToday,
        completed: dayData?.completed || false,
        dayType: dayData?.day_type,
        isCurrentMonth: true,
      })
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const getMealItemWithCustomization = (mealName: string, item: string) => {
    const today = new Date().toISOString().split("T")[0]
    const key = `${today}-${mealName}`
    return mealCustomizations[key]?.[item] || item
  }

  const progress = {
    meals: `${Object.keys(currentMealPlan).filter((meal) => mealsCompleted[meal]).length}/${Object.keys(currentMealPlan).length}`,
    supplements: `${supplementsChecked.filter(Boolean).length}/${supplements.length}`,
    water: waterIntake >= waterGoal,
    overall:
      Object.keys(currentMealPlan).filter((meal) => mealsCompleted[meal]).length ===
        Object.keys(currentMealPlan).length &&
      supplementsChecked.filter(Boolean).length >= 2 &&
      waterIntake >= waterGoal,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (showAdminPanel && userProfile?.role === "admin") {
    return (
      <div className="min-h-screen bg-background p-4 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAdminPanel(false)}>
              Voltar ao App
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
        <AdminPanel />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center space-y-1 sm:space-y-2 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
            Dieta Planner
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
            Olá, {userProfile?.full_name || user.email}! •{" "}
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          {userProfile?.role === "admin" && (
            <Button variant="outline" size="sm" onClick={() => setShowAdminPanel(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg lg:text-xl font-[family-name:var(--font-space-grotesk)]">
            Metas Nutricionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <div className="text-center p-2 sm:p-3">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{currentMacros.calories}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Calorias</div>
            </div>
            <div className="text-center p-2 sm:p-3">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-chart-2">{currentMacros.carbs}g</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Carboidratos</div>
            </div>
            <div className="text-center p-2 sm:p-3">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-chart-3">{currentMacros.protein}g</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Proteínas</div>
            </div>
            <div className="text-center p-2 sm:p-3">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-chart-4">{currentMacros.fat}g</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Gorduras</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Widget */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-[family-name:var(--font-space-grotesk)]">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Progresso da Dieta
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Acompanhe seu progresso diário. Complete refeições, suplementos e água para marcar o dia como sucesso.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-chart-2/10 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h3 className="text-sm sm:text-base font-semibold">Progresso de Hoje</h3>
              <Badge variant={progress.overall ? "default" : "secondary"} className="text-xs w-fit">
                {progress.overall ? "✅ Completo" : "🔄 Em andamento"}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3">
              <div className="text-center">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-chart-3">{progress.meals}</div>
                <div className="text-xs text-muted-foreground">Refeições</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-chart-4">{progress.supplements}</div>
                <div className="text-xs text-muted-foreground">Suplementos</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-primary">
                  {progress.water ? "✓" : "✗"}
                </div>
                <div className="text-xs text-muted-foreground">Água</div>
              </div>
            </div>
            <Button
              onClick={saveDayData}
              className="w-full text-xs sm:text-sm"
              variant={progress.overall ? "default" : "outline"}
            >
              {progress.overall ? "🎉 Salvar Dia Completo" : "💾 Salvar Progresso"}
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <h4 className="text-xs sm:text-sm lg:text-base font-medium">
                {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h4>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
              {getCalendarDays().map((day) => (
                <div key={day.date} className="aspect-square">
                  <div
                    className={`
                      w-full h-full rounded-md sm:rounded-lg flex flex-col items-center justify-center text-xs font-medium
                      transition-all hover:scale-105 cursor-pointer
                      ${day.isToday ? "ring-1 sm:ring-2 ring-primary shadow-sm sm:shadow-md" : ""}
                      ${
                        day.completed
                          ? "bg-green-500 text-white shadow-sm sm:shadow-md"
                          : day.isToday
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }
                    `}
                    title={`${day.date}${day.dayType ? ` - ${day.dayType}` : ""} ${day.completed ? "✅ Completo" : day.isToday ? "📅 Hoje" : "⏳ Pendente"}`}
                  >
                    <span className="font-bold text-xs">{day.day}</span>
                    {day.completed && <span className="text-[8px] sm:text-[10px]">✓</span>}
                    {day.isToday && !day.completed && <span className="text-[8px] sm:text-[10px]">•</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
                <span>Completo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary/20 rounded border border-primary/30"></div>
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-muted rounded"></div>
                <span>Pendente</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Type Selection */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg lg:text-xl font-[family-name:var(--font-space-grotesk)]">
            Tipo de Dia
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Selecione o tipo de dia para ajustar suas metas nutricionais
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.keys(dayTypeData).map((dayType) => (
              <Button
                key={dayType}
                variant={selectedDayType === dayType ? "default" : "outline"}
                onClick={() => {
                  setSelectedDayType(dayType as keyof typeof dayTypeData)
                  setTimeout(() => saveDayData(), 100)
                }}
                className="h-auto p-2 sm:p-3 text-xs sm:text-sm"
              >
                {dayType}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-[family-name:var(--font-space-grotesk)]">
            <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Cardápio Detalhado - {selectedDayType}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Clique nos alimentos para personalizar suas escolhas
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {Object.entries(currentMealPlan).map(([mealName, mealData]) => {
              const customItemsKey = `${new Date().toISOString().split("T")[0]}-${mealName}`
              const customItems = customMealItems[customItemsKey] || []

              return (
                <div key={mealName} className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative">
                        <Checkbox
                          checked={mealsCompleted[mealName] || false}
                          onCheckedChange={() => toggleMeal(mealName)}
                          className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary/60 data-[state=unchecked]:bg-background data-[state=unchecked]:border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold">{mealName}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {mealData.time}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {mealData.items.map((item, index) => {
                      const customizedItem = getMealItemWithCustomization(mealName, item)
                      const isCustomized = customizedItem !== item
                      const isRemoved = isMealItemRemoved(mealName, item)

                      if (isRemoved) return null

                      return (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <Select
                            value={customizedItem}
                            onValueChange={(value) => customizeMealItem(mealName, item, value)}
                          >
                            <SelectTrigger
                              className={`flex-1 h-auto p-2 text-left text-xs sm:text-sm min-w-0 ${isCustomized ? "bg-primary/10 border-primary/30" : "bg-transparent border-transparent"}`}
                            >
                              <SelectValue>
                                <span className={`${isCustomized ? "text-primary font-medium" : ""} truncate block`}>
                                  {customizedItem}
                                  {isCustomized && " ✨"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-w-[90vw]">
                              <SelectItem value={item}>{item} (Original)</SelectItem>
                              {(item.toLowerCase().includes("frango") ||
                                item.toLowerCase().includes("carne") ||
                                item.toLowerCase().includes("ovo") ||
                                item.toLowerCase().includes("queijo")) &&
                                proteinOptions.map((protein, idx) => (
                                  <SelectItem key={idx} value={`${protein.name} – ${protein.portion}`}>
                                    {protein.name} – {protein.portion}
                                  </SelectItem>
                                ))}
                              {(item.toLowerCase().includes("arroz") ||
                                item.toLowerCase().includes("pão") ||
                                item.toLowerCase().includes("macarrão") ||
                                item.toLowerCase().includes("batata") ||
                                item.toLowerCase().includes("banana") ||
                                item.toLowerCase().includes("feijão") ||
                                item.toLowerCase().includes("abóbora") ||
                                item.toLowerCase().includes("purê") ||
                                item.toLowerCase().includes("maçã") ||
                                item.toLowerCase().includes("aveia")) &&
                                carbOptions.map((carb, idx) => (
                                  <SelectItem key={idx} value={`${carb.name} – ${carb.portion}`}>
                                    {carb.name} – {carb.portion}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMealItem(mealName, item)}
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      )
                    })}

                    {customItems.map((item, index) => (
                      <div key={`custom-${index}`} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                        <Select value={item} onValueChange={(value) => updateCustomMealItem(mealName, index, value)}>
                          <SelectTrigger className="flex-1 h-auto p-2 text-left text-xs sm:text-sm bg-amber-50 border-amber-200 min-w-0">
                            <SelectValue>
                              <span className="text-amber-700 font-medium truncate block">{item} ⭐</span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-w-[90vw]">
                            <SelectItem value={item}>{item} (Personalizado)</SelectItem>
                            {proteinOptions.map((protein, idx) => (
                              <SelectItem key={idx} value={`${protein.name} – ${protein.portion}`}>
                                {protein.name} – {protein.portion}
                              </SelectItem>
                            ))}
                            {carbOptions.map((carb, idx) => (
                              <SelectItem key={idx} value={`${carb.name} – ${carb.portion}`}>
                                {carb.name} – {carb.portion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomMealItem(mealName, index)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomMealItem(mealName)}
                      className="w-full mt-2 text-xs border-dashed border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Adicionar Item Personalizado
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-3 sm:space-y-4">
        {/* Proteínas - Lista de Substituição */}
        <AccordionItem value="proteins" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 hover:no-underline">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-[family-name:var(--font-space-grotesk)]">
                <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-chart-3" />
                Proteínas - Lista de Substituição
              </CardTitle>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Opções de proteína (~25-32g de proteína)
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {proteinOptions.map((protein, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-chart-3/5 to-chart-3/10 rounded-lg border border-chart-3/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-chart-3 text-xs sm:text-sm lg:text-base truncate">
                          {protein.name}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {protein.portion} • {protein.protein}
                        </div>
                        <div className="text-xs text-muted-foreground italic">💡 {protein.note}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-chart-3/10 text-chart-3 border-chart-3/30 text-xs flex-shrink-0 ml-2"
                      >
                        {protein.protein}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Carboidratos - Lista de Substituição */}
        <AccordionItem value="carbs" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 hover:no-underline">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-[family-name:var(--font-space-grotesk)]">
                <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
                Carboidratos - Lista de Substituição
              </CardTitle>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Opções de carboidrato (~20-40g de carboidratos)
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {carbOptions.map((carb, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-chart-2/5 to-chart-2/10 rounded-lg border border-chart-2/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-chart-2 text-xs sm:text-sm lg:text-base truncate">
                          {carb.name}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {carb.portion} • {carb.carbs}
                        </div>
                        <div className="text-xs text-muted-foreground italic">💡 {carb.note}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-chart-2/10 text-chart-2 border-chart-2/30 text-xs flex-shrink-0 ml-2"
                      >
                        {carb.carbs}
                      </Badge>
                    </div>
                  ))}

                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Dica:</strong> Para ajustar carboidratos entre os tipos de dia, apenas aumente/diminua
                      1 porção dessas opções.
                    </p>
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      {/* Controle de Água */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-[family-name:var(--font-space-grotesk)]">
            <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Controle de Água
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span>
                {waterIntake}ml / {waterGoal}ml {waterIntake > waterGoal && "(Meta superada! 🎉)"}
              </span>
              <span>{Math.round(waterProgress)}%</span>
            </div>
            <Progress value={waterProgress} className="h-2 sm:h-3" />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addWater(250)} variant="outline" size="sm" className="text-xs flex-1 sm:flex-none">
              +250ml
            </Button>
            <Button onClick={() => addWater(500)} variant="outline" size="sm" className="text-xs flex-1 sm:flex-none">
              +500ml
            </Button>
            <Button
              onClick={() =>
                setWaterIntake((prev) => {
                  const newAmount = Math.max(prev - 250, 0)
                  setTimeout(() => saveDayData(), 100)
                  return newAmount
                })
              }
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manipulados / Suplementos */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg lg:text-xl font-[family-name:var(--font-space-grotesk)]">
            Manipulados / Suplementos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {supplements.map((supplement, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 sm:p-3 bg-muted rounded-lg">
                <div className="relative">
                  <Checkbox
                    checked={supplementsChecked[index]}
                    onCheckedChange={() => toggleSupplement(index)}
                    className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary/60 data-[state=unchecked]:bg-background data-[state=unchecked]:border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs sm:text-sm lg:text-base truncate">{supplement.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {supplement.dose} • {supplement.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
