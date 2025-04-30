// 사용자가 쓴 수식
import Toggle from "@/components/common/Toggle";

const UserSolution = () => {
  return (
    <div className="bg-white relative h-[419px] rounded-[20px] figma-shadow">
        <div className="absolute top-[20px] right-[20px]">
            <Toggle />
        </div>
    </div>
  );
};

export default UserSolution;