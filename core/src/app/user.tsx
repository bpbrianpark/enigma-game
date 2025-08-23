'use client'

import { useSession } from "next-auth/react"

export const User = () => {
    // First time you call it, it will be undefined/null
    // Needs to load, getting session info from server first
    const {data:session} = useSession()
    return<pre>{JSON.stringify(session)}</pre>
}