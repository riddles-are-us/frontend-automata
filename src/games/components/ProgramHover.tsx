import React from "react";
import "./ProgramHover.css";
import background from "../images/backgrounds/hover_frame.png";
import Grid from "./Grid";
import { getResourceIconPath, ProgramModel, AttributeType } from "../../data/automata/models";
import ProgramResourceDisplay from "./ProgramResourceDisplay";
import { useAppSelector } from "../../app/hooks";
import { selectSelectedCreature, adjustResourceByProductivity, adjustProcessingTimeBySpeed, formatTime } from "../../data/automata/creatures";

interface Props {
  program: ProgramModel | null;
}

const ProgramHover = ({ program }: Props) => {
  // 获取选中生物的Productivity、Efficiency和Speed属性值
  // Get the Productivity, Efficiency and Speed attribute values of the selected creature
  const selectedCreature = useAppSelector(selectSelectedCreature);
  const productivityValue = selectedCreature.attributes.find(
    (attr: { type: AttributeType, amount: number }) => attr.type === AttributeType.Productivity
  )?.amount ?? 0;
  const efficiencyValue = selectedCreature.attributes.find(
    (attr: { type: AttributeType, amount: number }) => attr.type === AttributeType.Efficiency
  )?.amount ?? 0;
  const speedValue = selectedCreature.attributes.find(
    (attr: { type: AttributeType, amount: number }) => attr.type === AttributeType.Speed
  )?.amount ?? 0;

  return (
    <>
      {program && (
        <div className="program-hover-container">
          <img src={background} className="program-hover-background" />
          {/* <p className="program-hover-time-text">
            {formatTime(adjustProcessingTimeBySpeed(program.processingTime, speedValue))}
          </p> */}
          <div className="program-hover-resource-grid">
            <Grid
              elementWidth={80} /* 增加宽度以适应更宽的ProgramResourceDisplay */
              elementHeight={16}
              columnCount={2}
              rowCount={4}
              elements={program.resources.map((resource, index) => {
                // 调整资源数量，同时考虑Productivity和Efficiency属性
                // Adjust resource amount considering both Productivity and Efficiency attributes
                const adjustedResource = adjustResourceByProductivity(resource, productivityValue, efficiencyValue);
                return (
                  <ProgramResourceDisplay
                    key={index}
                    iconImagePath={getResourceIconPath(resource.type)}
                    amount={adjustedResource.amount}
                    originalAmount={resource.amount}
                  />
                );
              })}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProgramHover;
