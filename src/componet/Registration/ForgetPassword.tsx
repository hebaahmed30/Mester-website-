"use client"
import { useState, useEffect, useContext } from "react"
import type React from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../Context/ThemeContext.jsx"
import sendRequest from "../Shared/sendRequest.ts"
import { BASEURL } from "../API/API.jsx"
import SpinnerModal from "../Shared/SpinnerModal.jsx"
import { toast } from "react-toastify"
import Cookies from "cookie-universal"

function ForgetPassword() {
  const cookies = Cookies()
  const { isDarkMode } = useContext(ThemeContext)
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const email = cookies.get("email")

      if (!email) {
        toast.error("الإيميل غير موجود، أعد المحاولة")
        return
      }

      const endpoint =
        `Accounts/ValidateCode?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&isForResetPassword=true`

      const res = await sendRequest(
        BASEURL,
        endpoint,
        "POST",
        undefined as any,
        {},
        false
      )

      console.log("VALIDATE CODE RESPONSE:", res.data)

      // 🔥 backend بيرجع STRING
      if (res.status === 200 && typeof res.data === "string") {
        cookies.set("identityToken", res.data, {
          path: "/",
          maxAge: 10 * 60
        })

        cookies.set("email", email, {
          path: "/",
          maxAge: 10 * 60
        })

        console.log("TOKEN SAVED:", cookies.get("identityToken"))

        toast.success("تم إدخال الكود بنجاح")
        navigate("/reset")
      } else {
        toast.error("كود غير صالح")
      }
    } catch {
      toast.error("خطأ في الكود")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    document.title = "إعادة تعيين كلمة المرور"
    return () => {
      document.title = "مستر أحمد جابر"
    }
  }, [])

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-neutral-900" : ""}`}>
      <SpinnerModal isLoading={isLoading} />

      <form onSubmit={handleFormSubmit} className="p-10">
        <input
          type="number"
          placeholder="ادخل الكود"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">إرسال الكود</button>
      </form>
    </div>
  )
}

export default ForgetPassword
