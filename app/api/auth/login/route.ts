import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Login route error:", error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
