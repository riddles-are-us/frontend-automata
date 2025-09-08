import { useEffect, useRef, useState } from "react";
import "./ErrorPopup.css";
import background from "../../image/backgrounds/withdraw_frame.png";

import { popError } from "../../../data/errors";
import { useAppDispatch } from "../../../app/hooks";
import { getTextShadowStyle } from "../../script/common/Utility";
import ConfirmButton from "../../script/button/ConfirmButton";

interface Props {
  message: string;
}

const ErrorPopup = ({ message }: Props) => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [titleFontSize, setTitleFontSize] = useState<number>(0);
  const [descriptionFontSize, setDescriptionFontSize] = useState<number>(0);

  const adjustSize = () => {
    if (containerRef.current) {
      setTitleFontSize(containerRef.current.offsetHeight / 10);
      setDescriptionFontSize(containerRef.current.offsetHeight / 15);
    }
  };

  useEffect(() => {
    adjustSize();

    window.addEventListener("resize", adjustSize);
    return () => {
      window.removeEventListener("resize", adjustSize);
    };
  }, [containerRef.current]);

  const onClickCancel = () => {
    dispatch(popError());
  };

  return (
    <div className="error-popup-container">
      <div onClick={onClickCancel} className="error-popup-mask" />
      <div ref={containerRef} className="error-popup-main-container">
        <img src={background} className="error-popup-main-background" />
        <div className="error-popup-confirm-button">
          <ConfirmButton onClick={onClickCancel} isDisabled={false} />
        </div>
        <p
          className="error-popup-title-text"
          style={{
            fontSize: titleFontSize,
            ...getTextShadowStyle(titleFontSize / 15),
          }}
        >
          Error
        </p>
        <p
          className="error-popup-description-text"
          style={{
            fontSize: descriptionFontSize,
            ...getTextShadowStyle(titleFontSize / 30),
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default ErrorPopup;
