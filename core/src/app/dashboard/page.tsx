'use client'

import { getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export default async function Dashboard() {
    const session = await getServerSession(authOptions)
    
    if(!session) {
        return new NextResponse(JSON.stringify({error: 'unauthorized'}), {
            status: 401
        })
        redirect('/api/auth/signin')
    }

    return <>Super Secret Page</>
}