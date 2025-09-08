import React from "react";
import ImageTextButton from "../../script/common/ImageTextButton";
import { getTextShadowStyle } from "../common/Utility";
import image from "../../image/Buttons/MarketTabButton/market_tab_click.png";
import hoverImage from "../../image/Buttons/MarketTabButton/market_tab_hv.png";
import clickImage from "../../image/Buttons/MarketTabButton/market_tab.png";
import disabledImage from "../../image/Buttons/MarketTabButton/market_tab.png";

interface Props {
  id: number;
  text: string;
  isDisabled: boolean;
  onClick: () => void;
  fontSizeRatio?: number;
}

const MarketTabButton = ({
  id,
  text,
  isDisabled,
  onClick,
  fontSizeRatio = 0.8,
}: Props) => {
  const fontFamily = "mishmash";
  const isBold = true;
  const color = "white";

  const getText = (fontBaseSize: number) => {
    const fontSize = fontBaseSize * fontSizeRatio;
    return (
      <p
        className="adjustable-image-text-button-text"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "90%",
          height: "auto",
          transform: "translate(-50%, -50%)",
          margin: "0px",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
          color: color,
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
          whiteSpace: "pre",
          ...(isBold ? { fontWeight: "bold" } : {}),
          ...getTextShadowStyle(fontSize / 15),
        }}
      >
        {text}
      </p>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "auto",
        height: "100%",
        aspectRatio: "132 / 45",
        transform: "translate(-50%, -50%)",
        margin: "0px",
      }}
    >
      <ImageTextButton
        id={id}
        onClick={onClick}
        isDisabled={isDisabled}
        normalImage={image}
        hoverImage={hoverImage}
        clickImage={clickImage}
        disabledImage={disabledImage}
        getText={getText}
      />
    </div>
  );
};

export default MarketTabButton;
