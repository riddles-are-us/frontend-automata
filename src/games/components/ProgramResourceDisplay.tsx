import React from "react";
import "./ProgramResourceDisplay.css";

interface Props {
  iconImagePath: string;
  amount: number;
  originalAmount?: number; // 原始资源数量（可选）
}

const ProgramResourceDisplay = ({ iconImagePath, amount, originalAmount }: Props) => {
  const getSign = (number: number) => (number > 0 ? "+" : "");

  // 如果提供了原始数量且与调整后数量不同，则显示两个数量
  const showBothAmounts = originalAmount !== undefined && originalAmount !== amount;

  return (
    <div className="program-resource-display-container">
      <img src={iconImagePath} className="program-resource-display-image" />
      <p
        className={
          amount == 0
            ? "program-resource-display-zero-text"
            : amount > 0
            ? "program-resource-display-positive-text"
            : "program-resource-display-negative-text"
        }
      >
        {showBothAmounts
          ? `${getSign(originalAmount!)}${originalAmount} > ${getSign(amount)}${amount}`
          : `${getSign(amount)}${amount.toString()}`
        }
      </p>
    </div>
  );
};

export default ProgramResourceDisplay;
