async function req(method, path, body) {
  const r = await fetch(`/api/${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || `${method} ${path} failed`)
  return d
}

export const apiGet = (p) => req('GET', p)
export const apiPost = (p, b) => req('POST', p, b)
export const apiPut = (p, b) => req('PUT', p, b)
export const apiDel = (p) => req('DELETE', p)
