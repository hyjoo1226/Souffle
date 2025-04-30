import SolutionAnalysisHeader from '@/components/solutionAnalysis/SolutionAnalysisHeader';
import Analysis from '@/components/solutionAnalysis/Analysis';
import UserSolution from '@/components/solutionAnalysis/UserSolution';
import TimeAnalysis from '@/components/solutionAnalysis/TimeAnalysis';
import GraphAnalysis from '@/components/solutionAnalysis/GraphAnalysis';

const SolutionAnalysisPage = () => {
  return (
    <div>
        <SolutionAnalysisHeader />
        <div 
          className="rounded-[12px] px-10 py-10 grid grid-cols-2 gap-x-4"
          style={{
            background: 'linear-gradient(to bottom, #EBF2FE 37%, #FFFFFF 100%)',
          }}
        >
            <UserSolution />
            <Analysis />
        </div>
        <div className='grid grid-cols-12 gap-x-4'>
          <div className="col-span-6 p-10">
            <TimeAnalysis />
          </div>
          <div className="col-span-6 p-10">
            <GraphAnalysis />
          </div>
        </div>
    </div>
  );
};

export default SolutionAnalysisPage;
