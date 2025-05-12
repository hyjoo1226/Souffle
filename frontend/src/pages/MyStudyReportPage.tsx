import ProgressReport from "@/components/myStudyReport/ProgressReport/ProgressReport";
import AssessmentReport from "@/components/myStudyReport/AssessmentReport/AssessmentReport";
import { useState } from "react";

const MyStudyReportPage = () => {
  const [selectedTab, setSelectedTab] = useState<"learning" | "assessment">(
    "learning"
  );
  return (
    <div className="grid grid-cols-12 gap-x-4 h-screen ">
      <div className="sticky top-0 col-span-3 py-5 border-r border-gray-200 flex flex-col items-center">
        <p className="body-small text-gray-700 mb-11">
          수플래와 함께 <span className="text-primary-500">253</span>일째 성장
          중!
        </p>

        {/* 내 정보 */}
        <div className="flex flex-col gap-3 items-center mb-30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
              <img src="/icons/plus.png" alt="수정하기" className="w-6 h-6" />
            </div>
            <div className="flex gap-1 text-gray-700">
              <p>퉁퉁퉁퉁 이승주</p>
              <img src="/icons/update.png" alt="수정하기" className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-500 body-small px-2.5 py-1.25 rounded-[100px] w-fit bg-gray-100">
            happypigs7@gmail.com
          </div>
        </div>

        {/* 리포트 탭 */}
        <div className="flex flex-col gap-12 text-gray-500 headline-small">
          {/* 학습 리포트 탭 */}
          <div
            className="flex gap-3 items-center cursor-pointer"
            onClick={() => setSelectedTab("learning")}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                selectedTab === "learning" ? "bg-primary-500" : "bg-gray-500"
              }`}
            />
            <p className={selectedTab === "learning" ? "text-primary-500" : ""}>
              학습 리포트
            </p>
          </div>

          {/* 평가 리포트 탭 */}
          <div
            className="flex gap-3 items-center cursor-pointer"
            onClick={() => setSelectedTab("assessment")}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                selectedTab === "assessment" ? "bg-primary-500" : "bg-gray-500"
              }`}
            />
            <p
              className={selectedTab === "assessment" ? "text-primary-500" : ""}
            >
              평가 리포트
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-9 flex flex-col items-center">
        {selectedTab === "learning" && <ProgressReport />}
        {selectedTab === "assessment" && <AssessmentReport />}
      </div>
    </div>
  );
};
export default MyStudyReportPage;
