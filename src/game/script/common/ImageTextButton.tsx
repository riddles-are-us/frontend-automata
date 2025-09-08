import React, { useRef, useEffect, useState } from "react";
import "./ImageTextButton.css";
import ElementButton from "./ElementButton";

interface Props {
  id?: number;
  onClick: () => void;
  isDisabled: boolean;
  normalImage: string;
  hoverImage: string;
  clickImage: string;
  disabledImage: string;
  getText: (fontBaseSize: number) => JSX.Element;
}

const ImageTextButton = ({
  id = 0,
  onClick,
  isDisabled,
  normalImage,
  hoverImage,
  clickImage,
  disabledImage,
  getText,
}: Props) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [baseFontSize, setBaseFontSize] = useState<number>(0);

  const adjustSize = () => {
    if (containerRef.current) {
      setBaseFontSize(containerRef.current.offsetHeight / 2);
    }
  };

  useEffect(() => {
    adjustSize();

    window.addEventListener("resize", adjustSize);
    return () => {
      window.removeEventListener("resize", adjustSize);
    };
  }, [
    containerRef.current,
    containerRef.current?.offsetHeight,
    containerRef.current?.offsetWidth,
    id,
  ]);

  const getElement = (image: string) => {
    return (
      <>
        <img src={image} className="image-text-button-background" />
        {getText(baseFontSize)}
      </>
    );
  };

  return (
    <div ref={containerRef} className="image-text-button-container">
      <ElementButton
        isDisabled={isDisabled}
        defaultElement={getElement(normalImage)}
        hoverElement={getElement(hoverImage)}
        clickedElement={getElement(clickImage)}
        disabledElement={getElement(disabledImage)}
        onClick={onClick}
      />
    </div>
  );
};

export default ImageTextButton;
