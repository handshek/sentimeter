export type ResponseVolumePoint = {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
};

export function formatResponseVolumeSummary({
  rangeLabel,
  points,
}: {
  rangeLabel: string;
  points: ResponseVolumePoint[];
}) {
  const totals = points.reduce(
    (summary, point) => ({
      total: summary.total + point.total,
      positive: summary.positive + point.positive,
      neutral: summary.neutral + point.neutral,
      negative: summary.negative + point.negative,
    }),
    { total: 0, positive: 0, neutral: 0, negative: 0 },
  );

  if (totals.total === 0) {
    return `Response volume for ${rangeLabel}: no responses.`;
  }

  const periodLabel = points.length === 1 ? "time period" : "time periods";
  return `Response volume for ${rangeLabel}: ${totals.total} total responses — ${totals.positive} positive, ${totals.neutral} neutral, and ${totals.negative} negative across ${points.length} ${periodLabel}.`;
}
