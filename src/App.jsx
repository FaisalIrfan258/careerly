import { useEffect, useState } from 'react'
import Icon from './components/Icon'
import { useCareerStore } from './hooks/useCareerStore'
import DashboardPage from './features/dashboard/DashboardPage'
import ApplicationsPage from './features/applications/ApplicationsPage'
import HoursPage from './features/hours/HoursPage'
import LearningPage from './features/learning/LearningPage'
import './App.css'

const pages = { dashboard: DashboardPage, applications: ApplicationsPage, hours: HoursPage, learning: LearningPage }
const navItems = [['dashboard', 'Overview', 'grid'], ['applications', 'Applications', 'briefcase'], ['hours', 'Work hours', 'clock'], ['learning', 'SAP learning', 'book']]

function App() {
  const [page, setPage] = useState('dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('careerly-theme') || 'light')
  const store = useCareerStore()
  const ActivePage = pages[page]
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('careerly-theme', theme) }, [theme])
  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">C</span><span>Careerly</span></div><p className="workspace-label">FAISAL'S WORKSPACE</p><nav>{navItems.map(([id, label, icon]) => <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => setPage(id)}><Icon name={icon}/>{label}</button>)}</nav><div className="sidebar-bottom"><div className="goal-mini"><span className="spark">✦</span><div><strong>Career goal</strong><small>Find the right next role</small></div><Icon name="target" size={18}/></div><div className="profile"><span className="avatar">F</span><span><strong>Faisal</strong><small>Student in Germany</small></span></div></div></aside>
    <section className="main-content"><header className="topbar"><div className="mobile-brand">Careerly</div><div className="date"><Icon name="calendar" size={16}/>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div><button className="theme-switch" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle colour theme">{theme === 'light' ? <Icon name="moon" size={17}/> : <Icon name="sun" size={17}/>}<span>{theme === 'light' ? 'Dark' : 'Light'}</span></button><button className="top-add" onClick={() => setPage('applications')}><Icon name="plus" size={16}/>Add application</button></header><ActivePage store={store} setPage={setPage}/></section>
  </main>
}
export default App
