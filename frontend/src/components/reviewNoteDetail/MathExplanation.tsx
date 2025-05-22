import { InlineMath } from "react-katex";

interface MathExplanationProps {
  text: string;
  images?: { id: number; url: string }[];
}

type Part =
  | { type: "text"; value: string }
  | { type: "latex"; value: string }
  | { type: "subtitle"; value: string }
  | { type: "image" };

const TOKEN_REGEX = /(##(.*?)##)|\\\((.+?)\\\)|(\[IMAGE\])/g;

function renderWithLatex(text: string, keyPrefix = "") {
  const regex = /\\\((.+?)\\\)/g;
  const elements = [];
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (lastIndex < match.index) {
      elements.push(
        <span key={`${keyPrefix}-text-${idx}`}>{text.slice(lastIndex, match.index)}</span>
      );
      idx++;
    }
    elements.push(
      <InlineMath key={`${keyPrefix}-latex-${idx}`} math={match[1]} />
    );
    lastIndex = match.index + match[0].length;
    idx++;
  }
  if (lastIndex < text.length) {
    elements.push(
      <span key={`${keyPrefix}-text-${idx}`}>{text.slice(lastIndex)}</span>
    );
  }
  return elements;
}

const MathExplanation = ({ text, images = [] }: MathExplanationProps) => {
  const parts: Part[] = [];
  let lastIndex = 0;
  let imageIndex = 0;

  text.replace(TOKEN_REGEX, (match, subtitleFull, subtitle, latex, imageToken, offset) => {
    if (lastIndex < offset) {
      parts.push({ type: "text", value: text.slice(lastIndex, offset) });
    }
    if (subtitleFull) {
      parts.push({ type: "subtitle", value: subtitle });
    } else if (latex) {
      parts.push({ type: "latex", value: latex });
    } else if (imageToken) {
      parts.push({ type: "image" });
    }
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <div className="body-medium text-gray-700">
      {parts.map((part, index) => {
        if (part.type === "text") {
          return part.value
            .split(/\\n|\n/g)
            .map((line, idx, arr) => (
              <span key={`${index}-${idx}`}>
                {line}
                {idx !== arr.length - 1 && <br />}
              </span>
            ));
        }
        if (part.type === "latex") {
          return <InlineMath key={index} math={part.value} />;
        }
        if (part.type === "subtitle") {
          return (
            <div
              key={index}
              className="headline-small text-gray-800"
            >
              {renderWithLatex(part.value, `subtitle-${index}`)}
            </div>
          );
        }
        if (part.type === "image") {
          // images 배열의 순서대로 출력
          const img = images[imageIndex++];
          if (!img) return null;
          return (
            <img
              key={index}
              src={img.url}
              alt={`개념 이미지 ${img.id}`}
              className="inline-block rounded-xl border border-gray-200 max-w-[400px] w-full h-auto align-middle mx-2 my-3"
              style={{ verticalAlign: "middle" }}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default MathExplanation;