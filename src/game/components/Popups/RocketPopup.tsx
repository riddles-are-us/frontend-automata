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
import "./RocketPopup.css";
import {
  getResourceIconPath,
  redeemEnergyTitaniumCost,
  ResourceType,
} from "../../../data/models";
import { selectResource } from "../../../data/resources";
import { selectRedeemEnergy } from "../../../data/properties";
import {
  useWalletContext,
  queryState,
  sendTransaction,
} from "zkwasm-minirollup-browser";
import { getCollectEnergyTransactionCommandArray } from "../../rpc";
import GainEnergy from "../GainEnergy";
import { useEffect, useRef, useState } from "react";
import { setLoadingType, LoadingType, pushError } from "../../../data/errors";
import ConfirmButton from "../../script/button/ConfirmButton";

interface GainEnergyProps {
  startPosition: { x: number; y: number };
  rewardAnimationDelay: number;
  shakeAnimationDelay: number;
  opacity: number;
}

const gainnergyProps: GainEnergyProps[] = [
  {
    startPosition: { x: 17, y: 39 },
    rewardAnimationDelay: 0.0,
    shakeAnimationDelay: 0.88,
    opacity: 0.5,
  },
  {
    startPosition: { x: 14, y: 30 },
    rewardAnimationDelay: 0.1,
    shakeAnimationDelay: 0.79,
    opacity: 0.54,
  },
  {
    startPosition: { x: 31, y: 40 },
    rewardAnimationDelay: 0.2,
    shakeAnimationDelay: 0.75,
    opacity: 0.61,
  },
  {
    startPosition: { x: 0, y: 28 },
    rewardAnimationDelay: 0.3,
    shakeAnimationDelay: 0.51,
    opacity: 0.76,
  },
  {
    startPosition: { x: 40, y: 34 },
    rewardAnimationDelay: 0.4,
    shakeAnimationDelay: 0.25,
    opacity: 0.8,
  },
  {
    startPosition: { x: 37, y: 33 },
    rewardAnimationDelay: 0.5,
    shakeAnimationDelay: 0.75,
    opacity: 0.52,
  },
  {
    startPosition: { x: 20, y: 39 },
    rewardAnimationDelay: 0.6,
    shakeAnimationDelay: 0.69,
    opacity: 0.51,
  },
  {
    startPosition: { x: 10, y: 20 },
    rewardAnimationDelay: 0.7,
    shakeAnimationDelay: 0.05,
    opacity: 0.77,
  },
  {
    startPosition: { x: 34, y: 34 },
    rewardAnimationDelay: 0.8,
    shakeAnimationDelay: 0.03,
    opacity: 0.77,
  },
  {
    startPosition: { x: 7, y: 32 },
    rewardAnimationDelay: 0.9,
    shakeAnimationDelay: 0.89,
    opacity: 0.52,
  },
];

const RocketPopup = () => {
  const dispatch = useAppDispatch();
  const { l2Account } = useWalletContext();
  const nonce = useAppSelector(selectNonce);
  const uIState = useAppSelector(selectUIState);
  const redeemEnergy = useAppSelector(selectRedeemEnergy);
  const titaniumCount = useAppSelector(selectResource(ResourceType.Titanium));
  const [rewardAnimation, setRewardAnimation] = useState(false);
  const [finishQuery, setFinishQuery] = useState(false);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const getEndPosition = (parentContainer: HTMLDivElement | null) => {
    return parentContainer == null
      ? {
          x: 0,
          y: 0,
        }
      : {
          x: -(parentContainer.clientWidth / 2 - 220),
          y: -(parentContainer.clientHeight / 2 + 30),
        };
  };
  const endPosition = getEndPosition(parentRef && parentRef.current);

  const onClickConfirm = () => {
    if (titaniumCount < redeemEnergyTitaniumCost) {
      return;
    }
    if (uIState.type == UIStateType.RocketPopup) {
      dispatch(setLoadingType(LoadingType.Default));
      setFinishQuery(false);
      setRewardAnimation(true);
      dispatch(
        sendTransaction({
          cmd: getCollectEnergyTransactionCommandArray(nonce),
          prikey: l2Account!.getPrivateKey(),
        })
      ).then((action: any) => {
        if (sendTransaction.fulfilled.match(action)) {
          dispatch(queryState(l2Account.getPrivateKey())).then(
            (action: any) => {
              if (queryState.fulfilled.match(action)) {
                setFinishQuery(true);
              }
            }
          );
        } else if (sendTransaction.rejected.match(action)) {
          const message = "claim rocket Error: " + action.payload;
          dispatch(pushError(message));
          console.error(message);
        }
      });
    }
  };

  const onClickCancel = () => {
    dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
  };

  const onAnimationEnd = () => {
    if (rewardAnimation) {
      setRewardAnimation(false);
    }
  };

  useEffect(() => {
    if (!rewardAnimation && finishQuery) {
      dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
      dispatch(setLoadingType(LoadingType.None));
    }
  }, [rewardAnimation, finishQuery]);

  return (
    <div ref={parentRef} className="rocket-popup-container">
      <div onClick={onClickCancel} className="rocket-popup-mask" />
      <div className="rocket-popup-main-container">
        <img src={background} className="rocket-popup-main-background" />
        <p className="rocket-popup-title-text">Redeem {redeemEnergy} Energy</p>
        <p className="rocket-popup-subtitle-text">Cost</p>
        <div className="rocket-popup-cost-container">
          <img
            src={getResourceIconPath(ResourceType.Titanium)}
            className="rocket-popup-cost-icon"
          />
          <p className="rocket-popup-cost-text">{redeemEnergyTitaniumCost}</p>
          <img
            src={amountBackground}
            className="rocket-popup-cost-background"
          />
        </div>
        <div className="rocket-popup-confirm-button">
          <ConfirmButton
            onClick={onClickConfirm}
            isDisabled={titaniumCount < redeemEnergyTitaniumCost}
          />
        </div>
      </div>
      <div className="rocket-popup-energy-animation-container">
        {gainnergyProps.map((prop, index) => (
          <GainEnergy
            key={index}
            animationIndex={index}
            rewardAnimation={rewardAnimation}
            onAnimationEnd={
              index == 0
                ? onAnimationEnd
                : () => {
                    /* */
                  }
            }
            startPosition={prop.startPosition}
            endPosition={endPosition}
            rewardAnimationDelay={prop.rewardAnimationDelay}
            shakeAnimationDelay={prop.shakeAnimationDelay}
            opacity={prop.opacity}
          />
        ))}
      </div>
    </div>
  );
};

export default RocketPopup;
