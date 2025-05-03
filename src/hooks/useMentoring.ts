import { useState, useEffect, useCallback, useMemo } from 'react'

export interface MentoringSession {
  id: number
  studentId: number
  userId: string
  category: number
  requestDescription: string
  title: string
  beginsAt: string
  endsAt: string
  duration: number
  cost: string
  status: string
  confirmed: boolean
}

type SlotStatus = 'none' | 'reserved' | 'available'

interface FetchResponse<T> {
  message: string
  data: T
  count: number
}

export interface GetMentoringParams {
  id?: number
  userId: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
}

/**
 * Hook para obtener sesiones y slots reservados con fetch nativo
 */
export function useGetMentoring(params: GetMentoringParams) {
  const [sessions, setSessions] = useState<MentoringSession[]>([])
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const query = new URLSearchParams()
    if (params.id)        query.set('id', params.id.toString())
    query.set('userId',   params.userId)
    if (params.status)    query.set('status', params.status)
    if (params.dateFrom)  query.set('dateFrom', params.dateFrom)
    if (params.dateTo)    query.set('dateTo', params.dateTo)
    query.set('page',     ((params.page ?? 10).toString()))

    const url = `/api/mentoring?${query.toString()}`

    setLoading(true)
    setError(null)

    fetch(url)
      .then(async res => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Error fetching mentoring')
        return json as FetchResponse<MentoringSession[]>
      })
      .then(body => {
        setSessions(body.data)
        setCount(body.count)
      })
      .catch(err => {
        setError(err.message)
        setSessions([])
        setCount(0)
      })
      .finally(() => setLoading(false))
  }, [params.id, params.userId, params.status, params.dateFrom, params.dateTo, params.page])

  /**
   * Mapea las sesiones a un registro de slots reservados: "Lunes-10"→"reserved"
   */
  const reservedSlots = useMemo<Record<string, SlotStatus>>(() => {
    const map: Record<string, SlotStatus> = {}
    sessions.forEach(s => {
      const date = new Date(s.beginsAt)
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' })
      const hour = date.getHours()
      map[`${dayName}-${hour}`] = 'reserved'
    })
    return map
  }, [sessions])

  return { sessions, count, loading, error, reservedSlots }
}

/**
 * Hook para crear sesión (POST)
 */
export function useCreateMentoring() {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<boolean>(false)

  const create = useCallback(async (body: {
    studentId: string
    professorId: number
    category: number
    date: string
    time: string
    duration: string
    cost: string
    title: string
    requestDescription: string
  }) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/mentoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Error creating mentoring')
      setSuccess(true)
      return json
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error, success }
}

/**
 * Hook para actualizar estado (PUT)
 */
export function useUpdateMentoringStatus() {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<boolean>(false)

  const updateStatus = useCallback(async (payload: {
    id: number
    status: string
  }) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/mentoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Error updating mentoring')
      setSuccess(json.success === true)
      return json
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateStatus, loading, error, success }
}
