"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Series {
  key: string;
  color: string; // rgb() css value, not a tailwind class
  label: string;
}

export function TrendAreaChart({
  data,
  xKey,
  series,
  height = 240,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--color-outline-variant))" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "rgb(var(--color-on-surface-variant))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: "rgb(var(--color-on-surface-variant))" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{
            background: "rgb(var(--color-surface-container-lowest))",
            border: "1px solid rgb(var(--color-outline-variant))",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#fill-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({
  data,
  xKey,
  series,
  height = 240,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--color-outline-variant))" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "rgb(var(--color-on-surface-variant))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "rgb(var(--color-on-surface-variant))" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{
            background: "rgb(var(--color-surface-container-lowest))",
            border: "1px solid rgb(var(--color-outline-variant))",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
