import React, { useEffect, useRef, useState } from "react";
import "./ProgramResourceDisplay.css";

interface Props {
  iconImagePath: string;
  amount: number;
  originalAmount?: number;
}

const ProgramResourceDisplay = ({
  iconImagePath,
  amount,
  originalAmount,
}: Props) => {
  const getSign = (number: number) => (number > 0 ? "+" : "");
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState<number>(0);

  const adjustSize = () => {
    if (containerRef.current) {
      setFontSize(containerRef.current.offsetHeight / 2);
    }
  };

  useEffect(() => {
    adjustSize();

    window.addEventListener("resize", adjustSize);
    return () => {
      window.removeEventListener("resize", adjustSize);
    };
  }, [containerRef.current, containerRef.current?.offsetHeight]);

  const showBothAmounts =
    originalAmount !== undefined && originalAmount !== amount;

  return (
    <div className="program-resource-display-container" ref={containerRef}>
      <img src={iconImagePath} className="program-resource-display-image" />
      <p
        className={
          amount == 0
            ? "program-resource-display-zero-text"
            : amount > 0
            ? "program-resource-display-positive-text"
            : "program-resource-display-negative-text"
        }
        style={{ fontSize }}
      >
        {showBothAmounts
          ? `${getSign(originalAmount!)}${originalAmount}→${getSign(
              amount
            )}${amount}`
          : `${getSign(amount)}${amount.toString()}`}
      </p>
    </div>
  );
};

export default ProgramResourceDisplay;
