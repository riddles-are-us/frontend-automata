import React from "react";
import "./Program.css";
import Grid from "./Grid";
import ProgramResourceDisplay from "./ProgramResourceDisplay";
import {
  ProgramModel,
  getResourceIconPath,
  getProgramIconPath,
  AttributeType,
} from "../../data/automata/models";
import ProgramButton from "./Buttons/ProgramButton";

import { formatTime, adjustResourceByProductivity, adjustProcessingTimeBySpeed } from "../../data/automata/creatures";
import ProgramTutorial from "./ProgramTutorial";
import { useAppSelector } from "../../app/hooks";
import { selectSelectedCreature } from "../../data/automata/creatures";

interface Props {
  index: number;
  program: ProgramModel;
  isDisabled: boolean;
  onSelect: () => void;
}

const Program = ({ index, program, isDisabled, onSelect }: Props) => {
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
    <div className="program-container">
      {index == 0 && <ProgramTutorial />}
      <ProgramButton isDisabled={isDisabled} onClick={onSelect} />
      <p className="program-name-text">{program.name}</p>
      <p className="program-time-text">
        {formatTime(adjustProcessingTimeBySpeed(program.processingTime, speedValue))}
      </p>
      <img
        src={getProgramIconPath(program.type)}
        className="program-icon-image"
      />
      <div className="program-resource-grid">
        <Grid
          elementWidth={44}
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
                amount={resource.amount}
                // originalAmount={resource.amount}
              />
            );
          })}
        />
      </div>
    </div>
  );
};

export default Program;
