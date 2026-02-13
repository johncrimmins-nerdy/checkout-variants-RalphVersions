/**
 * Calculate the number of months since a client has churned
 * @param churnDate - The date when the client churned (ISO string)
 * @returns Number of months since churn
 */
export function calculateChurnMonths(churnDate: string): number {
  const churnDateObj = new Date(churnDate);
  const now = new Date();

  const yearDiff = now.getFullYear() - churnDateObj.getFullYear();
  const monthDiff = now.getMonth() - churnDateObj.getMonth();

  return yearDiff * 12 + monthDiff;
}
