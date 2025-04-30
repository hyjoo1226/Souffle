// GPT 분석
import { Link } from 'react-router-dom';
import { ReactComponent as Expand } from '@/assets/icons/Expand.svg';

const Analysis = () => {
    return (
        <div className="flex flex-col justify-between px-[20px] pt-[20px] h-[419px]">
            <div className="max-h-[356px] overflow-y-auto scrollbar-none">
                <div className="text-gray-700 mb-10">
                    <p className="headline-small mb-[20px]">문제 풀이 분석</p>
                    <p className="body-medium">처음엔 (x+1)(x−6)(x+1)(x-6)(x+1)(x−6) 시도하셨다가 틀린 걸 스스로 확인하고 지우셨고, 다음에 제대로 (x−2)(x−3)=0(x-2)(x-3) = 0(x−2)(x−3)=0 으로 인수분해하시고, x=2, 3x = 2, 3x=2,3 이라는 정답까지 정확히 도출하셨습니다.</p>
                </div>
                <div className="text-gray-700">
                    <p className="headline-small mb-[20px]">취약점 분석</p>
                    <p className="body-medium">2차 함수 인수 분해에 취약점을 보입니다. 이 부분에서 학년 평균보다 1분 12초간 더 머물렀습니다.</p>
                </div>
            </div>
            <div className="w-full pt-[21px] place-items-end">
                <Link to="#" className="flex text-gray-700">
                    <p className="headline-small">해설 보기</p>
                    <Expand className='transform -scale-x-100' />
                </Link>
            </div>
        </div>
    );
  };
  
  export default Analysis;