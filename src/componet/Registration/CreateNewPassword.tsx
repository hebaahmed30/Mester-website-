"use client"
import { useState, useEffect, useContext } from "react"
import type React from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../Context/ThemeContext.jsx"
import sendRequest from "../Shared/sendRequest.ts"
import { BASEURL, RESETPASSWORD_ENDPOINT } from "../API/API.jsx"
import SpinnerModal from "../Shared/SpinnerModal.jsx"
import { toast } from "react-toastify"
import Cookies from "cookie-universal"

function CreateNewPassword() {
  const cookies = Cookies()
  const { isDarkMode } = useContext(ThemeContext)

  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ✅ قراءة الكوكيز (بدون path)
      const email = cookies.get("email")
      const identityToken = cookies.get("identityToken")

      console.log("RESET COOKIES:", {
        email,
        identityToken,
        all: cookies.getAll()
      })

      // 🛑 Guard
      if (!email || !identityToken) {
        toast.error("بيانات إعادة التعيين غير مكتملة")
        return
      }

      const res = await sendRequest(
        BASEURL,
        RESETPASSWORD_ENDPOINT,
        "POST",
        JSON.stringify({
          Email: email,
          NewPassword: newPassword,
          IdentityToken: identityToken
        }),
        { "Content-Type": "application/json" },
        true
      )

      if (res.status === 200) {
        toast.success("تم تغيير كلمة السر بنجاح")

        // 🧹 تنظيف البيانات الحساسة
        cookies.remove("email", { path: "/" })
        cookies.remove("identityToken", { path: "/" })

        navigate("/login")
      } else {
        toast.error("فشل إعادة تعيين كلمة السر")
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إعادة التعيين")
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

      <div className="grid grid-cols-7 lg:grid-cols-10 gap-4 min-h-screen">
        <div className="col-span-5 col-start-3 pt-6">
          <div
            className={`font-medium mb-14 text-right text-[20px] ${
              isDarkMode ? "text-sky-400" : "text-amber-400"
            }`}
          >
            إعادة تعيين كلمة المرور
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 gap-4 mb-1">
              <div className="text-right">
                <label
                  htmlFor="newPassword"
                  className={`my-1 flex justify-end ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  كلمة السر الجديدة
                </label>

                <input
                  type="password"
                  id="newPassword"
                  placeholder="كلمة السر الجديدة"
                  className={`rounded-lg p-2 w-full text-right ${
                    isDarkMode ? "bg-white" : "bg-stone-300"
                  }`}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                type="submit"
                className={`rounded-[9px] shadow-xl px-4 lg:px-20 py-2 mb-52 text-white transition ${
                  isDarkMode
                    ? "bg-sky-400 hover:bg-sky-500"
                    : "bg-gray-800 hover:bg-gray-900"
                }`}
                disabled={isLoading}
              >
                تأكيد كلمة السر
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateNewPassword
