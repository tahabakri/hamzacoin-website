import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyVolumePoint } from "../utils/transfers";

type Props = {
  data: DailyVolumePoint[];
  animate: boolean;
};

const TooltipContent = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DailyVolumePoint }>;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl bg-white/95 border border-coffee-200 shadow-lg px-3 py-2 text-xs">
      <p className="font-mono text-[10px] text-coffee-500 uppercase tracking-wide">
        {point.label}
      </p>
      <p className="mt-1 font-semibold text-coffee-950">
        {point.volume.toFixed(2)} HMZ
      </p>
      <p className="text-[10px] text-coffee-600 font-light">
        {point.count} {point.count === 1 ? "transfer" : "transfers"}
      </p>
    </div>
  );
};

export default function DailyVolumeChart({ data, animate }: Props) {
  return (
    <div className="rounded-[clamp(1rem,3vw,1.85rem)] bg-white/80 backdrop-blur border border-coffee-200 p-4 sm:p-5 md:p-6 shadow-[inset_0_1px_0_white]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-coffee-500 font-semibold">
            DAILY VOLUME
          </p>
          <h3 className="mt-1 text-lg font-bold text-coffee-950">
            HMZ transferred — last 30 days
          </h3>
        </div>
      </div>

      <div className="h-64 w-full" role="img" aria-label="Daily HMZ transfer volume line chart">
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="hmz-volume-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84644D" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#84644D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E6DDD0" strokeDasharray="2 4" />
            <XAxis
              dataKey="label"
              stroke="#9E8169"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              stroke="#9E8169"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: "#D4C4B0" }} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#6C4F3B"
              strokeWidth={2}
              fill="url(#hmz-volume-grad)"
              isAnimationActive={animate}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Daily HMZ transfer volume, last 30 days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Volume (HMZ)</th>
            <th>Transfers</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.dateKey}>
              <td>{d.label}</td>
              <td>{d.volume.toFixed(2)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
