import ProgressReport from "@/components/myStudyReport/ProgressReport/ProgressReport";
import AssessmentReport from "@/components/myStudyReport/AssessmentReport/AssessmentReport";
import { useEffect, useState } from "react";
import { patchRemakeNicknameApi } from "@/services/api/User";
import { User } from "@/types/User";
import { useUser } from "@/contexts/UserContext";

const MyStudyReportPage = () => {
  const [selectedTab, setSelectedTab] = useState<"learning" | "assessment">(
    "learning"
  );
  const [userInfo, setUserInfo] = useState<User>();
  const [isEditing, setIsEditing] = useState(false); // 닉네임 수정 중 여부
  const [editedNickname, setEditedNickname] = useState(""); // 입력 값
  const { setUser, user } = useUser();

  useEffect(() => {
    if (user) {
      setUserInfo(user);
    }
  }, [user]);

  const getDaysSince = (createdAt: string): number => {
    const createdDate = new Date(createdAt);
    const today = new Date();

    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const handleSubmitNickname = async () => {
    if (editedNickname.trim() === "" || editedNickname === userInfo?.nickname) {
      setIsEditing(false); // 변경 없음 → 그냥 닫기
      return;
    }

    try {
      await patchRemakeNicknameApi(editedNickname);
      setUserInfo((prev) =>
        prev ? { ...prev, nickname: editedNickname } : prev
      );

      setUser((prev) => (prev ? { ...prev, nickname: editedNickname } : prev));

      setIsEditing(false);
    } catch (error) {
      console.error("닉네임 수정 실패:", error);
      alert("닉네임 변경에 실패했습니다!");
    }
  };

  if (!userInfo) {
    return <p className="text-gray-600">로딩 중입니다...</p>;
  }

  return (
    <div className="grid grid-cols-12 gap-x-4 h-screen ">
      <div className="sticky top-0 col-span-5 sm:col-span-3 py-5 border-r border-gray-200 flex flex-col items-center">
        <p className="body-small text-gray-700 mb-11">
          수플래와 함께{" "}
          <span className="text-primary-500">
            {getDaysSince(userInfo?.createdAt) + 1}
          </span>
          일째 성장 중!
        </p>

        {/* 내 정보 */}
        {userInfo && (
          <div className="flex flex-col gap-3 items-center mb-30">
            <div className="flex items-center gap-4">
                <img 
                  src={userInfo.profileImage} 
                  alt="유저 프로필 이미지" 
                  className="w-10 h-10 rounded-full border border-gray-200" 
                  referrerPolicy="no-referrer" 
                />
              <div className="flex gap-1 text-gray-700">
                {isEditing ? (
                  <div className="flex gap-2 items-center">
                    <input
                      value={editedNickname}
                      onChange={(e) => setEditedNickname(e.target.value)}
                      className="border border-gray-300 px-2 py-1 rounded w-17.5"
                      autoFocus
                    />
                    <button
                      onClick={handleSubmitNickname}
                      className="body-medium text-white bg-primary-500 px-3 py-1 rounded"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="body-medium text-gray-500 bg-gray-200 px-3 py-1 rounded"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1 text-gray-700 items-center">
                    <p>{userInfo.nickname}</p>
                    <img
                      src="/icons/update.png"
                      alt="수정하기"
                      className="w-6 h-6 cursor-pointer"
                      onClick={() => {
                        setEditedNickname(userInfo.nickname);
                        setIsEditing(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="text-gray-500 body-small px-2.5 py-1.25 rounded-[100px] w-fit bg-gray-100">
              {userInfo.email}
            </div>
          </div>
        )}

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

      <div className="col-span-7 sm:col-span-9 flex flex-col items-center">
        {selectedTab === "learning" && <ProgressReport />}
        {selectedTab === "assessment" && (
          <AssessmentReport userName={userInfo.nickname} />
        )}
      </div>
    </div>
  );
};
export default MyStudyReportPage;
