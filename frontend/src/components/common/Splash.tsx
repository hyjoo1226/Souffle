import Lottie from 'react-lottie-player'
import loadingJson from '@/assets/icons/loadingJson.json'

const Splash = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-primary-100/20">
    {/* <img src="/icons/souffle-man.png" className="w-28 h-28" alt="로딩" />
    <div className="bg-white border border-primary-800 rounded-xl px-10 py-20">
        <p className="text-gray-700 display-large">souffle</p>
        <span className="text-gray-500 headline-xlarge">교육은 누구에게나 평등해야 하니까</span>
    </div> */}
    {/* <DotLottieReact src='/icons/loading.lottie' loop autoplay /> */}
    <Lottie loop play animationData={loadingJson} style={{ width: 180, height: 180 }} />
    <p className='body-medium text-gray-500'>수업 준비중...</p>
  </div>
);

export default Splash;
