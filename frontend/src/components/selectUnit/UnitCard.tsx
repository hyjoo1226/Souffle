interface UnitCardProps {
  title: string;
  description: string[];
  numberLabel: string;
  background: string;
  onClick?: () => void;
}

const UnitCard = ( { title, description, numberLabel, background, onClick }: UnitCardProps ) => {
  return (
    <div 
      className={`relative text-white rounded-2xl p-9.5 grid grid-rows-2 shadow-medium cursor-pointer hover:shadow-large transition-shadow`}
      style={{
        backgroundImage: background 
      }}
      onClick={onClick}
    >
      <div className="flex flex-col gap-y-1 pb-6 border-b-1 border-white/30">
        <p className="headline-medium">{numberLabel}</p>
        <p className="headline-medium">{title}</p>
      </div>
      <div className='pt-6'>
        {description.slice(0, 3).map((line, idx) => (
            <p key={idx} className="body-small text-white/90">
                {line}
            </p>
        ))}
      </div>
      <div className="absolute bottom-7.5 right-5 z-50 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <div className="relative w-4 h-4">
          <span className="absolute inset-0 w-0.5 h-full bg-white left-1/2 -translate-x-1/2"></span> {/* 세로선 */}
          <span className="absolute inset-0 h-0.5 w-full bg-white top-1/2 -translate-y-1/2"></span> {/* 가로선 */}
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
