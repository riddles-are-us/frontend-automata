import "./Gameplay.css";
import React, { useEffect, useState, useRef } from "react";
import { SERVER_TICK_TO_SECOND } from "../request";
import TopMenu from "./TopMenu";
import LeftMenu from "./LeftMenu";
import MainMenu from "./MainMenu";
import {
  UIState,
  UIStateType,
  selectHasRocket,
  selectLastRedeemEnergy,
  selectRedeemEnergyCooldown,
  selectUIState,
  setHasRocket,
} from "../../data/properties";
import { selectGlobalTimer } from "../../data/properties";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import ResourceAnimations from "./ResourceAnimations";
import Popups from "./Popups";
import NewProgramAnimation from "./NewProgramAnimation";

const Gameplay = () => {
  const dispatch = useAppDispatch();
  const uIState = useAppSelector(selectUIState);
  const hasRocket = useAppSelector(selectHasRocket);
  const lastRedeemEnergy = useAppSelector(selectLastRedeemEnergy);
  const redeemEnergyCooldown = useAppSelector(selectRedeemEnergyCooldown);

  //#region LocalTime
  const globalTimer = useAppSelector(selectGlobalTimer);
  const [globalTimerCache, setGlobalTimerCache] = useState(globalTimer);
  const [localTimer, setLocalTimer] = useState(globalTimer);
  const [visibilityChange, setVisibilityChange] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const elapsedTimeMultiplierRef = useRef<number>(1);
  const lastLocalTimerRef = useRef<number>(globalTimer);

  const resetStartTimeRef = () => {
    startTimeRef.current = 0;
    lastLocalTimerRef.current =
      Math.abs(globalTimerCache - SERVER_TICK_TO_SECOND - localTimer) >
      SERVER_TICK_TO_SECOND
        ? globalTimerCache - SERVER_TICK_TO_SECOND
        : localTimer;
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      setVisibilityChange(true);
    }
  };

  useEffect(() => {
    const updateProgress = (timestamp: DOMHighResTimeStamp) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
      }

      setLocalTimer(
        lastLocalTimerRef.current +
          ((timestamp - startTimeRef.current) / 1000) *
            elapsedTimeMultiplierRef.current
      );
      animationFrameIdRef.current = requestAnimationFrame(updateProgress);
    };

    resetStartTimeRef();
    elapsedTimeMultiplierRef.current = Math.max(
      Math.min(
        (globalTimerCache - lastLocalTimerRef.current) / SERVER_TICK_TO_SECOND,
        1.2
      ),
      0.8
    );

    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(updateProgress);

    setVisibilityChange(false);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resetStartTimeRef();
    };
  }, [uIState, globalTimerCache, visibilityChange]);

  useEffect(() => {
    setGlobalTimerCache(globalTimer);
    if (
      globalTimer / SERVER_TICK_TO_SECOND - lastRedeemEnergy >=
        redeemEnergyCooldown &&
      !hasRocket &&
      uIState.type != UIStateType.RocketPopup
    ) {
      dispatch(setHasRocket({ hasRocket: true }));
    }
  }, [globalTimer]);
  //#endregion

  return (
    <>
      <ResourceAnimations localTimer={localTimer} />
      <NewProgramAnimation />
      {/* <div className="top-container"> */}
      <TopMenu />
      {/* </div> */}
      <div className="middle-container">
        <LeftMenu />
        <MainMenu localTimer={localTimer} />
      </div>
      <Popups />
    </>
  );
};

export default Gameplay;
