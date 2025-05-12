import { useState } from "react"
import { ReactComponent as ExpandSlim } from "@/assets/icons/ExpandSlim.svg"
import { Button } from "@/components/common/Button"

const ConceptStudyPage = () => {
    const [selected, setSelected] = useState('함수의 정의');
    const tabs = ['함수의 정의', '함수의 그래프', '함수의 종류', '합성함수', '역함수'];

    return (
        <div className="flex flex-col bg-white w-full h-screen">
            <div className='flex items-center justify-between py-5'>
                <div className='flex items-center'>
                    <ExpandSlim className='text-gray-700' />
                    <p className='body-medium text-gray-700'>단원 선택</p>
                </div>
                <Button>예제 풀기</Button>
            </div>
            <div className="flex-grow mb-5 grid grid-cols-12 gap-x-4 overflow-y-auto">
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
                        <p className="headline-large text-gray-600">함수</p>
                    </div>
                </nav>

                <div className="col-start-3 col-span-10 border-1 border-gray-500 p-7 bg-white z-10 h-full">
                    <div className="flex flex-col gap-y-2">
                        <p className="headline-large text-gray-700">{selected}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConceptStudyPage;