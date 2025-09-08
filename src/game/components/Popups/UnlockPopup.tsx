import React, { useState } from "react";
import background from "../../image/backgrounds/withdraw_frame.png";
import amountBackground from "../../image/backgrounds/withdraw_amount_background.png";
import {
  UIState,
  UIStateType,
  selectCurrentCost,
  setUIState,
} from "../../../data/properties";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./UnlockPopup.css";
import { getResourceIconPath, ResourceType } from "../../../data/models";
import { selectResource } from "../../../data/resources";
import ConfirmButton from "../../script/button/ConfirmButton";

const UnlockPopup = () => {
  const dispatch = useAppDispatch();
  const currentCost = useAppSelector(selectCurrentCost);
  const titaniumCount = useAppSelector(selectResource(ResourceType.Titanium));

  const onClickConfirm = () => {
    dispatch(
      setUIState({ uIState: { type: UIStateType.PlayUnlockAnimation } })
    );
  };

  const onClickCancel = () => {
    dispatch(setUIState({ uIState: { type: UIStateType.Creating } }));
  };

  return (
    <div className="unlock-popup-container">
      <div onClick={onClickCancel} className="unlock-popup-mask" />
      <div className="unlock-popup-main-container">
        <img src={background} className="unlock-popup-main-background" />
        <p className="unlock-popup-title-text">Unlock</p>
        <p className="unlock-popup-subtitle-text">Cost</p>
        <div className="unlock-popup-cost-container">
          <img
            src={getResourceIconPath(ResourceType.Titanium)}
            className="unlock-popup-cost-icon"
          />
          <p className="unlock-popup-cost-text">{currentCost + 1000}</p>
          <img
            src={amountBackground}
            className="unlock-popup-cost-background"
          />
        </div>
        <div className="unlock-popup-confirm-button">
          <ConfirmButton
            onClick={onClickConfirm}
            isDisabled={titaniumCount < currentCost + 1000}
          />
        </div>
      </div>
    </div>
  );
};

export default UnlockPopup;
