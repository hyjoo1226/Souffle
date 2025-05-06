// Eraser.tsx

const Eraser = ({
  onClose,
  onExecute,
  setEraseOption,
  eraseOption,
}: {
  onClose: () => void;
  onExecute: (option: any) => void;
  eraseOption: "all" | "last" | null;
  setEraseOption: (value: "all" | "last" | null) => void;
}) => {
  return (
    <div className="absolute top-9 right-0 z-50">
      <div className="flex flex-col gap-5 bg-white rounded-lg shadow-lg p-6 w-64 ">
        <div className="flex justify-between items-center">
          <p className="headline-small">지우개</p>
          <img
            src="/icons/close.png"
            alt="연필"
            className="w-7 h-7 cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col gap-6 body-medium">
          <label className="flex items-center">
            <input
              type="radio"
              name="eraseOption"
              value="last"
              checked={eraseOption === null}
              onChange={() => {
                setEraseOption("last");
                onExecute("last");
                onClose();
              }}
            />
            <span className="ml-2">이전 획 지우기</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="eraseOption"
              value="all"
              checked={eraseOption === "all"}
              onChange={() => {
                setEraseOption("all");
                onExecute("all");
                onClose();
              }}
            />
            <span className="ml-2">전체 지우기</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Eraser;
