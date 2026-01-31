import { Brain } from "lucide-react";

export default function TokenUsageBadge({ usage }) {
  if (!usage) return null;

  const percent = Math.min(
    (usage.tokensUsedThisMonth / usage.monthlyTokenLimit) * 100,
    100,
  );

  const color =
    percent > 70
      ? "bg-green-500"
      : percent > 40
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
      <Brain className="w-4 h-4 text-blue-600" />
      <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden">
        <div className={`h-2 ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-medium">{Math.round(percent)}%</span>
    </div>
  );
}
