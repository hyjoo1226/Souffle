import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';

import { ReactComponent as ExpandSlim } from "@/assets/icons/ExpandSlim.svg"
import { Button } from "@/components/common/Button"
import SideBar from "@/components/problemStudy/SideBar"
import ProblemContent from "@/components/problemStudy/ProblemContent";

import { getProblemStudyApi, getCategoryAncestorsApi } from "@/services/api/SelectUnit";
import { TotalQuiz, ConceptQuiz, Quiz, Problem } from "@/types/SelectUnit";

const ProblemStudyPage = () => {
    const navigate = useNavigate();
    const { category_id } = useParams<{ category_id: string }>();
    const [middleCategoryName, setMiddleCategoryName] = useState<string>('');
    const [showResultMark, setShowResultMark] = useState<'none' | 'correct' | 'wrong'>('none');
    const [problemList, setProblemList] = useState<Problem[]>([]);

    useEffect(() => {
        if (!category_id) return;

        const fetchQuiz = async () => {
            try {
                const data: TotalQuiz = await getProblemStudyApi(Number(category_id));
                const transformed: Problem[] = data.concepts.flatMap((concept: ConceptQuiz) => {
                    return concept.quizzes.flatMap((quiz: Quiz) => {
                        return [{
                        id: quiz.quiz_id,
                        title: concept.title,
                        sentence: quiz.content?.split(/\[BLANK_\d+\]/g) ?? [quiz.content],
                        blanks: Array(quiz.blanks.length).fill(""),
                        choices: quiz.blanks.map((b) => b.choice), // flatten to string[]
                        correctAnswers: quiz.blanks.map((b) => b.choice[b.answer_index]),
                        }];
                    });
                });


                setProblemList(transformed);

                const ancestorsData = await getCategoryAncestorsApi(Number(category_id));
                setMiddleCategoryName(ancestorsData.current.name)

                console.log("퀴즈 원본:", data);
                console.log("중단원:", ancestorsData.current.name)
            } catch (err) {
                console.error("퀴즈 불러오기 실패:", err);
            }
        };

        fetchQuiz();
    }, [category_id]);

    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[][]>([]);
    // const [showWrongMark, setShowWrongMark] = useState(false);
    const [isChecked, setIsChecked] = useState<boolean[]>([]);

    useEffect(() => {
        setUserAnswers(problemList.map(p => Array(p.blanks.length).fill("")));
        setIsChecked(problemList.map(() => false));
    }, [problemList]);

    const currentProblem = problemList[currentProblemIndex];

    const handleChoiceClick = (blankIndex: number, choice: string) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentProblemIndex][blankIndex] = choice;
        setUserAnswers(updatedAnswers);
    };

    const handleCancelAnswer = (blankIndex: number) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentProblemIndex][blankIndex] = "";
        setUserAnswers(updatedAnswers);
    };

    // const handleCheckAnswer = () => {
    //     const isAllCorrect = currentProblem.correctAnswers.every(
    //         (answer: string, idx: number) => userAnswers[currentProblemIndex][idx] === answer
    //     );

    //     if (isAllCorrect) {
    //         const updatedChecked = [...isChecked];
    //         updatedChecked[currentProblemIndex] = true;
    //         setIsChecked(updatedChecked);

    //         if (currentProblemIndex < problemList.length - 1) {
    //             setCurrentProblemIndex(currentProblemIndex + 1);
    //         } else {
    //             navigate(`/study/${category_id}`);
    //         }
    //         setShowWrongMark(false);
    //     } else {
    //         setShowWrongMark(true);
    //     }
    // };

    const problemStatuses = problemList.map((problem, index) => ({
        title: problem.title,
        isDone: isChecked[index],
        current: index === currentProblemIndex,
    }));

    const isAnswered = isChecked[currentProblemIndex];
    const isCorrect = showResultMark === 'correct';

    const getButtonLabel = () => {
        if (!isAnswered || showResultMark === 'wrong') return '정답 확인';
        return '다음 문제';
    };

    // 버튼 클릭 함수 분기
    const handleCheckOrNext = () => {
        if (!isAnswered) {
            // 채점 시도
            const isAllCorrect = currentProblem.correctAnswers.every(
                (answer, idx) => userAnswers[currentProblemIndex][idx] === answer
            );
            const updatedChecked = [...isChecked];
            updatedChecked[currentProblemIndex] = true;
            setIsChecked(updatedChecked);

            if (isAllCorrect) {
                setShowResultMark('correct');
            } else {
                setShowResultMark('wrong');
            }
        } else if (isCorrect) {
            // 다음 문제로 이동
            setShowResultMark('none');
            if (currentProblemIndex < problemList.length - 1) {
                setCurrentProblemIndex(currentProblemIndex + 1);
            } else {
                navigate(`/study/${category_id}`);
            }
        } else {
            // 오답인 경우엔 그림만 계속 보여주고, '다음 문제' 없음
            setShowResultMark('none');
        }
    };

    return (
        <div className="flex flex-col bg-white w-full h-screen">
            <div className='flex items-center justify-between py-5'>
            <div className='flex items-center'>
                <ExpandSlim className='text-gray-700' />
                <p className='body-medium text-gray-700' onClick={() => navigate("/select-unit")}>단원 선택</p>
            </div>
            <Button onClick={() => navigate(`/study/${category_id}`)}>개념 학습</Button>
            </div>

            <div className="flex-grow mb-5 grid grid-cols-12 gap-x-4">
            {problemList.length > 0 && currentProblem ? (
                <>
                <SideBar
                    problems={problemStatuses}
                    onCheckAnswer={handleCheckOrNext}
                    title={middleCategoryName}
                    buttonLabel={getButtonLabel()}
                />
                <ProblemContent
                    problem={currentProblem}
                    userAnswer={userAnswers[currentProblemIndex]}
                    onChoiceClick={handleChoiceClick}
                    onCancelAnswer={handleCancelAnswer}
                    showResultMark={showResultMark}
                />
                </>
            ) : (
                <div className="col-span-12 flex justify-center items-center">
                <p className="text-gray-500">문제를 불러오는 중입니다...</p>
                </div>
            )}
            </div>
        </div>
    );
};

export default ProblemStudyPage;