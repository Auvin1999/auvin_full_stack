import { Pagination as AntPagination } from 'antd'
import { useTranslation } from 'react-i18next'

interface PaginationProps {
  total: number
  page: number
  limit: number
  pageSizes?: number[]
  onChange: (page: number, limit: number) => void
}

export default function Pagination({ total, page, limit, pageSizes = [10, 20, 30, 50], onChange }: PaginationProps) {
  const { t } = useTranslation()

  if (total <= 0) return null

  return (
    <div className="pagination-wrapper">
      <AntPagination
        current={page}
        pageSize={limit}
        total={total}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => t('total', { count: total })}
        pageSizeOptions={pageSizes}
        onChange={(p, ps) => onChange(p, ps)}
        size="default"
      />
    </div>
  )
}
