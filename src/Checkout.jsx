import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "cookie-universal";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cookies = Cookies();

  const course = location.state?.course;

  const [studentName, setStudentName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
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

  const handlePayment = () => {
    // ✅ الصح: accessToken
    const accessToken =
      cookies.get("accessToken") || localStorage.getItem("accessToken");

    // 1️⃣ لو مش عامل لوجين
    if (!accessToken) {
      navigate("/login", {
        state: {
          redirectTo: "/checkout",
          course,
        },
      });
      return;
    }

    // 2️⃣ تحقق من البيانات
    if (!studentName || !lastName || !email) {
      setError("من فضلك أدخل جميع البيانات");
      return;
    }

    setError("");

    // 3️⃣ التوجه لبوابة الدفع
navigate(
  `/paymob-payment/${course.courseId}/${course.coursePrice}/${encodeURIComponent(course.courseName)}`
)



  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 p-6 pt-20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          صفحة الدفع
        </h1>

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

        {/* بيانات الطالب */}
        <div className="space-y-4">
          {error && (
            <p className="text-red-500 font-semibold text-center">
              {error}
            </p>
          )}

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

        {/* زر الدفع */}
        <button
          onClick={handlePayment}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          ادفع الآن
        </button>
      </div>
    </div>
  );
};

export default Checkout;
