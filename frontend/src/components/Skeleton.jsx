export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image skeleton-shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-shimmer" style={{ width: "75%", height: 20 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: 14, marginTop: 10 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "60%", height: 14, marginTop: 8 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 24, marginTop: 14 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "50%", height: 36, marginTop: 14 }} />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="skeleton-table-wrap">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="skeleton-line skeleton-shimmer" style={{ width: "60%", height: 12 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div
                    className="skeleton-line skeleton-shimmer"
                    style={{ width: `${40 + Math.random() * 40}%`, height: 14 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="skeleton-timeline">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="timeline-item" style={{ opacity: 1 - i * 0.2 }}>
          <div className="timeline-line">
            <div className="skeleton-dot skeleton-shimmer" />
            {i < 3 && <div className="skeleton-connector" />}
          </div>
          <div className="timeline-content" style={{ flex: 1 }}>
            <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 16 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: "25%", height: 12, marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="stat-row">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-stat" style={{ padding: "28px 24px" }}>
          <div className="skeleton-line skeleton-shimmer" style={{ width: "50%", height: 12, margin: "0 auto 12px" }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: "35%", height: 34, margin: "0 auto" }} />
        </div>
      ))}
    </div>
  );
}
