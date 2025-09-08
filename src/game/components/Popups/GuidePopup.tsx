import React from "react";
import background from "../../image/backgrounds/guide_frame.png";
import HorizontalPrevPageButton from "../Buttons/HorizontalPrevPageButton";
import HorizontalNextPageButton from "../Buttons/HorizontalNextPageButton";
import {
  SceneType,
  UIState,
  UIStateType,
  setSceneType,
  setUIState,
} from "../../../data/properties";
import {
  nextPage,
  prevPage,
  selectCurrentPage,
  selectTotalPage,
  selectGuideOnCurrentPage,
} from "../../../data/guides";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./GuidePopup.css";
import GuidePlayButton from "../../script/button/GuidePlayButton";

const GuidePopup = () => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPage = useAppSelector(selectTotalPage);
  const currentGuide = useAppSelector(selectGuideOnCurrentPage);
  const showPageSelector = totalPage > 1;
  const enableSkipButton = currentPage >= totalPage - 1;
  const enablePrevPageButton = currentPage > 0;
  const enableNextPageButton = currentPage < totalPage - 1;

  const onClickEndGuide = () => {
    if (enableSkipButton) {
      dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
      dispatch(setSceneType({ sceneType: SceneType.Planet }));
    }
  };

  const onClickPrevPageButton = () => {
    dispatch(prevPage({}));
  };

  const onClickNextPageButton = () => {
    dispatch(nextPage({}));
  };

  return (
    <div className="guide-popup-container">
      <div onClick={onClickEndGuide} className="guide-popup-mask" />
      <div className="guide-popup-main-container">
        <img src={background} className="guide-popup-main-background" />
        {currentGuide}
        {!enableSkipButton && (
          <div className="guide-popup-prev-button">
            <HorizontalPrevPageButton
              isDisabled={!enablePrevPageButton}
              onClick={onClickPrevPageButton}
            />
          </div>
        )}
        {!enableSkipButton && (
          <div className="guide-popup-next-button">
            <HorizontalNextPageButton
              isDisabled={!enableNextPageButton}
              onClick={onClickNextPageButton}
            />
          </div>
        )}
        {enableSkipButton && (
          <div className="guide-popup-end-guide-button">
            <GuidePlayButton onClick={onClickEndGuide} isDisabled={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidePopup;
