'use client'

import dynamic from 'next/dynamic'

const GamePage = dynamic(() => import('./game-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function Page() {
  return <GamePage />
}
