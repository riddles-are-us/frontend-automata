import React, { useState } from "react";
import background from "../../image/backgrounds/withdraw_frame.png";
import amountBackground from "../../image/backgrounds/withdraw_amount_background.png";
import {
  UIStateType,
  selectNonce,
  selectUIState,
  setUIState,
} from "../../../data/properties";
import {
  getResourceIconPath,
  ResourceType,
  getNumberAbbr,
} from "../../../data/models";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./WithdrawPopup.css";
import { getWithdrawTransactionCommandArray } from "../../rpc";
import { sendTransaction, useWalletContext } from "zkwasm-minirollup-browser";
import { selectResource } from "../../../data/resources";
import {
  LoadingType,
  pushError,
  selectIsLoading,
  setLoadingType,
} from "../../../data/errors";
import ConfirmButton from "../../script/button/ConfirmButton";

interface Props {
  isWithdraw: boolean;
}

const WithdrawPopup = ({ isWithdraw }: Props) => {
  const dispatch = useAppDispatch();
  const uIState = useAppSelector(selectUIState);
  const nonce = useAppSelector(selectNonce);
  const { l1Account, l2Account, deposit } = useWalletContext();
  const [amountString, setAmountString] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isLoading = useAppSelector(selectIsLoading);
  const titaniumCount = useAppSelector(selectResource(ResourceType.Titanium));

  const withdraw = (amount: number) => {
    try {
      dispatch(setLoadingType(LoadingType.Default));
      dispatch(
        sendTransaction({
          cmd: getWithdrawTransactionCommandArray(
            nonce,
            BigInt(amount),
            l1Account!
          ),
          prikey: l2Account!.getPrivateKey(),
        })
      ).then((action) => {
        if (sendTransaction.fulfilled.match(action)) {
          dispatch(
            setUIState({
              uIState: {
                type: UIStateType.ConfirmPopup,
                confirmPopupInfo: {
                  title: "Withdraw Success",
                  description: "Hash Number : (TBD)",
                  isError: false,
                },
              },
            })
          );
          dispatch(setLoadingType(LoadingType.None));
        } else if (sendTransaction.rejected.match(action)) {
          const message = "withdraw / deposit Error: " + action.payload;
          dispatch(pushError(message));
          console.error(message);
          dispatch(setLoadingType(LoadingType.None));
        }
      });
    } catch (e) {
      console.log("Error at withdraw " + e);
    }
  };

  const onDeposit = (amount: string) => {
    dispatch(setLoadingType(LoadingType.Default));
    deposit({
      tokenIndex: 0,
      amount: Number(BigInt(amount)),
    })
      .then((result) => {
        dispatch(
          setUIState({
            uIState: {
              type: UIStateType.ConfirmPopup,
              confirmPopupInfo: {
                title: "Deposit Success",
                description: `Hash Number : (TBD)${result.hash}`,
                isError: false,
              },
            },
          })
        );
        dispatch(setLoadingType(LoadingType.None));

        setErrorMessage("");
      })
      .catch((error) => {
        dispatch(
          setUIState({
            uIState: {
              type: UIStateType.ConfirmPopup,
              confirmPopupInfo: {
                title: "Deposit Fail",
                description: error.message,
                isError: true,
              },
            },
          })
        );
        dispatch(setLoadingType(LoadingType.None));
      });
  };

  const onClickConfirm = () => {
    const amount = Number(amountString);
    if (isWithdraw) {
      if (amount > titaniumCount) {
        setErrorMessage("Not Enough Titanium");
      } else {
        setErrorMessage("");
        withdraw(amount);
      }
    } else {
      // case of deposit
      onDeposit(amountString);
    }
  };

  const onClickCancel = () => {
    if (!isLoading) {
      dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
    }
  };

  return (
    <div className="withdraw-popup-container">
      <div onClick={onClickCancel} className="withdraw-popup-mask" />
      <div className="withdraw-popup-main-container">
        <img src={background} className="withdraw-popup-main-background" />
        <p className="withdraw-popup-title-text">
          {isWithdraw ? "Withdraw" : "Deposit"}
        </p>
        <div className="withdraw-popup-titanium-resource-container">
          <img
            src={getResourceIconPath(ResourceType.Titanium)}
            className="withdraw-popup-titanium-resource-display-image"
          />
          <p className="withdraw-popup-titanium-resource-display-text">
            {getNumberAbbr(titaniumCount)}
          </p>
        </div>
        {errorMessage != "" && (
          <p className="withdraw-popup-amount-text">{errorMessage}</p>
        )}
        <div className="withdraw-popup-amount-container">
          <img
            src={amountBackground}
            className="withdraw-popup-amount-background"
          />
          <input
            type="number"
            className="withdraw-popup-amount-input"
            value={amountString}
            onChange={(e) => setAmountString(e.target.value)}
            min="0"
          />
        </div>
        <div className="withdraw-popup-confirm-button">
          <ConfirmButton onClick={onClickConfirm} isDisabled={false} />
        </div>
      </div>
    </div>
  );
};

export default WithdrawPopup;
