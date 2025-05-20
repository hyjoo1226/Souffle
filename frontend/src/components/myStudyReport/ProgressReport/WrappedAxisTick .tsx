const WrappedAxisTick = ({ x, y, payload, width }: any) => {
  return (
    <foreignObject x={x - width / 2} y={y + 8} width={width} height={40}>
      <div
        style={{
          width: "100%",
          fontSize: 12,
          lineHeight: "1.2",
          textAlign: "center",
          whiteSpace: "normal",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2, // 두 줄로 제한
          WebkitBoxOrient: "vertical",
          color: "#1b1d1b",
        }}
      >
        {payload.value}
      </div>
    </foreignObject>
  );
};

export default WrappedAxisTick;
