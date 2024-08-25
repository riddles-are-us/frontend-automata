import React, { useState, useEffect, useRef } from "react";
import { selectL2Account } from "../../data/accountSlice";
import { createCommand } from "./helper";
import { useAppSelector, useAppDispatch } from "../../app/hooks";

import { selectL1Account, loginL2AccountAsync } from "../../data/accountSlice";
import Gameplay from "./components/Gameplay";
import WelcomePage from "./components/WelcomePage";

import { getConfig, sendTransaction, queryState } from "./request";
import {
  UIState,
  selectUIState,
  setUIState,
} from "../../data/automata/properties";

// clag
const CMD_INSTALL_PLAYER = 1n;

export function GameController() {
  const dispatch = useAppDispatch();
  const uIState = useAppSelector(selectUIState);

  const [inc, setInc] = useState(0);
  const l2account = useAppSelector(selectL2Account);

  function createPlayer() {
    try {
      const insPlayerCmd = createCommand(CMD_INSTALL_PLAYER, 0n);
      dispatch(
        sendTransaction({
          cmd: [insPlayerCmd, 0n, 0n, 0n],
          prikey: l2account!.address,
        })
      );
    } catch (e) {
      console.log("Error at create player " + e);
    }
  }

  function updateState() {
    if (uIState >= UIState.Idle) {
      dispatch(queryState({ cmd: [], prikey: l2account!.address }));
    }
    setInc(inc + 1);
  }

  function loginProcess() {
    if (uIState == UIState.QueryConfig) {
      dispatch(getConfig());
    } else if (uIState == UIState.QueryState) {
      dispatch(queryState({ cmd: [], prikey: l2account!.address }));
    } else if (uIState == UIState.CreatePlayer) {
      createPlayer();
    }
  }

  useEffect(() => {
    if (l2account && uIState == UIState.Init) {
      const requireContext = require.context(
        "./images",
        true,
        /\.(png|jpg|jpeg|gif)$/
      );
      const urls = requireContext.keys().map(requireContext) as string[];
      preloadImages(urls, () => {
        dispatch(setUIState({ uIState: UIState.QueryConfig }));
        setMessage("Syncing data from server...");
      });
    }
  }, [l2account]);

  useEffect(() => {
    loginProcess();
  }, [uIState]);

  useEffect(() => {
    setTimeout(() => {
      updateState();
    }, 1000);
  }, [inc]);

  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const preloadImages = (urls: string[], onReady: () => void) => {
    let loadedCount = 0;
    console.log(urls);
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;

      img.onload = () => {
        loadedCount++;
        setProgress(Math.ceil((loadedCount / urls.length) * 8000) / 100);
        setMessage(`Loading images (${loadedCount}/${urls.length})`);
        if (loadedCount === urls.length) {
          onReady();
        }
      };

      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        loadedCount++;
        if (loadedCount === urls.length) {
          onReady();
        }
      };
    });
  };

  const account = useAppSelector(selectL1Account);

  if (l2account && uIState >= UIState.Idle) {
    return <Gameplay />;
  } else {
    return (
      <>
        <WelcomePage
          progress={progress}
          message={message}
          onClick={() => dispatch(loginL2AccountAsync(account!))}
        />
      </>
    );
  }
}
