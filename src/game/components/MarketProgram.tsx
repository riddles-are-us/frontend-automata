import React, { useEffect, useRef, useState } from "react";
import "./MarketProgram.css";
import Grid from "./Grid";
import ProgramResourceDisplay from "./ProgramResourceDisplay";
import {
  getResourceIconPath,
  ResourceType,
  ProgramModel,
} from "../../data/models";
import { formatTime } from "../../data/creatures";
import background from "../image/backgrounds/market_card_frame.png";
import MarketProgramBidButton from "../script/button/MarketProgramBidButton";
import MarketProgramSellButton from "../script/button/MarketProgramSellButton";
import MarketProgramListButton from "../script/button/MarketProgramListButton";

interface Props {
  program: ProgramModel;
  isInstalled: boolean;
  onClickBid?: () => void;
  onClickSell?: () => void;
  onClickList?: () => void;
}

const MarketProgram = ({
  program,
  isInstalled,
  onClickBid = undefined,
  onClickSell = undefined,
  onClickList = undefined,
}: Props) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [nameFontSize, setNameFontSize] = useState<number>(0);
  const [timeFontSize, setTimeFontSize] = useState<number>(0);
  const [bidFontSize, setBidFontSize] = useState<number>(0);
  const gridContainerRef = useRef<HTMLParagraphElement>(null);
  const [elementWidth, setElementWidth] = useState<number>(0);
  const [elementHeight, setElementHeight] = useState<number>(0);
  const columnCount = 2;
  const rowCount = 4;

  const adjustSize = () => {
    if (containerRef.current) {
      setNameFontSize(containerRef.current.offsetHeight / 12);
      setTimeFontSize(containerRef.current.offsetHeight / 15);
      setBidFontSize(containerRef.current.offsetHeight / 22);
    }
    if (gridContainerRef.current) {
      setElementWidth(gridContainerRef.current.offsetWidth / columnCount);
      setElementHeight(gridContainerRef.current.offsetHeight / rowCount);
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
    <div className="market-program-container" ref={containerRef}>
      <img src={background} className="market-program-background" />
      <p
        className="market-program-name-text"
        style={{ fontSize: nameFontSize }}
      >
        {program.name}
      </p>
      <p
        className="market-program-time-text"
        style={{ fontSize: timeFontSize }}
      >
        {formatTime(program.processingTime)}
      </p>
      <div className="market-program-resource-grid" ref={gridContainerRef}>
        <Grid
          elementWidth={elementWidth}
          elementHeight={elementHeight}
          columnCount={columnCount}
          rowCount={rowCount}
          elements={program.resources.map((resource, index) => (
            <ProgramResourceDisplay
              key={index}
              iconImagePath={getResourceIconPath(resource.type)}
              amount={resource.amount}
            />
          ))}
        />
      </div>
      {!onClickList && (
        <>
          <p
            className="market-program-bid-title-text"
            style={{ fontSize: bidFontSize }}
          >
            Highest Bid :
          </p>
          <img
            src={getResourceIconPath(ResourceType.Titanium)}
            className="market-program-bid-icon"
          />
          <p
            className="market-program-bid-text"
            style={{ fontSize: bidFontSize }}
          >
            {program.bid?.bidprice ?? 0}
          </p>
          <p
            className="market-program-ask-title-text"
            style={{ fontSize: bidFontSize }}
          >
            Ask Price :
          </p>
          <img
            src={getResourceIconPath(ResourceType.Titanium)}
            className="market-program-ask-icon"
          />
          <p
            className="market-program-ask-text"
            style={{ fontSize: bidFontSize }}
          >
            {program.askPrice}
          </p>
        </>
      )}
      {isInstalled && onClickList && (
        <p
          className="market-program-installed-text"
          style={{ fontSize: nameFontSize }}
        >
          In use
        </p>
      )}
      {onClickBid && (
        <div className="market-program-button">
          <MarketProgramBidButton onClick={onClickBid} isDisabled={false} />
        </div>
      )}
      {onClickSell && (
        <div className="market-program-button">
          <MarketProgramSellButton onClick={onClickSell} isDisabled={false} />
        </div>
      )}
      {!isInstalled && onClickList && (
        <div className="market-program-button">
          <MarketProgramListButton onClick={onClickList} isDisabled={false} />
        </div>
      )}
    </div>
  );
};

export default MarketProgram;
