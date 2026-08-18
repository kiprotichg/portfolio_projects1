import { useState } from 'react'
import { api } from '../../api.js'
import { Card, CardTitle, CardSub, Input, Select, Textarea, PrimaryBtn, Toast, Grid2 } from '../../components/UI.jsx'

const INDUSTRIES = ['Education','Healthcare','Corporate','Hospitality','Retail','Construction','Government','Events & Conferences','NGO / Non-Profit','Manufacturing','Technology','Other']
const BLANK = { org_name:'', industry:'', event_name:'', date:'', location:'', notes:'' }

export default function AdminSetup({ onCreated }) {
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  function set(k,v) { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:null})) }

  function validate() {
    const e = {}
    if (!form.org_name.trim())   e.org_name   = 'Required'
    if (!form.industry)          e.industry   = 'Required'
    if (!form.event_name.trim()) e.event_name = 'Required'
    if (!form.date)              e.date       = 'Required'
    setErrors(e); return !Object.keys(e).length
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true); setMsg(null)
    try {
      const session = await api.createSession(form)
      setForm(BLANK)
      onCreated(session)
    } catch(err) {
      setMsg({ type:'error', text: err.message })
    } finally { setLoading(false) }
  }

  return (
    <div className="fu">
      <Card>
        <CardTitle>Create New Session</CardTitle>
        <CardSub>Fill in session details to generate a QR attendance code.</CardSub>
        <Grid2>
          <Input label="Organization / Company *" placeholder="Acme Corp…" value={form.org_name} error={errors.org_name} onChange={e=>set('org_name',e.target.value)} />
          <Select label="Industry *" value={form.industry} error={errors.industry} onChange={e=>set('industry',e.target.value)} style={{ color: form.industry ? 'var(--text)' : 'var(--text3)' }}>
            <option value="">Select industry…</option>
            {INDUSTRIES.map(o=><option key={o} value={o}>{o}</option>)}
          </Select>
          <Input label="Event / Session Name *" placeholder="Morning Shift, CS101…" value={form.event_name} error={errors.event_name} onChange={e=>set('event_name',e.target.value)} />
          <Input label="Date *" type="date" value={form.date} error={errors.date} onChange={e=>set('date',e.target.value)} />
          <Input label="Location / Room" placeholder="Hall A, Ward 3, Online…" value={form.location} onChange={e=>set('location',e.target.value)} />
          <Textarea label="Notes (optional)" placeholder="Extra info…" value={form.notes} onChange={e=>set('notes',e.target.value)} />
        </Grid2>
        <Toast msg={msg} />
        <PrimaryBtn style={{ marginTop:'1.5rem', opacity: loading?.7:1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating…' : 'Generate QR Code →'}
        </PrimaryBtn>
      </Card>
    </div>
  )
}
