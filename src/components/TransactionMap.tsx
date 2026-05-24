import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { formatAddress } from "../utils/format";
import type { LiveTransfer } from "../hooks/useTransferEvents";

type Props = {
  events: LiveTransfer[];
  reduceMotion: boolean;
};

type NodePos = {
  address: string;
  x: number;
  y: number;
  volume: number;
  count: number;
  lastSeenAt: number;
};

type EdgeData = {
  key: string;
  fromAddr: string;
  toAddr: string;
  count: number;
};

type ParticleKind = "real" | "ambient";

type ActiveParticle = {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startTime: number;
  durationMs: number;
  kind: ParticleKind;
};

const VIEW_SIZE = 600;
const CENTER = VIEW_SIZE / 2;
const MAX_NODES = 16;
const PARTICLE_DURATION = 2200;
const AMBIENT_PARTICLE_MS = 850;
const MAX_PARTICLES = 14;

const PALETTE = {
  real: { core: "#B87333", halo: "#E6B97A" },
  ambient: { core: "#84644D", halo: "#D4C4B0" },
} as const;

const ringRadiusFor = (count: number): number => {
  if (count <= 1) return 0;
  if (count === 2) return 110;
  if (count <= 4) return 150;
  if (count <= 8) return 190;
  return 220;
};

const angleOffsetFor = (count: number): number => {
  if (count === 2) return 0;
  return -Math.PI / 2;
};

const computeLayout = (
  events: LiveTransfer[],
): { nodes: Map<string, NodePos>; edges: Map<string, EdgeData> } => {
  const stats = new Map<string, { volume: number; count: number; lastSeen: number }>();
  const edgeCounts = new Map<string, EdgeData>();

  for (const ev of events) {
    const amount = Number(ev.amount);
    if (!Number.isFinite(amount)) continue;
    const ts = ev.timestamp;

    for (const addr of [ev.from, ev.to]) {
      const prev = stats.get(addr) ?? { volume: 0, count: 0, lastSeen: 0 };
      prev.volume += amount;
      prev.count += 1;
      prev.lastSeen = Math.max(prev.lastSeen, ts);
      stats.set(addr, prev);
    }

    const key = ev.from < ev.to ? `${ev.from}|${ev.to}` : `${ev.to}|${ev.from}`;
    const e = edgeCounts.get(key) ?? {
      key,
      fromAddr: ev.from,
      toAddr: ev.to,
      count: 0,
    };
    e.count += 1;
    edgeCounts.set(key, e);
  }

  const sorted = Array.from(stats.entries())
    .sort((a, b) => b[1].volume - a[1].volume)
    .slice(0, MAX_NODES);

  const radius = ringRadiusFor(sorted.length);
  const offset = angleOffsetFor(sorted.length);

  const nodes = new Map<string, NodePos>();
  sorted.forEach(([address, s], i) => {
    if (sorted.length === 1) {
      nodes.set(address, {
        address,
        x: CENTER,
        y: CENTER,
        volume: s.volume,
        count: s.count,
        lastSeenAt: s.lastSeen,
      });
      return;
    }
    const angle = (i / sorted.length) * Math.PI * 2 + offset;
    nodes.set(address, {
      address,
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius,
      volume: s.volume,
      count: s.count,
      lastSeenAt: s.lastSeen,
    });
  });

  return { nodes, edges: edgeCounts };
};

const nodeRadius = (volume: number, maxVolume: number): number => {
  if (maxVolume <= 0) return 12;
  const ratio = Math.sqrt(Math.max(volume, 0) / maxVolume);
  return 10 + ratio * 18;
};

export function TransactionMap({ events, reduceMotion }: Props) {
  const { nodes, edges } = useMemo(() => computeLayout(events), [events]);

  const maxVolume = useMemo(() => {
    let max = 0;
    nodes.forEach((n) => {
      if (n.volume > max) max = n.volume;
    });
    return max;
  }, [nodes]);

  const maxEdgeCount = useMemo(() => {
    let max = 0;
    edges.forEach((e) => {
      if (e.count > max) max = e.count;
    });
    return max;
  }, [edges]);

  const seenEventIds = useRef<Set<string>>(new Set());
  const [particles, setParticles] = useState<ActiveParticle[]>([]);
  const [hovered, setHovered] = useState<NodePos | null>(null);
  const tickRef = useRef(0);
  const [, forceRender] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;
    if (events.length === 0) return;

    const fresh: ActiveParticle[] = [];
    for (const ev of events) {
      if (seenEventIds.current.has(ev.id)) continue;
      seenEventIds.current.add(ev.id);
      const from = nodes.get(ev.from);
      const to = nodes.get(ev.to);
      if (!from || !to) continue;
      fresh.push({
        id: ev.id,
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        startTime: performance.now() + fresh.length * 80,
        durationMs: PARTICLE_DURATION,
        kind: "real",
      });
    }
    if (fresh.length === 0) return;
    setParticles((prev) => {
      const next = [...prev, ...fresh];
      return next.slice(-MAX_PARTICLES);
    });
  }, [events, nodes, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    if (edges.size === 0 || nodes.size < 2) return;

    const id = setInterval(() => {
      const edgeArr = Array.from(edges.values());
      const edge = edgeArr[Math.floor(Math.random() * edgeArr.length)];
      const from = nodes.get(edge.fromAddr);
      const to = nodes.get(edge.toAddr);
      if (!from || !to) return;
      const direction = Math.random() < 0.5;
      const fromNode = direction ? from : to;
      const toNode = direction ? to : from;
      setParticles((prev) => {
        if (prev.length >= MAX_PARTICLES - 2) return prev;
        return [
          ...prev,
          {
            id: `ambient-${performance.now()}-${Math.random()}`,
            fromX: fromNode.x,
            fromY: fromNode.y,
            toX: toNode.x,
            toY: toNode.y,
            startTime: performance.now(),
            durationMs: PARTICLE_DURATION,
            kind: "ambient",
          },
        ];
      });
    }, AMBIENT_PARTICLE_MS);

    return () => clearInterval(id);
  }, [edges, nodes, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    if (particles.length === 0) return;
    const loop = () => {
      const now = performance.now();
      setParticles((prev) =>
        prev.filter((p) => now - p.startTime < p.durationMs),
      );
      tickRef.current = (tickRef.current + 1) % 1_000_000;
      forceRender(tickRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [particles.length, reduceMotion]);

  const renderedNodes = Array.from(nodes.values());
  const renderedEdges = Array.from(edges.values());
  const now = performance.now();

  const ParticleSegment = ({ p }: { p: ActiveParticle }) => {
    const t = Math.min(1, (now - p.startTime) / p.durationMs);
    if (t < 0) return null;
    const eased = 1 - Math.pow(1 - t, 2);
    const x = p.fromX + (p.toX - p.fromX) * eased;
    const y = p.fromY + (p.toY - p.fromY) * eased;
    const palette = PALETTE[p.kind];
    const alpha = 1 - Math.pow(t, 2.5);
    const trailLen = p.kind === "ambient" ? 0.06 : 0.12;
    const tailT = Math.max(0, eased - trailLen);
    const tailX = p.fromX + (p.toX - p.fromX) * tailT;
    const tailY = p.fromY + (p.toY - p.fromY) * tailT;
    const coreR = p.kind === "ambient" ? 3 : 5;
    const haloR = p.kind === "ambient" ? 10 : 16;
    return (
      <g opacity={alpha}>
        <line
          x1={tailX}
          y1={tailY}
          x2={x}
          y2={y}
          stroke={palette.halo}
          strokeWidth={p.kind === "ambient" ? 2 : 3}
          strokeLinecap="round"
          opacity={0.55}
        />
        <circle cx={x} cy={y} r={haloR} fill={palette.halo} opacity={0.35} />
        <circle cx={x} cy={y} r={coreR} fill={palette.core} />
      </g>
    );
  };

  const empty = renderedNodes.length === 0;

  return (
    <section
      id="transaction-map"
      className="max-w-7xl mx-auto px-6 py-20"
      aria-label="Live transaction map"
    >
      <div className="text-center max-w-3xl mx-auto mb-10">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          LIVE ACTIVITY MAP
        </p>
        <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
          HMZ flows,
          <span className="block font-semibold italic text-coffee-800">
            quietly visualised.
          </span>
        </h2>
        <p className="mt-5 text-base leading-7 text-coffee-700 font-light">
          Every transfer becomes a particle of light, traveling between wallets.
          Hover any node for its address and total HMZ volume.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2.25rem] bg-white/90 backdrop-blur-xl border border-white shadow-[0_30px_80px_-45px_rgba(67,48,36,0.25),inset_0_1px_0_rgba(255,255,255,1)] p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-4 border-b border-coffee-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="relative inline-flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-amber-500"></span>
              {!reduceMotion && (
                <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-60"></span>
              )}
            </span>
            <span className="text-xs font-semibold text-coffee-950">
              {renderedNodes.length} wallets · {renderedEdges.length} edges
            </span>
          </div>
          <span className="font-mono text-[10px] text-coffee-500">
            {particles.length} in flight
          </span>
        </div>

        <div className="relative">
          {empty ? (
            <div className="py-24 text-center max-w-md mx-auto">
              <Icon
                icon="solar:graph-new-linear"
                className="text-4xl text-coffee-300 mx-auto mb-3"
              />
              <p className="text-sm font-semibold text-coffee-800 mb-1">
                No activity to map yet
              </p>
              <p className="text-xs text-coffee-500 font-light leading-5">
                Send some HMZ on Sepolia to see transfers light up the network.
              </p>
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
              className="w-full aspect-square max-w-2xl mx-auto"
              role="img"
              aria-label={`Transaction map with ${renderedNodes.length} wallets and ${renderedEdges.length} edges`}
            >
              <defs>
                <radialGradient id="hmz-map-bg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F2E6D8" stopOpacity="0.55" />
                  <stop offset="70%" stopColor="#FAF8F5" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hmz-node-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E6B97A" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#E6B97A" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hmz-map-center" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E6B97A" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#E6B97A" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle
                cx={CENTER}
                cy={CENTER}
                r={250}
                fill="url(#hmz-map-bg)"
              />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={60}
                fill="url(#hmz-map-center)"
              />

              {renderedEdges.map((e) => {
                const from = nodes.get(e.fromAddr);
                const to = nodes.get(e.toAddr);
                if (!from || !to) return null;
                const weight = maxEdgeCount > 0 ? e.count / maxEdgeCount : 0;
                const opacity = 0.18 + weight * 0.55;
                const strokeWidth = 1 + weight * 2;
                return (
                  <line
                    key={e.key}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#84644D"
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                  />
                );
              })}

              {renderedNodes.map((n) => {
                const r = nodeRadius(n.volume, maxVolume);
                const isHot = now - n.lastSeenAt < 3000;
                return (
                  <g
                    key={n.address}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(n)}
                    onBlur={() => setHovered(null)}
                    tabIndex={0}
                    style={{ cursor: "pointer", outline: "none" }}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r + 12}
                      fill="url(#hmz-node-glow)"
                      className={reduceMotion ? "" : "hmz-node-aura"}
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill={isHot ? "#A07053" : "#84644D"}
                      stroke="#FAF8F5"
                      strokeWidth="2"
                    />
                    <text
                      x={n.x}
                      y={n.y + r + 14}
                      textAnchor="middle"
                      className="select-none"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "9px",
                        fontWeight: 600,
                        fill: "#6C4F3B",
                      }}
                    >
                      {formatAddress(n.address)}
                    </text>
                    <title>
                      {formatAddress(n.address)} · {n.volume.toFixed(2)} HMZ · {n.count} hops
                    </title>
                  </g>
                );
              })}

              {!reduceMotion &&
                particles.map((p) => <ParticleSegment key={p.id} p={p} />)}
            </svg>
          )}

          {hovered && (
            <div className="absolute top-3 left-3 rounded-xl bg-white/95 backdrop-blur border border-coffee-200 px-3 py-2 text-xs shadow-md pointer-events-none">
              <p className="font-mono font-semibold text-coffee-950">
                {formatAddress(hovered.address)}
              </p>
              <p className="text-[10px] text-coffee-600 font-light">
                {hovered.volume.toFixed(2)} HMZ · {hovered.count} hops
              </p>
            </div>
          )}
        </div>

        {!empty && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-coffee-500 font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: PALETTE.real.core }}
              ></span>
              Real transfer
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: PALETTE.ambient.core }}
              ></span>
              Ambient flow
            </span>
          </div>
        )}

        <table className="sr-only">
          <caption>Wallets in the activity map</caption>
          <thead>
            <tr>
              <th>Address</th>
              <th>Total HMZ Volume</th>
              <th>Transfer Count</th>
            </tr>
          </thead>
          <tbody>
            {renderedNodes.map((n) => (
              <tr key={n.address}>
                <td>{n.address}</td>
                <td>{n.volume.toFixed(2)}</td>
                <td>{n.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
