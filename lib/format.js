export const PINK = '#E65C9C'

// Optimize the supplied Unsplash / Pexels URLs on the fly.
export const opt = (url, w = 1200) =>
  !url
    ? url
    : url.includes('pexels.com')
      ? `${url}${url.includes('?') ? '&' : '?'}auto=compress&cs=tinysrgb&w=${w}`
      : url.includes('unsplash.com')
        ? `${url}${url.includes('?') ? '&' : '?'}q=80&w=${w}&auto=format&fit=crop`
        : url

export function formatDate(dt) {
  const d = new Date(dt)
  return d.toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
export function formatDateLong(dt) {
  const d = new Date(dt)
  return d.toLocaleString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
export function formatTime(dt) {
  const d = new Date(dt)
  return d.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit' })
}
export function formatDateInput(dt) {
  // For <input type="datetime-local"> value (local time, no seconds)
  const d = new Date(dt)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export function inr(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}
