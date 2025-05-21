import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ReactComponent as Cake } from "@/assets/icons/BackgroundCake.svg";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13, // 카드별로 0.13초씩 delay
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 70, damping: 15 } },
};

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
      label: "복습 노트",
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
      path: "/select-unit",
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
    <div className="min-h-screen w-full relative bg-gradient-to-b from-[#EBF2FE] to-[#FFFFFF] flex flex-col items-center">
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <Cake className="w-full h-full object-cover opacity-80" />
      </div>
      <div className="relative z-10 flex flex-col justify-center items-center w-full min-h-screen overflow-x-hidden">
        {/* 텍스트 영역 */}
        <div className="flex flex-col gap-1 my-8 px-6 z-10 text-center">
          <p className="headline-medium text-gray-500">
            AI 기반 사고력 중심 수학 학습
          </p>
          {/* <p className="display-small text-gray-700">AI 수학 코스웨어 souffle</p> */}
          <p className="logo-text">souffle</p>
          {/* <p className="body-medium text-gray-500">
            풀이 흐름 분석으로 개념 이해부터 복습 복습까지 맞춤형 자기주도 학습
            경로 제공
          </p> */}
        </div>

        {/* 카드 그리드 영역 */}
        {/* <div className="w-full px-6 z-10 mb-10"> */}
        <motion.div
          className="w-full px-6 z-10 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-12 gap-x-4 gap-y-4 max-w-screen-xl mx-auto">
            {cardItems.map((item, index) => (
              <motion.div
                key={index}
                className="col-span-12 sm:col-span-6 md:col-span-3"
                variants={cardVariants}
              >
                <Link
                  to={item.path}
                >
                  <div className="flex flex-col justify-between min-h-[500px] w-full p-7 bg-white/60 backdrop-blur-md rounded-[20px] hover:shadow-md transition-shadow duration-200">
                    {/* 상단 버튼 + 설명 */}
                    <div className="flex flex-col items-center gap-10">
                      <div
                        className="px-8 py-4 w-fit h-fit rounded-[32px] mb-10 text-white font-semibold"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.label}
                      </div>
                      <div className="flex flex-col items-center gap-2">
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
                    <div className="flex justify-end items-center gap-1 mt-8">
                      <p className="body-medium text-gray-700">바로가기</p>
                      <img
                        src="/icons/expand-right.png"
                        alt="오른쪽 화살표"
                        className="w-6 h-6"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default LandingPage;
