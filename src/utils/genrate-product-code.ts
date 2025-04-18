import { v4 as uuidv4 } from "uuid";

export function generateRandomUniqueCode(code: string): string {
  const currentDate = new Date();

  // Convert the date to a string with format YYYYMMDD
  const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, "");

  // Generate a random 3-digit number
  const randomNumber = Math.floor(Math.random() * 900) + 100;

  // Add a UUID segment for absolute uniqueness
  const uniqueId = uuidv4().substring(0, 8);

  return `${code}${dateString}${randomNumber}${uniqueId}`;
}
