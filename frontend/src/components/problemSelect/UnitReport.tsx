import { Button } from "@/components/common/Button";
import { useNavigate } from "react-router-dom";

const UnitReport = ({ selectedUnitId }: { selectedUnitId: number }) => {
  console.log("selectedUnitId", selectedUnitId);
  const navigate = useNavigate();

  const handleGoToStudyPage = () => {
    console.log("selectedUnitId", selectedUnitId);
    if (!selectedUnitId) return;

    navigate(`/problem-study/${selectedUnitId}`);
  };
  return (
    <div className="flex flex-col items-center gap-2 bg-primary-100 py-13 rounded-[10px] mt-4">
      <p className="body-medium text-gray-700">
        해당 단원에 대한 개념학습과 나의 수준을 진단받을 수 있어요!
      </p>
      <img src="/icons/select-icon.png" alt="" className="w-33 h-33" />
      <div className="flex gap-14">
        <Button
          variant="outline"
          size="md"
          onClick={() => {
            handleGoToStudyPage();
          }}
        >
          개념 학습 하기
        </Button>

        {/* <Button variant="solid" size="md">
          진단 받기
        </Button> */}
      </div>
    </div>
  );
};

export default UnitReport;
