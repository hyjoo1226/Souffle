import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ReactComponent as ExpandSlim } from "@/assets/icons/ExpandSlim.svg";
import { Button } from "@/components/common/Button";
import MathExplanation from '@/components/reviewNoteDetail/MathExplanation';

import { getUnitDetailApi } from "@/services/api/SelectUnit";
import { getCategoryAncestorsApi } from "@/services/api/SelectUnit";
import { UnitDetail } from "@/types/SelectUnit";

const ConceptStudyPage = () => {
    const [selected, setSelected] = useState('');
    const [unitDetail, setUnitDetail] = useState<UnitDetail | null>(null);
    const [middleCategoryName, setMiddleCategoryName] = useState<string>('');
    const { category_id } = useParams<{ category_id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!category_id) return;

        const fetchData = async () => {
            try {
                const data = await getUnitDetailApi(Number(category_id));
                setUnitDetail(data);

                const firstConcept = data.concepts?.[0]?.title;
                if (firstConcept) setSelected(firstConcept);

                const ancestorsData = await getCategoryAncestorsApi(Number(category_id));
                setMiddleCategoryName(ancestorsData.current.name)

                console.log("단원 상세 정보:", data);
            } catch (err) {
                console.error("단원 상세 조회 실패:", err);
            }
        };

        fetchData();
    }, [category_id]);

    const tabs = unitDetail?.concepts.map((concept) => concept.title) ?? [];
    const selectedConcept = unitDetail?.concepts.find(c => c.title === selected);

    return (
        <div className="flex flex-col bg-white w-full h-screen">
            <div className='flex items-center justify-between py-5'>
                <div className='flex items-center'>
                    <ExpandSlim className='text-gray-700' />
                    <p className='body-medium text-gray-700' onClick={() => navigate('/select-unit')}>단원 선택</p>
                </div>
                <Button onClick={() => navigate(`/problem-study/${category_id}`)}>예제 풀기</Button>
            </div>
            <div className="mb-5 grid grid-cols-12 gap-x-4 grow min-h-0">
                <nav className="py-7 justify-between col-start-1 col-span-2 -mr-30 z-0 h-full flex flex-col">
                    <div className="flex flex-col gap-y-1.5">
                        {tabs.map((tab, idx) => (
                            <p 
                                key={tab}
                                onClick={() => setSelected(tab)}
                                className={`body-medium cursor-pointer py-5 px-3.5 rounded-[8px] ${
                                    selected === tab
                                    ? 'text-white bg-primary-600'
                                    : 'text-gray-500 border border-gray-200 ml-7'
                                }`}
                            >
                                {idx+1}. {tab}
                            </p>
                        ))}
                    </div>
                    <div className="w-[15vw] flex justify-center">
                        <p className="headline-large text-gray-600">{middleCategoryName}</p>
                    </div>
                </nav>

                <div className="col-start-3 col-span-10 border-1 border-gray-500 p-7 bg-white z-10 h-full overflow-y-auto">
                    <p className="headline-large text-gray-700">{selected}</p>
                    <p className="body-medium text-gray-600 whitespace-pre-line">
                        <MathExplanation 
                            text={selectedConcept?.description || '설명이 없습니다.'} 
                            images={selectedConcept?.images ?? []}
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConceptStudyPage;