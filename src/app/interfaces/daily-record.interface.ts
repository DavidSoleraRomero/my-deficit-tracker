export interface DailyRecord {
    date: string;           // Format: YYYY-MM-DD
    entries: CalorieEntry[];     // Array of calorie entries
    bmr?: number;           // Basal Metabolic Rate for the day (stored only if a record is created)
    caloriesLost?: number;  // Approximate calories lost during the day
}

export interface CalorieEntry {
    food: string;
    calories: number;        
}