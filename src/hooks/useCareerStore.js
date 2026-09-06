import { useCallback, useEffect, useMemo, useState } from 'react'

const emptyData = { applications: [], hours: [], courses: [] }
async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Something went wrong.')
  return response.status === 204 ? null : response.json()
}

export function useCareerStore() {
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => { try { setLoading(true); setError(''); setData(await request('/api/data')) } catch (err) { setError('Could not reach your data service. Start the API or check its database connection.') } finally { setLoading(false) } }, [])
  useEffect(() => { refresh() }, [refresh])
  const save = async (operation) => { try { setError(''); await operation(); await refresh() } catch (err) { setError(err.message) } }
  const actions = useMemo(() => ({
    addApplication: (entry) => save(() => request('/api/applications', { method: 'POST', body: JSON.stringify(entry) })),
    updateApplication: (id, entry) => save(() => request(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify(entry) })),
    removeApplication: (id) => save(() => request(`/api/applications/${id}`, { method: 'DELETE' })),
    addHours: (entry) => save(() => request('/api/hours', { method: 'POST', body: JSON.stringify(entry) })),
    removeHours: (id) => save(() => request(`/api/hours/${id}`, { method: 'DELETE' })),
    addCourse: (entry) => save(() => request('/api/courses', { method: 'POST', body: JSON.stringify(entry) })),
    updateCourse: (id, entry) => save(() => request(`/api/courses/${id}`, { method: 'PATCH', body: JSON.stringify(entry) })),
    removeCourse: (id) => save(() => request(`/api/courses/${id}`, { method: 'DELETE' })),
  }), [refresh])
  return { ...data, ...actions, loading, error, refresh }
}
