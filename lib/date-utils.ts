export function format(date: Date | string, formatString: string): string {
  const d = typeof date === "string" ? new Date(date) : date

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = months[d.getMonth()]
  const day = String(d.getDate()).padStart(2, "0")
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")

  // Support common formats
  if (formatString === "MMM dd, HH:mm") {
    return `${month} ${day}, ${hours}:${minutes}`
  }
  if (formatString === "MMM dd HH:mm") {
    return `${month} ${day} ${hours}:${minutes}`
  }
  if (formatString === "MMM dd, yyyy HH:mm") {
    return `${month} ${day}, ${year} ${hours}:${minutes}`
  }

  // Fallback
  return d.toLocaleString()
}
