import React, { useEffect } from 'react'

export default function useApp2ConsoleMessage(message: string) {
  useEffect(() => {
    console.log(`app2 hook with data: ${message}`)
  })
}