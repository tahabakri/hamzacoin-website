import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUnits } from "ethers";
import { Icon } from "@iconify/react";
import {
  groupByDay,
  type DailyVolumePoint,
  type RawTransferEvent,
} from "../utils/transfers";

type Props = {
  events: RawTransferEvent[];
  decimals: bigint | null;
  account: string;
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
        {point.volume.toFixed(2)} HMZ sent
      </p>
    </div>
  );
};

export default function PersonalChart({
  events,
  decimals,
  account,
  animate,
}: Props) {
  const data = useMemo<DailyVolumePoint[]>(() => {
    if (!decimals || !account) return [];
    const lower = account.toLowerCase();
    const outgoing = events.filter((e) => e.from.toLowerCase() === lower);
    return groupByDay(outgoing, decimals, 30);
  }, [events, decimals, account]);

  const totalSent = useMemo(() => {
    if (!decimals || !account) return 0;
    const lower = account.toLowerCase();
    return events
      .filter((e) => e.from.toLowerCase() === lower)
      .reduce((sum, e) => sum + Number(formatUnits(e.value, decimals)), 0);
  }, [events, decimals, account]);

  const hasData = data.some((d) => d.volume > 0);

  return (
    <div className="rounded-[clamp(1rem,3vw,1.85rem)] bg-white/80 backdrop-blur border border-coffee-200 p-4 sm:p-5 md:p-6 shadow-[inset_0_1px_0_white]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-coffee-500 font-semibold">
            YOUR ACTIVITY
          </p>
          <h3 className="mt-1 text-lg font-bold text-coffee-950">
            HMZ sent by you — last 30 days
          </h3>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] text-coffee-500 uppercase">
            Total
          </p>
          <p className="text-base font-bold text-coffee-950 tabular-nums">
            {totalSent.toFixed(2)} HMZ
          </p>
        </div>
      </div>

      {hasData ? (
        <div
          className="h-56 w-full"
          role="img"
          aria-label="Your daily HMZ outgoing transfers"
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
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
              <Tooltip
                content={<TooltipContent />}
                cursor={{ fill: "rgba(132,100,77,0.08)" }}
              />
              <Bar
                dataKey="volume"
                fill="#84644D"
                radius={[6, 6, 0, 0]}
                isAnimationActive={animate}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-coffee-500 font-light">
          <Icon
            icon="solar:inbox-linear"
            className="text-3xl text-coffee-300 mx-auto mb-3"
          />
          No outgoing transfers in the last 30 days.
          <br />
          Send your first HMZ to see it here.
        </div>
      )}

      <table className="sr-only">
        <caption>Your outgoing HMZ transfers, last 30 days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Volume (HMZ)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.dateKey}>
              <td>{d.label}</td>
              <td>{d.volume.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
