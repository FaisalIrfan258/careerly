import { useMemo, useState } from 'react'
import Icon from '../../components/Icon'
const blank = { date: new Date().toISOString().slice(0, 10), hours: '', rate: '', note: '' }
function formatShiftDate(value) {
  const datePart = String(value || '').slice(0, 10)
  const date = new Date(`${datePart}T12:00:00`)
  if (Number.isNaN(date.getTime())) return datePart || 'No date'
  return date.toLocaleDateString('en-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}
export default function HoursPage({ store }) {
  const [form, setForm] = useState(blank)
  const totalHours = useMemo(() => store.hours.reduce((sum, item) => sum + Number(item.hours), 0), [store.hours])
  const totalPay = useMemo(() => store.hours.reduce((sum, item) => sum + Number(item.hours) * Number(item.rate), 0), [store.hours])
  function submit(event) { event.preventDefault(); store.addHours(form); setForm({ ...blank, date: new Date().toISOString().slice(0, 10) }) }
  return <div className="page feature-page"><section className="page-title"><div><p className="eyebrow">CURRENT JOB</p><h1>Work hours & pay</h1><p className="subtle">Log every shift and keep a simple estimate of your earnings.</p></div></section>
    <section className="metric-grid"><article className="metric-card"><span className="metric-icon"><Icon name="clock"/></span><p>Total hours</p><strong>{totalHours.toFixed(1)}<em>h</em></strong></article><article className="metric-card"><span className="metric-icon"><Icon name="euro"/></span><p>Estimated gross pay</p><strong>€{totalPay.toFixed(2)}</strong></article><article className="metric-card"><span className="metric-icon"><Icon name="calendar"/></span><p>Shifts logged</p><strong>{store.hours.length}</strong></article></section>
    <section className="two-column"><article className="panel form-panel"><div><p className="section-kicker">NEW SHIFT</p><h2>Log work hours</h2></div><form className="entry-form" onSubmit={submit}><div className="form-grid"><label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required/></label><label>Hours worked<input type="number" min="0.25" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required placeholder="e.g. 5.5"/></label></div><div className="form-grid"><label>Hourly rate (€)<input type="number" min="1" step="0.01" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} required placeholder="e.g. 14.00"/></label><label>Estimated pay<input value={form.hours && form.rate ? `€${(Number(form.hours) * Number(form.rate)).toFixed(2)}` : ''} disabled placeholder="Calculated automatically"/></label></div><label>Note <span>(optional)</span><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Evening shift, remote work"/></label><button className="primary-action">Save shift <Icon name="arrow" size={16}/></button></form></article>
      <article className="panel"><div className="panel-heading"><div><p className="section-kicker">YOUR RECORD</p><h2>Recent shifts</h2></div></div>{store.hours.length ? <div className="shift-list">{store.hours.map((item) => <div className="shift-row" key={item.id}><span className="shift-date"><Icon name="calendar" size={15}/>{formatShiftDate(item.date)}</span><div><strong>{Number(item.hours).toFixed(2)}h</strong><small>{item.note || 'Work shift'}</small></div><span className="pay-tag">€{(Number(item.hours) * Number(item.rate)).toFixed(2)}</span><button className="row-delete" onClick={() => store.removeHours(item.id)}><Icon name="trash" size={16}/></button></div>)}</div> : <div className="empty-state full"><span><Icon name="clock"/></span><h3>Your shift log is empty</h3><p>Add your first shift to track hours and pay.</p></div>}</article></section>
  </div>
}
