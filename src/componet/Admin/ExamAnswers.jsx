import { useEffect, useState } from "react";
import sendRequestGet from "../Shared/sendRequestGet";
import { BASEURL } from "../API/API";
import { useParams } from "react-router-dom";


const ExamAnswers = () => {
  const [data, setData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { examId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await sendRequestGet(`${BASEURL}/Admin/exam-results`);
     if (Array.isArray(res.data)) {
  setData(res.data);
} else {
  console.log("API response:", res.data);
  setData([]);
}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  if (loading) return <h2>Loading...</h2>;

  return (
  <div className="min-h-screen p-6 bg-gray-50">
    <div className="max-w-6xl mx-auto">

      {/* العنوان */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          📊 نتائج الامتحانات
        </h1>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-3 rounded-full"></div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-center">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-3">عرض</th>
              <th>الدرجة</th>
              <th>رقم الامتحان</th>
              <th>اسم الطالب</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-gray-500">
                  لا توجد نتائج
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  
                  {/* زرار عرض */}
                  <td className="py-3">
                    <button
                      onClick={() => setSelectedStudent(item)}
                      className="text-blue-500 hover:underline"
                    >
                      عرض
                    </button>
                  </td>

                  {/* الدرجة */}
                  <td className="font-bold text-green-600">
                    {item.totalGrade}
                  </td>

                  {/* exam */}
                  <td>{item.examId}</td>

                  {/* student */}
                  <td className="font-semibold">
                    {item.studentName}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* تفاصيل الإجابات */}
      {selectedStudent && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            إجابات {selectedStudent.studentName}
          </h2>

          {(selectedStudent.answers || []).map((a, i) => (
            <div
              key={i}
              className={`p-4 mb-3 rounded-lg border ${
                a.grade > 0 ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
              }`}
            >
              <p className="font-semibold">السؤال: {a.questionText}</p>
              <p>الإجابة: {a.answerText}</p>
              <p className="font-bold">
                الدرجة: {a.grade}
              </p>
            </div>
          ))}

        </div>
      )}
    </div>
  </div>
);
};

export default ExamAnswers;