import React from "react";
import ImageTextButton from "../../script/common/ImageTextButton";
import { getTextShadowStyle } from "../common/Utility";
import image from "../../image/Buttons/WelcomePlayButton/welcome_play.png";
import hoverImage from "../../image/Buttons/WelcomePlayButton/welcome_play_hv.png";
import clickImage from "../../image/Buttons/WelcomePlayButton/welcome_play_click.png";
import disabledImage from "../../image/Buttons/WelcomePlayButton/welcome_play_idle.png";

interface Props {
  isDisabled: boolean;
  onClick: () => void;
}

const WelcomePlayButton = ({ isDisabled, onClick }: Props) => {
  const fontFamily = "mishmash";
  const isBold = true;
  const color = "white";
  const fontSizeRatio = 0.8;
  const text = "Play";

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
        aspectRatio: "3 / 1",
        transform: "translate(-50%, -50%)",
        margin: "0px",
      }}
    >
      <ImageTextButton
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

export default WelcomePlayButton;
