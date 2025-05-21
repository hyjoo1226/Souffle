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
            <section className="grid grid-cols-3 grid-rows-2 gap-x-12.5 gap-y-7.5 h-[65vh]">
              {currentUnits.map((unit, index) => {
                const numberLabel = (index + 1).toString().padStart(2, "0");
                const background = gradients[index % gradients.length];

                // 소단원 2개까지 추출
                const description = unit.children?.slice(0, 3).map((sub) => sub.name) ?? [];

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
