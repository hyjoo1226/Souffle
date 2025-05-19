import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTotalUnitApi } from "@/services/api/SelectUnit";
import { Category } from "@/types/SelectUnit";

import UnitCard from "@/components/selectUnit/UnitCard";

const gradients = [
    "linear-gradient(135deg, #1E3C72 0%, #4FACFE 100%)",
    "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
    "linear-gradient(135deg, #F857A6 0%, #FF5858 100%)",
    "linear-gradient(135deg, #11998E 0%, #38EF7D 100%)",
    "linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
    "linear-gradient(135deg, #2A5298 0%, #00F2FE 100%)",
];

// const units: Record<string, {
//   id: number;
//   title: string;
//   description: string[];
// }[]> = {
//   "공통 수학1": [
//     {
//       id: 1,
//       title: "집합과 명제",
//       description: ["집합의 개념, 명제의 증명", "조건과 진리집합"],
//     },
//     {
//       id: 2,
//       title: "함수",
//       description: ["함수의 개념과 그래프", "합성함수와 역함수"],
//     },
//     {
//       id: 3,
//       title: "경우의 수",
//       description: ["순열과 조합", "이항정리와 파스칼 삼각형"],
//     },
//     {
//       id: 4,
//       title: "확률",
//       description: ["확률의 기본 개념", "조건부 확률과 독립사건"],
//     },
//     {
//       id: 5,
//       title: "도형의 방정식",
//       description: ["평면좌표와 직선의 방정식", "원과 타원, 쌍곡선, 포물선"],
//     },
//     {
//       id: 6,
//       title: "수열",
//       description: ["등차수열과 등비수열", "수열의 합과 일반항"],
//     },
//   ],
//   "공통 수학2": [
//     {
//       id: 1,
//       title: "지수와 로그",
//       description: ["지수법칙과 로그의 성질", "지수/로그 함수 그래프"],
//     },
//     {
//       id: 2,
//       title: "삼각함수",
//       description: ["사인/코사인/탄젠트", "삼각함수의 그래프"],
//     },
//     {
//       id: 3,
//       title: "수열의 극한",
//       description: ["무한수열, 수렴/발산 개념", "극한값의 계산"],
//     },
//     {
//       id: 4,
//       title: "미분",
//       description: ["변화율과 미분계수", "도함수의 활용"],
//     },
//     {
//       id: 5,
//       title: "적분",
//       description: ["부정적분/정적분", "넓이와 평균값 정리"],
//     },
//   ],
// };

const SelectUnitPage = () => {
    const [tabs, setTabs] = useState<string[]>([]);
    const [selected, setSelected] = useState<string>('');

    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
      const getData = async () => {
        try {
          const data = await getTotalUnitApi();
          setCategories(data);

          const tabNames = data.map((cat) => cat.name);
          setTabs(tabNames);
          if (tabNames.length > 0) {
            setSelected(tabNames[0]); // 첫 번째 탭을 기본 선택
          }
        } catch (error) {
          console.error("단원 조회 실패: ", error);
        }
      };

      getData();
    }, []);

    useEffect(() => {
      if (categories) {
        console.log('받아온 단원 데이터: ', categories)
      }
    }, [categories])

    const currentUnits = categories.find((cat) => cat.name === selected)?.children ?? [];

    return (
        <div className="bg-white w-full max-h-screen px-12.5">
            <div className='w-full flex justify-between mt-23.5 mb-12.5 items-end'>
              <div className="flex flex-col gap-y-2">
                  <p className="display-medium text-gray-700">수학 개념 학습</p>
                  <p className="body-medium text-gray-300">원하는 단원을 선택하세요.</p>
              </div>
              {tabs.length > 0 && (
                <div className="flex gap-x-3.5">
                  {tabs.map((tab) => (
                    <p 
                      key={tab}
                      onClick={() => setSelected(tab)}
                      className={`headline-medium cursor-pointer ${
                        selected === tab
                          ? 'text-primary-800'
                          : 'text-gray-300'
                      }`}
                    >
                      {tab}
                    </p>
                  ))}
                </div>
              )}
            </div>
            {/* <section className='grid grid-cols-3 grid-rows-2 gap-x-12.5 gap-y-7.5 h-[65vh]'>
                {units[selected].map((unit, index) => {
                    const numberLabel = (index + 1).toString().padStart(2, "0");
                    const background = gradients[index % gradients.length];
                    return (
                    <UnitCard
                        key={unit.id}
                        {...unit}
                        numberLabel={numberLabel}
                        background={background}
                        onClick={() => navigate("/study")}
                    />
                    );
                })}
            </section> */}
            <section className="grid grid-cols-3 grid-rows-2 gap-x-12.5 gap-y-7.5 h-[65vh]">
              {currentUnits.map((unit, index) => {
                const numberLabel = (index + 1).toString().padStart(2, "0");
                const background = gradients[index % gradients.length];

                // 소단원 2개까지 추출
                const description = unit.children?.slice(0, 2).map((sub) => sub.name) ?? [];

                return (
                  <UnitCard
                    key={unit.id}
                    title={unit.name}
                    description={description}
                    numberLabel={numberLabel}
                    background={background}
                    onClick={() => navigate(`/study/${unit.id}`)}
                  />
                );
              })}
            </section>
        </div>
    );
};

export default SelectUnitPage;
