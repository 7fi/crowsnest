import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

export default function RegattaRankings() {
  const { regattaName } = useParams()

  useEffect(() => {
    console.log(regattaName)
  }, [regattaName])

  return <>{regattaName}</>
}
