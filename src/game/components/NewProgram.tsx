import React, { useEffect, useRef, useState } from "react";
import "./NewProgram.css";
import background from "../image/backgrounds/new_program_normal.png";
import { getResourceIconPath, ResourceType } from "../../data/models";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentCost, selectLevel } from "../../data/properties";
import { selectResource } from "../../data/resources";
import { selectProgramCount } from "../../data/programs";
import NewProgramButton from "../script/button/NewProgramButton";

interface Props {
  onSelect: () => void;
}

const NewProgram = ({ onSelect }: Props) => {
  const currentCost = useAppSelector(selectCurrentCost);
  const titaniumCount = useAppSelector(selectResource(ResourceType.Titanium));
  const programCount = useAppSelector(selectProgramCount);
  const level = useAppSelector(selectLevel);
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState<number>(0);

  const adjustSize = () => {
    if (containerRef.current) {
      setFontSize(containerRef.current.offsetHeight / 7);
    }
  };

  useEffect(() => {
    adjustSize();

    window.addEventListener("resize", adjustSize);
    return () => {
      window.removeEventListener("resize", adjustSize);
    };
  }, [containerRef.current, containerRef.current?.offsetHeight]);

  return (
    <div className="new-program-container" ref={containerRef}>
      <img src={background} className="new-program-background" />
      <p className="new-program-title-text" style={{ fontSize }}>
        Buy New
      </p>
      <p className="new-program-title-2-text" style={{ fontSize }}>
        Program
      </p>
      <div className="new-program-button">
        <NewProgramButton
          onClick={onSelect}
          isDisabled={
            titaniumCount < currentCost || programCount >= level * 4 + 4
          }
        />
      </div>
      <img
        src={getResourceIconPath(ResourceType.Titanium)}
        className="new-program-icon-image"
      />
      <p className="new-program-button-text" style={{ fontSize }}>
        {currentCost}
      </p>
    </div>
  );
};

export default NewProgram;
