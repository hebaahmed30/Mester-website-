import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "cookie-universal";
import {
  BASEURL,
  PAYMOB_START_WALLET_ENDPOINT,
  PAYMOB_START_KIOSK_ENDPOINT,
} from "../src/componet/API/API";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cookies = Cookies();

  const course = location.state?.course;

  const [studentName, setStudentName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("card"); 
  // card | wallet | kiosk

  const [kioskCode, setKioskCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // لو مفيش كورس
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>
          لم يتم اختيار أي كورس.{" "}
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 underline"
          >
            ارجع
          </button>
        </p>
      </div>
    );
  }

  const handlePayment = async () => {
  const accessToken =
    cookies.get("accessToken") || localStorage.getItem("accessToken");

  const studentId =
    cookies.get("id") || localStorage.getItem("id");

  // مش عامل لوجين
  if (!accessToken) {
    navigate("/login", {
      state: { redirectTo: "/checkout", course },
    });
    return;
  }

  // تحقق من البيانات
  if (!studentName || !lastName || !email) {
    setError("من فضلك أدخل جميع البيانات");
    return;
  }

  setError("");

  // =================================================
  // ✅ VISA / MASTER CARD
  // =================================================
  if (paymentMethod === "card") {
    navigate(
      `/paymob-payment/${course.courseId}/${course.coursePrice}/${encodeURIComponent(
        course.courseName
      )}`
    );
    return;
  }

  try {
    setLoading(true);

    // =================================================
    // WALLET
    // =================================================
    if (paymentMethod === "wallet") {
      if (!/^01\d{9}$/.test(phoneNumber)) {
        setError("رقم الموبايل غير صحيح");
        return;
      }

     const res = await fetch(
  `${BASEURL}/${PAYMOB_START_WALLET_ENDPOINT}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      courseId: course.courseId,
      studentId: Number(studentId),
      phoneNumber,
    }),
  }
);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Wallet payment failed");
      }

      const data = await res.json();
      window.location.href = data.redirectUrl;
    }

    // =================================================
    // KIOSK
    // =================================================
    if (paymentMethod === "kiosk") {
     const res = await fetch(
  `${BASEURL}/${PAYMOB_START_KIOSK_ENDPOINT}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      courseId: course.courseId,
      studentId: Number(studentId),
    }),
  }
);


      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Kiosk payment failed");
      }

      const data = await res.json();
      setKioskCode(data.referenceCode);
    }
  } catch (err) {
    console.error(err);
    setError("حدث خطأ أثناء عملية الدفع");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 p-6 pt-20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">صفحة الدفع</h1>

        {/* تفاصيل الكورس */}
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">
            {course.courseName}
          </h2>
          <p className="mb-2">{course.courseDescription}</p>
          <p className="font-bold">
            السعر: {course.coursePrice} جنيه
          </p>
        </div>

        {error && (
          <p className="text-red-500 font-semibold text-center mb-3">
            {error}
          </p>
        )}

        {/* بيانات الطالب */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="الاسم الأول"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="الاسم الثاني"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* طرق الدفع */}
        <div className="mt-6 space-y-2">
          <p className="font-semibold">اختر طريقة الدفع:</p>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            💳 فيزا / ماستر كارد (الطريقة المعتادة)
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={paymentMethod === "wallet"}
              onChange={() => setPaymentMethod("wallet")}
            />
            📱 محفظة موبايل
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={paymentMethod === "kiosk"}
              onChange={() => setPaymentMethod("kiosk")}
            />
            🏪 فوري / أمان / مصاري
          </label>
        </div>

        {/* رقم الموبايل للمحفظة */}
        {paymentMethod === "wallet" && (
          <input
            type="tel"
            placeholder="رقم الموبايل (01XXXXXXXXX)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-3"
          />
        )}

        {/* كود الكيوسك */}
        {kioskCode && (
          <div className="mt-6 p-4 border rounded bg-gray-100 text-center">
            <p className="font-semibold mb-2">كود الدفع:</p>
            <p className="text-xl font-bold tracking-widest">
              {kioskCode}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              متاح الدفع في فوري – أمان – مصاري – ممكن
            </p>
            <p className="mt-2 text-xs text-gray-500">
              سيتم تفعيل الكورس بعد إتمام الدفع
            </p>
          </div>
        )}

        {/* زر الدفع */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "جاري المعالجة..." : "ادفع الآن"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
