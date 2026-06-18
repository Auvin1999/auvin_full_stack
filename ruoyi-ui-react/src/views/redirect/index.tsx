import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function Redirect() {
  const navigate = useNavigate()
  const params = useParams()

  useEffect(() => {
    const path = params['*'] || ''
    navigate('/' + path, { replace: true })
  }, [])

  return null
}
