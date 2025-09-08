import React, { useEffect, useState, useRef, MouseEvent } from "react";
import circleBackground from "../image/backgrounds/circle.png";
import MainMenuProgram from "./MainMenuProgram";
import CreatureConfirmButton from "./Buttons/CreatureConfirmButton";
import "./PlanetScene.css";
import DiffResourcesInfo from "./DiffResourcesInfo";
import Rocket from "./Rocket";
import { getInstallProgramTransactionCommandArray } from "../rpc";
import { useWalletContext } from "zkwasm-minirollup-browser";
import { sendTransaction, queryState } from "../request";
import { getCreatureIconPath } from "../../data/models";
import {
  UIState,
  selectIsSelectingUIState,
  selectUIState,
  selectNonce,
  setUIState,
  UIStateType,
  selectSceneType,
  SceneType,
} from "../../data/properties";
import {
  LoadingType,
  pushError,
  selectIsLoading,
  setLoadingType,
} from "../../data/errors";
import {
  startRebootCreature,
  clearRebootCreature,
  selectIsNotSelectingCreature,
  selectSelectedCreature,
  selectSelectedCreaturePrograms,
  selectSelectedCreatureDiffResources,
  selectSelectedCreatureListIndex,
  selectSelectedCreatureCurrentProgram,
  selectSelectedCreatureSelectingProgram,
  startCreatingCreature,
  changeSelectedCreature,
  selectCurrentCreatureTypes,
  setSelectedCreature,
  selectSelectedCreatureIndex,
} from "../../data/creatures";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import MainMenuWarning from "./MainMenuWarning";
import MainMenuProgressBar from "./MainMenuProgressBar";
import RedeemMenu from "./RedeemScene";
import MainMenuEmptyHint from "./MainMenuEmptyHint";
import MarketPopup from "./Popups/MarketScene";
import Creature from "./Creature";
import PrevPageButton from "./Buttons/PrevPageButton";
import NextPageButton from "./Buttons/NextPageButton";
import CreatureRebootButton from "./Buttons/CreatureRebootButton";
import CreatureNewButton from "./Buttons/CreatureNewButton";
import { Scenario } from "../script/scene/planet/scenario/Scenario";
import Planet1Button from "./Buttons/Planet1Button";
import Planet2Button from "./Buttons/Planet2Button";
import Planet3Button from "./Buttons/Planet3Button";
import {
  CREATURE_PER_BACKGROUND,
  newCreaturePositions,
} from "../script/scene/planet/scenario/Background";

interface Props {
  localTimer: number;
  mainContainerRef: React.RefObject<HTMLDivElement>;
}

const PlanetScene = ({ localTimer, mainContainerRef }: Props) => {
  const dispatch = useAppDispatch();
  const { l2Account } = useWalletContext();

  const uIState = useAppSelector(selectUIState);
  const nonce = useAppSelector(selectNonce);
  const isNotSelectingCreature = useAppSelector(selectIsNotSelectingCreature);
  const selectedCreature = useAppSelector(selectSelectedCreature);
  const selectedCreaturePrograms = useAppSelector(
    selectSelectedCreaturePrograms
  );

  const isSelectingUIState = useAppSelector(selectIsSelectingUIState);
  const showConfirmRebootButton = uIState.type == UIStateType.Reboot;
  const showConfirmCreateButton = uIState.type == UIStateType.Creating;
  const enableConfirmButton = selectedCreaturePrograms.every(
    (program) => program !== null
  );
  const showRebootButton =
    uIState.type == UIStateType.Idle && !isNotSelectingCreature;
  const selectedCreatureIndexForRequestEncode = useAppSelector(
    selectSelectedCreatureListIndex
  );
  const isLoading = useAppSelector(selectIsLoading);
  const currentCreatureTypes = useAppSelector(selectCurrentCreatureTypes);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);
  const scenarioRef = useRef<Scenario | null>(null);
  const backgroundIndexRef = useRef<number>(0);
  const showNewCreatureButton =
    backgroundIndexRef.current * CREATURE_PER_BACKGROUND <=
      currentCreatureTypes.length &&
    (backgroundIndexRef.current + 1) * CREATURE_PER_BACKGROUND >
      currentCreatureTypes.length;

  const containerRatio = 1671 / 951;
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const adjustSize = () => {
    if (mainContainerRef.current) {
      const height = Math.min(
        mainContainerRef.current.offsetHeight,
        mainContainerRef.current.offsetWidth / containerRatio
      );
      setContainerHeight(height);
      setContainerWidth(height * containerRatio);
    }
  };

  useEffect(() => {
    adjustSize();

    window.addEventListener("resize", adjustSize);
    return () => {
      window.removeEventListener("resize", adjustSize);
    };
  }, [mainContainerRef.current]);

  function onClickUnlock() {
    if (uIState.type == UIStateType.Creating) {
      dispatch(setUIState({ uIState: { type: UIStateType.UnlockPopup } }));
    }
  }

  function playUnlockAnimation(onAnimationEnd: () => void) {
    setShowUnlockAnimation(true);
    setTimeout(() => {
      setShowUnlockAnimation(false);
      onAnimationEnd();
    }, 1000);
  }

  function playUpgradeAnimation(onAnimationEnd: () => void) {
    setShowUpgradeAnimation(true);
    setTimeout(() => {
      setShowUpgradeAnimation(false);
      onAnimationEnd();
    }, 1000);
  }

  function sendUpdateProgram() {
    if (!isLoading) {
      // bugs here, after creating a new creature, the list will refresh unproperly.
      // fix it after UI done polishing creature list since it may change the layout of the creating creature.
      dispatch(setLoadingType(LoadingType.Default));
      dispatch(
        sendTransaction({
          cmd: getInstallProgramTransactionCommandArray(
            nonce,
            selectedCreature.programIndexes.map((index: any) => index!),
            selectedCreatureIndexForRequestEncode,
            true
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
              dispatch(setLoadingType(LoadingType.None));
              dispatch(clearRebootCreature({}));
            }
          });
        } else if (sendTransaction.rejected.match(action)) {
          const message = "update program Error: " + action.payload;
          dispatch(pushError(message));
          console.error(message);
          dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
          dispatch(setLoadingType(LoadingType.None));
        }
      });
    }
  }

  function onClickReboot() {
    if (!isLoading) {
      dispatch(setUIState({ uIState: { type: UIStateType.Reboot } }));
      dispatch(startRebootCreature({}));
    }
  }

  function onClickConfirmReboot() {
    if (!isLoading) {
      dispatch(setUIState({ uIState: { type: UIStateType.RebootPopup } }));
    }
  }

  function onClickNewCreature() {
    if (!isLoading) {
      dispatch(setUIState({ uIState: { type: UIStateType.Creating } }));
      dispatch(startCreatingCreature({}));
    }
  }

  const currentProgramInfo = useAppSelector(
    isSelectingUIState || isLoading
      ? selectSelectedCreatureSelectingProgram
      : selectSelectedCreatureCurrentProgram(localTimer)
  );

  useEffect(() => {
    const draw = (): void => {
      if (scenarioRef.current && scenarioRef.current.status === "play") {
        scenarioRef.current.draw();
        scenarioRef.current.step();
      }
    };

    const intervalId = setInterval(draw, 30); // 1000ms = 1 second

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    scenarioRef.current = new Scenario(containerWidth, containerHeight);
  }, [containerWidth, containerHeight]);

  useEffect(() => {
    if (scenarioRef.current) {
      scenarioRef.current.updateCreatureAnimations(
        currentCreatureTypes,
        uIState.type == UIStateType.Creating
      );
    }
  }, [scenarioRef.current, currentCreatureTypes]);

  useEffect(() => {
    if (scenarioRef.current) {
      scenarioRef.current.updateBackground(backgroundIndexRef.current);
    }
  }, [backgroundIndexRef.current]);

  useEffect(() => {
    if (uIState.type == UIStateType.PlayUnlockAnimation) {
      playUnlockAnimation(() => sendUpdateProgram());
    }
  }, [uIState]);

  const onChangeSelectedCreature = (diff: number) => {
    if (currentCreatureTypes.length == 0) {
      return;
    }

    dispatch(changeSelectedCreature({ diff }));
    dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
  };

  function onClickCanvas(e: MouseEvent<HTMLCanvasElement>) {
    if (!scenarioRef.current) return;

    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const ratio = containerWidth / rect.width;
    const left = (e.clientX - rect.left) * ratio;
    const top = (e.clientY - rect.top) * ratio;
    const index = scenarioRef.current.getFirstCreatureInRect(left, top);
    scenarioRef.current.setFocus(index);
    dispatch(setUIState({ uIState: { type: UIStateType.Idle } }));
    dispatch(clearRebootCreature({}));
    if (index == null) {
      dispatch(setSelectedCreature({ index: -1 }));
    } else {
      dispatch(setSelectedCreature({ index }));
    }
  }

  useEffect(() => {
    if (scenarioRef.current && selectedCreatureIndexForRequestEncode != -1) {
      scenarioRef.current.setFocus(selectedCreatureIndexForRequestEncode);
    }
  }, [selectedCreatureIndexForRequestEncode]);

  return (
    // <div className="planet-scene-content">
    //   <div className="planet-scene-info-container">
    //     <DiffResourcesInfo diffResources={selectedCreatureDiffResources} />
    //   </div>
    //   <div className="planet-scene-circle-container">
    //     <MainMenuProgressBar
    //       programName={currentProgramInfo.program?.name ?? ""}
    //       replanet-sceneTime={currentProgramInfo.replanet-sceneTime}
    //       progress={currentProgramInfo.progress}
    //       iconPath={getCreatureIconPath(selectedCreature.creatureType)}
    //       isStarting={selectedCreature.isStarting}
    //       isCreating={isCreatingUIState}
    //       showAnimation={showUnlockAnimation}
    //     />
    //     <img src={circleBackground} className="planet-scene-circle-background" />

    //     <MainMenuSelectingFrame
    //       order={currentProgramInfo.index}
    //       isReady={!isLoading && !selectedCreature.isStarting}
    //       isCurrentProgram={!isSelectingUIState}
    //       isStop={selectedCreature.isProgramStop}
    //     />
    //     {selectedCreaturePrograms.map((program, index) =>
    //       program == null ? (
    //         <MainMenuEmptyHint key={index} order={index} />
    //       ) : null
    //     )}
    //     {showUnlockAnimation && (
    //       <div className="planet-scene-bot-unlock-animation" />
    //     )}
    //     {showUpgradeAnimation && (
    //       <div className="planet-scene-bot-upgrade-animation" />
    //     )}
    //     <div className="planet-scene-menu-program-container">
    //       {selectedCreaturePrograms.map((program, index) => (
    //         <MainMenuProgram
    //           key={index}
    //           order={index}
    //           program={program}
    //           showContainerAnimation={isSelectingUIState}
    //           showProgramAnimation={
    //             !selectedCreature.isStarting &&
    //             !isSelectingUIState &&
    //             !isLoading &&
    //             uIState.type != UIStateType.UnlockPopup &&
    //             uIState.type != UIStateType.PlayUnlockAnimation &&
    //             currentProgramInfo.index == index &&
    //             !selectedCreature.isProgramStop
    //           }
    //         />
    //       ))}
    //     </div>
    //     <MainMenuWarning />
    //     {showConfirmButton && (
    //       <CreatureConfirmButton
    //         isDisabled={!enableConfirmButton}
    //         onClick={onClickConfirmReboot}
    //       />
    //     )}
    //     {showUnlockButton && (
    //       <CreatureUnlockButton
    //         isDisabled={!enableUnlockButton}
    //         onClick={() => onClickUnlock()}
    //       />
    //     )}
    //     {showRebootButton && (
    //       <CreatureRebootButton onClick={() => onClickReboot()} />
    //     )}
    //     {!isNotSelectingCreature && !isSelectingMarket && (
    //       <div className="planet-scene-redeem">
    //         <RedeemButton onClick={onClickRedeem} />
    //       </div>
    //     )}
    //   </div>
    // </div>
    <>
      <Rocket />
      <div
        className="planet-scene-container"
        style={{ width: containerWidth, height: containerHeight }}
      >
        <div className="planet-scene-canvas-container">
          <canvas id="canvas" onClick={onClickCanvas}></canvas>
        </div>
        {showNewCreatureButton && (
          <div
            className="planet-scene-program-new-creature-button"
            style={{
              left: `${newCreaturePositions[backgroundIndexRef.current].x}%`,
              top: `${newCreaturePositions[backgroundIndexRef.current].y}%`,
            }}
          >
            <CreatureNewButton
              isDisabled={isLoading}
              onClick={onClickNewCreature}
            />
          </div>
        )}

        {!isNotSelectingCreature && (
          <>
            <div className="planet-scene-program-container">
              {showConfirmCreateButton && (
                <div className="planet-scene-program-action-button">
                  <CreatureConfirmButton
                    isDisabled={!enableConfirmButton}
                    onClick={onClickUnlock}
                  />
                </div>
              )}
              {showConfirmRebootButton && (
                <div className="planet-scene-program-action-button">
                  <CreatureConfirmButton
                    isDisabled={!enableConfirmButton}
                    onClick={onClickConfirmReboot}
                  />
                </div>
              )}
              {showRebootButton && (
                <div className="planet-scene-program-action-button">
                  <CreatureRebootButton
                    isDisabled={isLoading}
                    onClick={onClickReboot}
                  />
                </div>
              )}
              {selectedCreaturePrograms.map((program, index) => (
                <MainMenuProgram
                  key={index}
                  order={index}
                  isSelecting={index == currentProgramInfo.index}
                  program={program}
                  showContainerAnimation={isSelectingUIState}
                  showProgramAnimation={
                    !selectedCreature.isStarting &&
                    !isSelectingUIState &&
                    !isLoading &&
                    uIState.type != UIStateType.UnlockPopup &&
                    uIState.type != UIStateType.PlayUnlockAnimation &&
                    currentProgramInfo.index == index &&
                    !selectedCreature.isProgramStop
                  }
                />
              ))}
              {currentProgramInfo.index != null && (
                <div
                  className="planet-scene-program-selecting-frame"
                  style={{ left: `${5.5 + 10.85 * currentProgramInfo.index}%` }}
                ></div>
              )}
            </div>
            <div className="planet-scene-creature-info">
              <Creature
                isLocked={false}
                creature={selectedCreature}
                progress={currentProgramInfo.progress}
              />
            </div>
            <div className="planet-scene-prev-creature-button">
              <PrevPageButton
                isDisabled={false}
                onClick={() => onChangeSelectedCreature(-1)}
              />
            </div>
            <div className="planet-scene-next-creature-button">
              <NextPageButton
                isDisabled={false}
                onClick={() => onChangeSelectedCreature(1)}
              />
            </div>
          </>
        )}
        <div className="planet-scene-planet-button-container">
          <div className="planet-scene-planet-1-button">
            <Planet1Button
              isDisabled={backgroundIndexRef.current == 0}
              onClick={() => (backgroundIndexRef.current = 0)}
            />
          </div>
          <div className="planet-scene-planet-2-button">
            <Planet2Button
              isDisabled={backgroundIndexRef.current == 1}
              onClick={() => (backgroundIndexRef.current = 1)}
            />
          </div>
          <div className="planet-scene-planet-3-button">
            <Planet3Button
              isDisabled={backgroundIndexRef.current == 2}
              onClick={() => (backgroundIndexRef.current = 2)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanetScene;
