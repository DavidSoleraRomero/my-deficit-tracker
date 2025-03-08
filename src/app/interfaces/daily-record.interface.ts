export interface DailyRecord {
    date: string;           // Format: YYYY-MM-DD
    entries: CalorieEntry[];     // Array of calorie entries
    exerciseEntries?: ExerciseEntry[];   // Array of exercise entries
    bmr?: number;           // Basal Metabolic Rate for the day (stored only if a record is created)
}

export interface CalorieEntry {
    food: string;
    calories: number;        
}

export interface ExerciseEntry {
    activity: string;       
    calories: number; 
}