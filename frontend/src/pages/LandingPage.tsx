import { Link } from "react-router-dom";

const LandingPage = () => {
  const cardItems = [
    {
      label: "문제 풀이",
      color: "#F88DAD",
      path: "/problem-select",
      lines: [
        "직접 손으로 풀며 개념을 이해하는",
        "사고 과정 기반",
        <>
          {" "}
          <span className="headline-medium">풀이 흐름 진단</span> 제공
        </>,
      ],
    },
    {
      label: "오답 노트",
      color: "#8390FA",
      path: "/review-list",
      lines: [
        "풀이 기록과 함께",
        <>
          {" "}
          <span className="headline-medium">나만의 노트</span>로
        </>,
        <>
          {" "}
          <span className="headline-medium">취약 개념 정리</span> 지원
        </>,
        ,
      ],
    },
    {
      label: "개념 학습",
      color: "#FAC748",
      path: "/concept",
      lines: [
        <>
          {" "}
          <span className="headline-medium">개념 확인 → 빈칸 채우기</span>
        </>,
        "스스로 채워보며",
        <>
          {" "}
          <span className="headline-medium"> 이해를 깊이 있게</span> 정리
        </>,
      ],
    },
    {
      label: "내 학습 현황",
      color: "#57B563",
      path: "/my-report",
      lines: [
        "문제 풀이 기록을 바탕으로",
        <>
          {" "}
          <span className="headline-medium">개념별 성취도</span>와
        </>,
        <>
          {" "}
          <span className="headline-medium"> 성장 그래프 시각화</span>
        </>,
        <>
          {" "}
          <span className="headline-medium"> AI 맞춤형 학습 방향 제공</span>
        </>,
      ],
    },
  ];

  return (
    <div className="h-screen overflow-hidden w-full py-5 relative bg-gradient-to-b from-[#EBF2FE] to-[#FFFFFF]">
      <img
        src="/icons/landing-back.png"
        alt="배경 이미지"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-80 pointer-events-none"
      />
      <div className="flex flex-col gap-4 mb-20 px-6">
        <p className="headline-medium text-gray-500">
          AI 기반 사고력 중심 수학 학습
        </p>
        <p className="display-small text-gray-700">AI 수학 코스웨어 souffle</p>
        <p className="body-medium text-gray-500">
          풀이 흐름 분석으로 개념 이해부터 오답 복습까지 맞춤형 자기주도 학습
          경로 제공
        </p>
      </div>

      {/* 메뉴선택 */}
      <div className="grid grid-cols-12 gap-x-4 h-full px-10 ">
        {cardItems.map((item, index) => (
          <Link to={item.path} key={index} className="col-span-3">
            <div className="flex flex-col gap-15 w-full h-[50%] p-7 bg-white opacity-80 rounded-[20px] hover:shadow-md transition-shadow duration-200">
              {/* 버튼 */}
              <div className="flex flex-col items-center gap-15">
                <div
                  className="px-8 py-4 w-fit h-fit rounded-[32px] text-white font-semibold"
                  style={{ backgroundColor: item.color }}
                >
                  {item.label}
                </div>

                {/* 설명 */}
                <div className="flex flex-col items-center gap-3">
                  {item.lines.map((line, i) => (
                    <p
                      key={i}
                      className="text-gray-700 body-medium text-center"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* 바로가기 */}
              <div className="flex mt-auto justify-end items-center gap-1">
                <p className="body-medium text-gray-700">바로가기</p>
                <img
                  src="/icons/expand-right.png"
                  alt="오른쪽 화살표"
                  className="w-6 h-6"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default LandingPage;
