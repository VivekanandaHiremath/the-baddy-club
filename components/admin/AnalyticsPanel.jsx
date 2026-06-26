'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { Loader2, IndianRupee, Users, BadgeCheck, Clock, CalendarDays, MapPin } from 'lucide-react'
import { apiGet } from '@/lib/adminApi'
import { inr } from '@/lib/format'
import { Empty } from './ui'

const PINK = '#E65C9C'
const PIE_COLORS = ['#F472B6', '#E65C9C', '#DB2777', '#9D174D']

function Kpi({ icon: Icon, label, value }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
      <div className="w-10 h-10 rounded-xl bg-[#E65C9C]/10 border border-[#E65C9C]/20 flex items-center justify-center">
        <Icon className="w-5 h-5" style={{ color: PINK }} />
      </div>
      <div className="font-black text-3xl mt-3 tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">{label}</div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
      <div className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">{title}</div>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  )
}

const tooltipStyle = { borderRadius: 12, border: '1px solid #eee', fontSize: 12, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)' }

export default function AnalyticsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('admin/analytics').then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-7 h-7 animate-spin" style={{ color: PINK }} /></div>
  if (!data) return <Empty>Could not load analytics.</Empty>

  const k = data.kpis
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={IndianRupee} label="Revenue" value={inr(k.revenue)} />
        <Kpi icon={Users} label="Registrations" value={k.total_registrations} />
        <Kpi icon={BadgeCheck} label="Paid / Confirmed" value={k.paid} />
        <Kpi icon={Clock} label="Pending review" value={k.pending} />
        <Kpi icon={BadgeCheck} label="Shortlisted" value={k.shortlisted} />
        <Kpi icon={CalendarDays} label="Events" value={k.events} />
        <Kpi icon={MapPin} label="Venues" value={k.venues} />
        <Kpi icon={Users} label="Players" value={k.players} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Registrations · last 14 days">
          <AreaChart data={data.timeseries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gReg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PINK} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PINK} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="registrations" stroke={PINK} strokeWidth={2.5} fill="url(#gReg)" />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Revenue · last 14 days">
          <BarChart data={data.timeseries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => inr(v)} />
            <Bar dataKey="revenue" fill={PINK} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Application funnel">
          <BarChart data={data.statusFunnel} layout="vertical" margin={{ top: 5, right: 16, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="status" tick={{ fontSize: 11, textTransform: 'capitalize' }} width={80} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#DB2777" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Skill distribution">
          <PieChart>
            <Pie data={data.skillSplit} dataKey="count" nameKey="skill" cx="50%" cy="50%" outerRadius={85} label={(e) => `${e.skill} (${e.count})`} labelLine={false} fontSize={11}>
              {data.skillSplit.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ChartCard>
      </div>

      <ChartCard title="Event fill rate (%)">
        <BarChart data={data.perEventFill} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v, n, p) => [`${v}%  (${p.payload.booked}/${p.payload.total})`, 'Fill']} />
          <Bar dataKey="fill" fill={PINK} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  )
}
