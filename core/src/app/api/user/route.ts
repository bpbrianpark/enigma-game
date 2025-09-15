import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hash } from "bcrypt";
import * as z from 'zod'

const userSchema = z.object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(1, 'Password is required').min(8, 'Password is too weak.'),
})

export async function POST(req: NextRequest) {
    try { 
        const body = await req.json();
        const { email, username, password } = userSchema.parse(body)
        console.log("Body: ", body)

        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: email }
        });

        const existingUserByUsername = await prisma.user.findUnique({
            where: { username: username }
        });

        if (existingUserByEmail) {
            return NextResponse.json({user: null, message: "User with this email already exists"})
        }

        if (existingUserByUsername) {
            return NextResponse.json({user: null, message: "User with this username already exists"}, { status: 409 })
        }

        const hashedPassword = await hash(password, 10);

        console.log("About to post.")

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        const { password: newUserPassword, ...rest } = newUser;

        return NextResponse.json({ user: rest, message: "User created successfully"}, { status: 201 })
    } catch(e) {
        return NextResponse.json({ message: "User was not created"}, { status: 500 })
    }
}