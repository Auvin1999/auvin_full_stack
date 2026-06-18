interface PaginationProps {
  total: number
  page: number
  limit: number
  pageSizes?: number[]
  onChange: (page: number, limit: number) => void
}

export default function Pagination({ total, page, limit, pageSizes = [10, 20, 30, 50], onChange }: PaginationProps) {
  return (
    <div className="pagination-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <span>共 {total} 条</span>
        <select
          value={limit}
          onChange={(e) => onChange(1, Number(e.target.value))}
          style={{ padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
        >
          {pageSizes.map((s) => (
            <option key={s} value={s}>{s} 条/页</option>
          ))}
        </select>
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1, limit)}
          style={{ padding: '4px 8px', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        >
          ‹
        </button>
        <span style={{ minWidth: 30, textAlign: 'center' }}>{page}</span>
        <button
          disabled={page * limit >= total}
          onClick={() => onChange(page + 1, limit)}
          style={{ padding: '4px 8px', cursor: page * limit >= total ? 'not-allowed' : 'pointer' }}
        >
          ›
        </button>
      </div>
    </div>
  )
}
