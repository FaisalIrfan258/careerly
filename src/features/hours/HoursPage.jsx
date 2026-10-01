import { useEffect, useMemo, useState } from 'react'
import Icon from '../../components/Icon'

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthKey(date = new Date()) {
  return localDateString(date).slice(0, 7)
}

function blankShift() {
  return { date: localDateString(), hours: '', rate: '', note: '' }
}

function monthTitle(value) {
  const date = new Date(`${value}-01T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatShiftDate(value) {
  const datePart = String(value || '').slice(0, 10)
  const date = new Date(`${datePart}T12:00:00`)
  if (Number.isNaN(date.getTime())) return datePart || 'No date'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function HoursPage({ store }) {
  const [form, setForm] = useState(blankShift)
  const [currentMonth, setCurrentMonth] = useState(monthKey)
  const [selectedMonth, setSelectedMonth] = useState(monthKey)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextMonth = monthKey()
      if (nextMonth !== currentMonth) {
        setCurrentMonth(nextMonth)
        setSelectedMonth((selected) => selected === currentMonth ? nextMonth : selected)
      }
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [currentMonth])

  const months = useMemo(() => {
    const available = new Set([currentMonth, ...store.hours.map((item) => String(item.date).slice(0, 7))])
    return [...available].filter(Boolean).sort((a, b) => b.localeCompare(a))
  }, [currentMonth, store.hours])

  const monthShifts = useMemo(
    () => store.hours.filter((item) => String(item.date).slice(0, 7) === selectedMonth),
    [store.hours, selectedMonth],
  )
  const totalHours = useMemo(
    () => monthShifts.reduce((sum, item) => sum + Number(item.hours), 0),
    [monthShifts],
  )
  const totalPay = useMemo(
    () => monthShifts.reduce((sum, item) => sum + Number(item.hours) * Number(item.rate), 0),
    [monthShifts],
  )

  function submit(event) {
    event.preventDefault()
    store.addHours(form)
    setSelectedMonth(String(form.date).slice(0, 7))
    setForm(blankShift())
  }

  return <div className="page feature-page">
    <section className="page-title">
      <div>
        <p className="eyebrow">CURRENT JOB</p>
        <h1>Work hours & pay</h1>
        <p className="subtle">Each shift is filed under its month, with past monthly summaries kept available.</p>
      </div>
    </section>

    <section className="month-toolbar panel">
      <div>
        <p className="section-kicker">MONTHLY RECORD</p>
        <h2>{monthTitle(selectedMonth)}</h2>
      </div>
      <label className="month-picker">View month
        <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} aria-label="View shift records for month">
          {months.map((month) => <option value={month} key={month}>{monthTitle(month)}{month === currentMonth ? ' · Current' : ''}</option>)}
        </select>
      </label>
    </section>

    <section className="metric-grid">
      <article className="metric-card"><span className="metric-icon"><Icon name="clock"/></span><p>Hours in {monthTitle(selectedMonth)}</p><strong>{totalHours.toFixed(1)}<em>h</em></strong></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="euro"/></span><p>Estimated gross pay</p><strong>€{totalPay.toFixed(2)}</strong></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="calendar"/></span><p>Shifts this month</p><strong>{monthShifts.length}</strong></article>
    </section>

    <section className="two-column">
      <article className="panel form-panel">
        <div><p className="section-kicker">NEW SHIFT</p><h2>Log work hours</h2></div>
        <form className="entry-form" onSubmit={submit}>
          <div className="form-grid">
            <label>Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required/></label>
            <label>Hours worked<input type="number" min="0.25" step="0.25" value={form.hours} onChange={(event) => setForm({ ...form, hours: event.target.value })} required placeholder="e.g. 5.5"/></label>
          </div>
          <div className="form-grid">
            <label>Hourly rate (€)<input type="number" min="1" step="0.01" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} required placeholder="e.g. 14.00"/></label>
            <label>Estimated pay<input value={form.hours && form.rate ? `€${(Number(form.hours) * Number(form.rate)).toFixed(2)}` : ''} disabled placeholder="Calculated automatically"/></label>
          </div>
          <label>Note <span>(optional)</span><input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="e.g. Evening shift, remote work"/></label>
          <button className="primary-action">Save shift <Icon name="arrow" size={16}/></button>
        </form>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div><p className="section-kicker">MONTH SUMMARY</p><h2>{monthTitle(selectedMonth)} shifts</h2></div>
        </div>
        {monthShifts.length ? <div className="shift-list">
          {monthShifts.map((item) => <div className="shift-row" key={item.id}>
            <span className="shift-date"><Icon name="calendar" size={15}/>{formatShiftDate(item.date)}</span>
            <div><strong>{Number(item.hours).toFixed(2)}h</strong><small>{item.note || 'Work shift'}</small></div>
            <span className="pay-tag">€{(Number(item.hours) * Number(item.rate)).toFixed(2)}</span>
            <button className="row-delete" onClick={() => store.removeHours(item.id)} aria-label={`Delete shift on ${formatShiftDate(item.date)}`}><Icon name="trash" size={16}/></button>
          </div>)}
        </div> : <div className="empty-state full">
          <span><Icon name="clock"/></span>
          <h3>No shifts for {monthTitle(selectedMonth)}</h3>
          <p>This month’s record is ready. Log a shift to start its summary.</p>
        </div>}
      </article>
    </section>
  </div>
}
