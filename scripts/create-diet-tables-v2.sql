-- Create tables for diet planner app
CREATE TABLE IF NOT EXISTS diet_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  day_type VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  meals_completed JSONB DEFAULT '{}',
  supplements_completed BOOLEAN[] DEFAULT ARRAY[false, false, false, false],
  water_intake INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for custom meal selections
CREATE TABLE IF NOT EXISTS meal_customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  meal_name VARCHAR(50) NOT NULL,
  food_item VARCHAR(200) NOT NULL,
  custom_food VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, meal_name, food_item)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diet_days_date ON diet_days(date);
CREATE INDEX IF NOT EXISTS idx_meal_customizations_date ON meal_customizations(date);
