// 오답노트 상세 페이지 문제 설명 영역

const Problem = () => {
  return (
    <div className="py-[clamp(16px,2.33vh,28px)]">
        <p className="text-green-500 caption-medium">
            {"공통 수학1 > 다항식 > 다항식의 연산 > 1번 문제"}
        </p>
        <p className="text-gray-700">
            최고차항의 계수가 1이고 f(0)=1인 삼차함수 f(x)와 양의 실수 p에 대하여 함수 g(x)가 다음 조건을 만족시킨다. f(5)의 값을 구하시오.
            {/* 폰트 조정 필요 */}
        </p>
        <div className="flex justify-center items-center w-full">
            <img 
                src="/icons/test-question.png" 
                alt="문제 이미지" 
                className="max-w-[42vw] h-auto"
            />
            {/* 이미지 사이즈 조정에 관한 논의가 필요할 듯 */}
        </div>
    </div>
  );
};

export default Problem;