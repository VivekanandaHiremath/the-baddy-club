'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Loader2, Calendar, Clock, MapPin, CheckCircle2, ArrowRight, ShieldCheck, Download, ArrowLeft,
} from 'lucide-react'
import { PinkButton, GhostButton, Pill } from '@/components/ui/buttons'
import { PINK, formatDateLong, formatTime, inr } from '@/lib/format'
import { toast } from 'sonner'

export default function PayPage() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [paying, setPaying] = useState(false)
  const [result, setResult] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/pay/${token}`)
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Invalid link')
      setData(d)
      if (d.registration?.payment_status === 'paid') {
        setResult({ qr_code_token: d.registration.qr_code_token, transaction_id: d.registration.transaction_id })
      }
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [token])

  const pay = async () => {
    setPaying(true)
    try {
      await new Promise(res => setTimeout(res, 1200))
      const r = await fetch('/api/webhooks/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'payment.captured', payment_token: token }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Payment failed')
      setResult(d)
      toast.success('Payment confirmed — see you on court!')
    } catch (e) {
      toast.error(e.message)
    } finally { setPaying(false) }
  }

  const reg = data?.registration
  const event = data?.event
  const paid = !!result || reg?.payment_status === 'paid'
  const qrToken = result?.qr_code_token || reg?.qr_code_token
  const qrUrl = qrToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=BADDY-${qrToken}&bgcolor=ffffff&color=000000&margin=12`
    : null

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 hero-glow">
      <div className="w-full max-w-md">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#E65C9C] mb-5">
          <ArrowLeft className="w-4 h-4" /> Back to The Baddy Club
        </a>

        <div className="bg-card rounded-3xl border border-border shadow-soft-lg p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow" style={{ background: 'linear-gradient(135deg, #F472B6, #DB2777)' }}>
              <span className="font-black text-xl text-white">B</span>
            </div>
            <span className="font-black text-lg tracking-tight">THE BADDY CLUB<span style={{ color: PINK }}>.</span></span>
          </div>

          {loading && <div className="py-16 flex justify-center"><Loader2 className="w-7 h-7 animate-spin" style={{ color: PINK }} /></div>}

          {!loading && error && (
            <div className="text-center py-10">
              <div className="font-black text-2xl">Link not valid</div>
              <p className="text-muted-foreground mt-2 text-sm">{error}</p>
              <a href="/"><GhostButton className="mt-6">Go to homepage</GhostButton></a>
            </div>
          )}

          {!loading && !error && reg && reg.status !== 'shortlisted' && reg.status !== 'paid' && !paid && (
            <div className="text-center py-10">
              <div className="font-black text-2xl">Not ready for payment</div>
              <p className="text-muted-foreground mt-2 text-sm">This application hasn't been shortlisted yet. We'll email you when there's a payment link to use.</p>
              <a href="/"><GhostButton className="mt-6">Back home</GhostButton></a>
            </div>
          )}

          {!loading && !error && event && (paid ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-glow" style={{ backgroundColor: PINK }}>
                <CheckCircle2 className="w-4 h-4" /> Payment Confirmed
              </div>
              <h1 className="font-black text-3xl mt-5 tracking-tight">Slot <span className="text-gradient">locked.</span></h1>
              {qrUrl && (
                <div className="mt-5 inline-block p-3 bg-white rounded-2xl border border-border shadow-soft">
                  <img src={qrUrl} alt="QR ticket" className="w-56 h-56" />
                </div>
              )}
              <div className="mt-4 font-mono text-xs text-muted-foreground">{qrToken}</div>
              <div className="mt-5 text-sm space-y-1">
                <div className="font-bold text-lg">{event.title}</div>
                <div className="text-muted-foreground">{formatDateLong(event.date_time)} · {formatTime(event.date_time)}</div>
                <div className="text-muted-foreground">{event.location_name}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-5">Show this QR at the venue. Your QR ticket also lives in My Portal.</p>
              <a href="/"><PinkButton className="mt-6 w-full">Done</PinkButton></a>
            </div>
          ) : reg?.status === 'shortlisted' ? (
            <>
              <Pill>You're shortlisted 🎉</Pill>
              <h1 className="font-black text-3xl mt-4 tracking-tight leading-tight">Confirm your <span className="text-gradient">spot.</span></h1>
              <p className="text-muted-foreground text-sm mt-2">Hi {reg.full_name?.split(' ')[0] || 'there'} — pay to lock your slot for this session.</p>

              <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-5">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: PINK }}>{event.tagline}</div>
                <h3 className="font-black text-xl mt-1">{event.title}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: PINK }} /> <b>{formatDateLong(event.date_time)}</b></div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" style={{ color: PINK }} /> <b>{formatTime(event.date_time)}</b></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: PINK }} /> <span className="text-muted-foreground">{event.location_name}</span></div>
                </div>
                <div className="border-t border-border mt-4 pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</div>
                    <div className="font-black text-3xl">{inr(reg.amount)}</div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">via Razorpay (Mock)</div>
                </div>
              </div>

              <PinkButton onClick={pay} disabled={paying} className="w-full mt-5">
                {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing payment...</> : <>Pay {inr(reg.amount)} & Lock Slot <ArrowRight className="w-4 h-4" /></>}
              </PinkButton>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Mock payment · Webhook fires payment.captured
              </div>
            </>
          ) : null)}
        </div>
      </div>
    </div>
  )
}
