"use client"
import Link from "next/link"
import { Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthProviderButton, AuthProviderSeparator } from "@/components/auth-providers"
import { useAuth } from "@/components/auth/auth-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs: typeof errors = {}

    if (!form.email) {
      errs.email = "Email is required"
    }

    if (!form.password) {
      errs.password = "Password is required"
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters"
    } else if (!/[a-z]/.test(form.password)) {
      errs.password = "Password must include a lowercase letter"
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = "Password must include an uppercase letter"
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password)) {
      errs.password = "Password must include a special character"
    }

    if (form.confirmPassword !== form.password) {
      errs.confirmPassword = "Passwords do not match"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
    setErrors({ ...errors, [e.target.id]: "" }) // clear specific field error on change
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)

    try {
      const response = await register(form.email, form.password, form.email)
      toast.success(response?.message || "Register success")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error?.message || "fails")
      setErrors({ email: error.message || "Registration failed" })
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="mb-8 flex items-center gap-2 font-semibold">
        <Wallet className="h-5 w-5" />
        <span>PropFlow</span>
      </div>
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              disabled={loading}
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              disabled={loading}
              placeholder="*******"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              disabled={loading}
              type="password"
              placeholder="*******"
              value={form.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          <AuthProviderSeparator />

          <AuthProviderButton provider="google" label="Sign up with Google" />

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
