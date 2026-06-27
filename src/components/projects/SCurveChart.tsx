import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { Project } from '../../types';

export default function SCurveChart({ project }: { project: Project }) {
  if (!project.sCurve.length) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        S-Curve data not yet available (project not started)
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={project.sCurve}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
        <Tooltip formatter={(v: any) => [`${v}%`, '']} />
        <Legend iconSize={10} formatter={v => <span className="text-xs">{v}</span>} />
        <Line
          type="monotone"
          dataKey="planned"
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={{ r: 3 }}
          name="Planned"
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Actual"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
