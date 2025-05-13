import { useNavigate } from "react-router-dom";
import { useState } from 'react';

import { ReactComponent as ExpandSlim } from "@/assets/icons/ExpandSlim.svg"
import { Button } from "@/components/common/Button"
import SideBar from "@/components/problemStudy/SideBar"
import ProblemContent from "@/components/problemStudy/ProblemContent";

const ProblemStudyPage = () => {
    const navigate = useNavigate();

    const problemList = [
        {
            id: 1,
            title: "함수의 정의",
            sentence: ["함수는 ", " 와 ", " 사이의 관계를 나타낸다."],
            blanks: ["정의역", "공역"],
            choices: ["정의역", "공역", "치역", "연역"],
        },
        {
            id: 2,
            title: "함수의 그래프",
            sentence: ["함수의 그래프는 ", "축과 ", "축에 대한 정보를 제공한다."],
            blanks: ["x", "y"],
            choices: ["x", "y", "z", "원점"],
        },
    ];

    // 상태 초기화
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[][]>(
        problemList.map(p => Array(p.blanks.length).fill("")) // ["", ""] 식으로 초기화
    );
    const [showWrongMark, setShowWrongMark] = useState(false);
    const currentProblem = problemList[currentProblemIndex];
    const [isChecked, setIsChecked] = useState<boolean[]>(
        problemList.map(() => false)
    );

    // 보기 클릭 핸들러 함수
    const handleChoiceClick = (blankIndex: number, choice: string) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentProblemIndex][blankIndex] = choice;
        setUserAnswers(updatedAnswers);
    };

    // 취소 핸들러 함수 추가
    const handleCancelAnswer = (blankIndex: number) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentProblemIndex][blankIndex] = "";
        setUserAnswers(updatedAnswers);
    };

    // 버튼 핸들러 함수
    const handleCheckAnswer = () => {
        const isAllCorrect = currentProblem.blanks.every(
            (blank, idx) => userAnswers[currentProblemIndex][idx] === blank
        );

        if (isAllCorrect) {
            const updatedChecked = [...isChecked];
            updatedChecked[currentProblemIndex] = true;
            setIsChecked(updatedChecked);

            if (currentProblemIndex < problemList.length - 1) {
                setCurrentProblemIndex(currentProblemIndex + 1);
            } else {
                navigate("/study");
            }
                setShowWrongMark(false);
            } else {
                setShowWrongMark(true);
            }
        };

    const problemStatuses = problemList.map((problem, index) => ({
        title: problem.title,
        isDone: isChecked[index],
        current: index === currentProblemIndex,
    }));

    return (
        <div className="flex flex-col bg-white w-full h-screen">
            <div className='flex items-center justify-between py-5'>
                <div className='flex items-center'>
                    <ExpandSlim className='text-gray-700' />
                    <p className='body-medium text-gray-700' onClick={() => navigate("/select-unit")}>단원 선택</p>
                </div>
                <Button onClick={() => navigate("/study")}>개념 학습</Button>
            </div>
            <div className="flex-grow mb-5 grid grid-cols-12 gap-x-4">
                <SideBar
                    problems={problemStatuses} 
                    onCheckAnswer={handleCheckAnswer} 
                />
                <ProblemContent
                    problem={currentProblem}
                    userAnswer={userAnswers[currentProblemIndex]}
                    onChoiceClick={handleChoiceClick}
                    onCancelAnswer={handleCancelAnswer}
                    showWrongMark={showWrongMark}
                />
            </div>
        </div>
    );
};

export default ProblemStudyPage;