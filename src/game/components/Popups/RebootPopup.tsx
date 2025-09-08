import React, { useState } from "react";
import background from "../../image/backgrounds/withdraw_frame.png";
import amountBackground from "../../image/backgrounds/withdraw_amount_background.png";
import {
  UIState,
  UIStateType,
  selectCurrentCost,
  selectNonce,
  selectUIState,
  setUIState,
} from "../../../data/properties";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./RebootPopup.css";
import { getResourceIconPath, ResourceType } from "../../../data/models";
import { selectResource } from "../../../data/resources";
import { getInstallProgramTransactionCommandArray } from "../../rpc";
import {
  useWalletContext,
  queryState,
  sendTransaction,
} from "zkwasm-minirollup-browser";
import {
  clearRebootCreature,
  selectSelectedCreature,
  selectSelectedCreatureListIndex,
} from "../../../data/creatures";
import { setLoadingType, LoadingType, pushError } from "../../../data/errors";
import ConfirmButton from "../../script/button/ConfirmButton";

const RebootPopup = () => {
  const dispatch = useAppDispatch();
  const currentCost = useAppSelector(selectCurrentCost);
  const titaniumCount = useAppSelector(selectResource(ResourceType.Titanium));
  const { l2Account } = useWalletContext();
  const uIState = useAppSelector(selectUIState);
  const nonce = useAppSelector(selectNonce);
  const selectedCreature = useAppSelector(selectSelectedCreature);
  const selectedCreatureIndexForRequestEncode = useAppSelector(
    selectSelectedCreatureListIndex
  );

  const onClickConfirm = () => {
    if (uIState.type == UIStateType.RebootPopup) {
      // bugs here, after creating a new creature, the list will refresh unproperly.
      // fix it after UI done polishing creature list since it may change the layout of the creating creature.
      dispatch(setLoadingType(LoadingType.Default));
      dispatch(
        sendTransaction({
          cmd: getInstallProgramTransactionCommandArray(
            nonce,
            selectedCreature.programIndexes.map((index: any) => index!),
            selectedCreatureIndexForRequestEncode,
            false
          ),
          prikey: l2Account!.getPrivateKey(),
        })
      ).then((action) => {
        if (sendTransaction.fulfilled.match(action)) {
          dispatch(queryState(l2Account.getPrivateKey())).then((action) => {
            if (queryState.fulfilled.match(action)) {
              dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
              dispatch(setLoadingType(LoadingType.None));

              dispatch(clearRebootCreature({}));
            } else {
              dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
              dispatch(clearRebootCreature({}));
              dispatch(setLoadingType(LoadingType.None));
            }
          });
        } else if (sendTransaction.rejected.match(action)) {
          const message = "reboot Error: " + action.payload;
          dispatch(pushError(message));
          console.error(message);
          dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
          dispatch(setLoadingType(LoadingType.None));
        }
      });
    }
  };

  const onClickCancel = () => {
    dispatch(setUIState({ uIState: { type: UIStateType.Reboot } }));
  };

  return (
    <div className="reboot-popup-container">
      <div onClick={onClickCancel} className="reboot-popup-mask" />
      <div className="reboot-popup-main-container">
        <img src={background} className="reboot-popup-main-background" />
        <p className="reboot-popup-title-text">Reboot</p>
        <p className="reboot-popup-subtitle-text">Cost</p>
        <div className="reboot-popup-cost-container">
          <img
            src={getResourceIconPath(ResourceType.Titanium)}
            className="reboot-popup-cost-icon"
          />
          <p className="reboot-popup-cost-text">{currentCost}</p>
          <img
            src={amountBackground}
            className="reboot-popup-cost-background"
          />
        </div>
        <div className="reboot-popup-confirm-button">
          <ConfirmButton
            onClick={onClickConfirm}
            isDisabled={titaniumCount < currentCost}
          />
        </div>
      </div>
    </div>
  );
};

export default RebootPopup;
