export function formatMinutes(totalMinutes: number): string {
  // Handle edge cases
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
    return "00:00";
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseDuration(input: string): number | null {
  if (!input || typeof input !== "string") {
    return null;
  }
  
  const [h, m] = input.split(":");
  if (!h || !m) {
    return null;
  }
  
  const hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);
  
  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59 || hours < 0) {
    return null;
  }
  
  return hours * 60 + minutes;
}

export function calculateDurationMinutes(startIso: string, endIso: string): number {
  try {
    const startTime = new Date(startIso).getTime();
    const endTime = new Date(endIso).getTime();
    
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      console.error("Invalid timestamps", { startIso, endIso, startTime, endTime });
      return 0;
    }
    
    const diffMs = Math.max(0, endTime - startTime);
    const minutes = Math.round(diffMs / 60000);
    
    // Return at least 0 (not 1)
    return Math.max(0, minutes);
  } catch (error) {
    console.error("Error calculating duration", error, { startIso, endIso });
    return 0;
  }
}
