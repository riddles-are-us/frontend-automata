import { useEffect, useRef, useState } from "react";
import { selectNonce } from "../../../data/properties";
import {
  LoadingType,
  pushError,
  selectIsLoading,
  setLoadingType,
} from "../../../data/errors";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./MarketScene.css";
import PageSelector from "../PageSelector";
import Grid from "../Grid";
import MarketProgram from "../MarketProgram";
import { selectAllPrograms } from "../../../data/programs";
import { getSellingAsync, getAuctionAsync, getLotAsync } from "../../express";
import { useWalletContext } from "zkwasm-minirollup-browser";
import { bnToHexLe } from "delphinus-curves/src/altjubjub";
import { LeHexBN } from "zkwasm-minirollup-rpc";
import { selectInstalledProgramIds } from "../../../data/creatures";
import {
  addAuctionTab,
  addLotTab,
  addSellingTab,
  resetAuctionTab,
  resetLotTab,
  resetSellingTab,
  selectAuctionTab,
  selectInventoryTab,
  selectIsInventoryChanged,
  selectLotTab,
  selectMarketForceUpdate,
  selectSellingTab,
  selectTabState,
  setInventoryTab,
  setMarketForceUpdate,
  setTabState,
  MarketTabState,
  setInventoryChanged,
} from "../../../data/market";
import BidAmountPopup from "./BidAmountPopup";
import ListAmountPopup from "./ListAmountPopup";
import { ProgramModel, ResourceType } from "../../../data/models";
import { queryState, sendTransaction } from "zkwasm-minirollup-browser";
import {
  getBidCardTransactionCommandArray,
  getListCardTransactionCommandArray,
  getSellCardTransactionCommandArray,
} from "../../rpc";
import { selectResource } from "../../../data/resources";
import MarketTabButton from "../../script/button/MarketTabButton";
import MarketRefreshButton from "../../script/button/MarketRefreshButton";

const ELEMENT_PER_REQUEST = 30;

interface Props {
  mainContainerRef: React.RefObject<HTMLDivElement>;
}

const MarketScene = ({ mainContainerRef }: Props) => {
  const dispatch = useAppDispatch();
  const { l2Account } = useWalletContext();
  const nonce = useAppSelector(selectNonce);
  const titaniumCount = useAppSelector(selectResource(ResourceType.Titanium));
  const isLoading = useAppSelector(selectIsLoading);

  const pids = l2Account?.pubkey
    ? new LeHexBN(bnToHexLe(l2Account?.pubkey)).toU64Array()
    : ["", "", "", ""];

  const gridContainerRef = useRef<HTMLParagraphElement>(null);
  const elementRatio = 297 / 205;
  const columnCount = 4;
  const [rowCount, setRowCount] = useState<number>(0);
  const [elementWidth, setElementWidth] = useState<number>(0);
  const [elementHeight, setElementHeight] = useState<number>(0);

  const tabState = useAppSelector(selectTabState);
  const [page, setPage] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const pageSize = rowCount * columnCount;

  const isInventoryChanged = useAppSelector(selectIsInventoryChanged);
  const inventoryNuggetTab = useAppSelector(selectInventoryTab);
  const sellingNuggetTab = useAppSelector(selectSellingTab);
  const auctionNuggetTab = useAppSelector(selectAuctionTab);
  const lotNuggetTab = useAppSelector(selectLotTab);
  const nuggetsForceUpdate = useAppSelector(selectMarketForceUpdate);
  const [elements, setElements] = useState<JSX.Element[]>([]);

  const programs = useAppSelector(selectAllPrograms);
  const installedProgramIds = useAppSelector(selectInstalledProgramIds);
  const [showBidAmountPopup, setShowBidAmountPopup] = useState<boolean>(false);
  const [showListAmountPopup, setShowListAmountPopup] =
    useState<boolean>(false);
  const [maxBidAmount, setMaxBidAmount] = useState<number>(0);
  const [minBidAmount, setMinBidAmount] = useState<number>(0);
  const [currentPopupProgram, setCurrentPopupProgram] =
    useState<ProgramModel>();

  const containerRatio = 5 / 3.5;
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const adjustSize = () => {
    if (gridContainerRef.current) {
      const programGridElementWidth =
        gridContainerRef.current.offsetWidth / columnCount;
      const programElementHeight = programGridElementWidth / elementRatio;
      setElementWidth(programGridElementWidth);
      setElementHeight(programElementHeight);
      setRowCount(
        Math.floor(gridContainerRef.current.offsetHeight / programElementHeight)
      );
    }

    if (mainContainerRef.current) {
      const height = Math.min(
        mainContainerRef.current.offsetHeight,
        mainContainerRef.current.offsetWidth / containerRatio
      );
      setContainerHeight(height * 0.88);
      setContainerWidth(height * 0.88 * containerRatio);
    }
  };

  useEffect(() => {
    adjustSize();

    window.addEventListener("resize", adjustSize);
    return () => {
      window.removeEventListener("resize", adjustSize);
    };
  }, [gridContainerRef.current, gridContainerRef.current?.offsetWidth]);

  useEffect(() => {
    checkTabData();
  }, [page]);

  useEffect(() => {
    setPage(0);
    if (page == 0) {
      checkTabData();
    }
  }, [tabState]);

  useEffect(() => {
    setPage(0);
    reloadTabData();
  }, [pageSize]);

  useEffect(() => {
    if (nuggetsForceUpdate) {
      dispatch(setMarketForceUpdate(false));
      checkTabData();
    }
  }, [nuggetsForceUpdate]);

  const checkTabData = async () => {
    if (isLoading) {
      return;
    }

    console.log("check elements update");

    if (needUpdateTabData()) {
      await updateTabData();
      dispatch(setMarketForceUpdate(true));
    } else {
      console.log("update elements");
      updateElements();
    }
  };

  const updateElements = () => {
    if (tabState == MarketTabState.Inventory) {
      setElements(
        inventoryNuggetTab.programs
          .slice(page * pageSize, (page + 1) * pageSize)
          .map((program, index) => (
            <MarketProgram
              key={index}
              isInstalled={installedProgramIds.includes(program.index)}
              program={program}
              onClickList={() => onClickList(program)}
            />
          ))
      );
      setTotalPage(
        Math.max(Math.ceil(inventoryNuggetTab.programCount / pageSize), 1)
      );
    } else if (tabState == MarketTabState.Selling) {
      setElements(
        sellingNuggetTab.programs
          .slice(page * pageSize, (page + 1) * pageSize)
          .map((program, index) => (
            <MarketProgram
              key={index}
              isInstalled={installedProgramIds.includes(program.index)}
              program={program}
              onClickSell={() => onClickSell(program)}
            />
          ))
      );
      setTotalPage(
        Math.max(Math.ceil(sellingNuggetTab.programCount / pageSize), 1)
      );
    } else if (tabState == MarketTabState.Auction) {
      setElements(
        auctionNuggetTab.programs
          .slice(page * pageSize, (page + 1) * pageSize)
          .map((program, index) => (
            <MarketProgram
              key={index}
              isInstalled={installedProgramIds.includes(program.index)}
              program={program}
              onClickBid={() => onClickBid(program)}
            />
          ))
      );
      setTotalPage(
        Math.max(Math.ceil(auctionNuggetTab.programCount / pageSize), 1)
      );
    } else if (tabState == MarketTabState.Lot) {
      setElements(
        lotNuggetTab.programs
          .slice(page * pageSize, (page + 1) * pageSize)
          .map((program, index) => (
            <MarketProgram
              key={index}
              isInstalled={installedProgramIds.includes(program.index)}
              program={program}
              onClickBid={() => onClickBid(program)}
            />
          ))
      );
      setTotalPage(
        Math.max(Math.ceil(lotNuggetTab.programCount / pageSize), 1)
      );
    }
  };

  const needUpdateTabData = () => {
    if (tabState == MarketTabState.Inventory) {
      return inventoryNuggetTab.programCount == -1 || isInventoryChanged;
    } else if (tabState == MarketTabState.Selling) {
      return (
        sellingNuggetTab.programCount == -1 ||
        (sellingNuggetTab.programCount > sellingNuggetTab.programs.length &&
          (page + 1) * pageSize >= sellingNuggetTab.programs.length)
      );
    } else if (tabState == MarketTabState.Auction) {
      return (
        auctionNuggetTab.programCount == -1 ||
        (auctionNuggetTab.programCount > auctionNuggetTab.programs.length &&
          (page + 1) * pageSize >= auctionNuggetTab.programs.length)
      );
    } else if (tabState == MarketTabState.Lot) {
      return (
        lotNuggetTab.programCount == -1 ||
        (lotNuggetTab.programCount > lotNuggetTab.programs.length &&
          (page + 1) * pageSize >= lotNuggetTab.programs.length)
      );
    }
    return false;
  };

  const updateTabData = async () => {
    dispatch(setLoadingType(LoadingType.Default));

    if (tabState == MarketTabState.Inventory) {
      await updateInventoryPage();
    } else if (tabState == MarketTabState.Selling) {
      await addSellingPage(
        sellingNuggetTab.programs.length,
        ELEMENT_PER_REQUEST
      );
    } else if (tabState == MarketTabState.Auction) {
      await addAuctionPage(
        auctionNuggetTab.programs.length,
        ELEMENT_PER_REQUEST
      );
    } else if (tabState == MarketTabState.Lot) {
      await addLotPage(lotNuggetTab.programs.length, ELEMENT_PER_REQUEST);
    }
    dispatch(setLoadingType(LoadingType.None));
  };

  const reloadTabData = async () => {
    if (tabState == MarketTabState.Inventory) {
      dispatch(setInventoryChanged());
    } else if (tabState == MarketTabState.Selling) {
      dispatch(resetSellingTab());
    } else if (tabState == MarketTabState.Auction) {
      dispatch(resetAuctionTab());
    } else if (tabState == MarketTabState.Lot) {
      dispatch(resetLotTab());
    }

    //ensure the page is only reload once
    if (page == 0) {
      dispatch(setMarketForceUpdate(true));
    } else {
      setPage(0);
    }
  };

  const updateInventoryPage = async () => {
    const inventoryPrograms = programs.filter(
      (program: any) => program.marketId == 0
    );
    dispatch(
      setInventoryTab({
        programs: inventoryPrograms,
        programCount: inventoryPrograms.length,
      })
    );
  };

  const addSellingPage = async (skip: number, limit: number) => {
    const sellingMarketTabData = await getSellingAsync(
      skip,
      limit,
      pids[1].toString(),
      pids[2].toString()
    );
    dispatch(
      addSellingTab({
        programs: sellingMarketTabData.programs,
        programCount: sellingMarketTabData.programCount,
      })
    );
  };

  const addAuctionPage = async (skip: number, limit: number) => {
    const auctionMarketTabData = await getAuctionAsync(skip, limit);
    dispatch(
      addAuctionTab({
        programs: auctionMarketTabData.programs,
        programCount: auctionMarketTabData.programCount,
      })
    );
  };

  const addLotPage = async (skip: number, limit: number) => {
    const lotMarketTabData = await getLotAsync(
      skip,
      limit,
      pids[1].toString(),
      pids[2].toString()
    );
    dispatch(
      addLotTab({
        programs: lotMarketTabData.programs,
        programCount: lotMarketTabData.programCount,
      })
    );
  };

  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  const onClickPrevPageButton = () => {
    setPage(page - 1);
  };

  const onClickNextPageButton = () => {
    setPage(page + 1);
  };

  const onClickInventoryTab = () => {
    dispatch(setTabState(MarketTabState.Inventory));
  };
  const onClickSellingTab = () => {
    dispatch(setTabState(MarketTabState.Selling));
  };
  const onClickAuctionTab = () => {
    dispatch(setTabState(MarketTabState.Auction));
  };
  const onClickLotTab = () => {
    dispatch(setTabState(MarketTabState.Lot));
  };

  const sendSellCmd = (program: ProgramModel) => {
    if (!isLoading) {
      dispatch(setLoadingType(LoadingType.Default));
      const index = programs.findIndex((p: any) => p.index == program.index);
      dispatch(
        sendTransaction({
          cmd: getSellCardTransactionCommandArray(nonce, index),
          prikey: l2Account!.getPrivateKey(),
        })
      ).then((action) => {
        if (sendTransaction.fulfilled.match(action)) {
          dispatch(queryState(l2Account.getPrivateKey())).then((action) => {
            if (queryState.fulfilled.match(action)) {
              dispatch(setInventoryChanged());
              dispatch(resetSellingTab());
              dispatch(resetAuctionTab());
              dispatch(setMarketForceUpdate(true));
              dispatch(setLoadingType(LoadingType.None));
            }
          });
        } else if (sendTransaction.rejected.match(action)) {
          const message = "sell program Error: " + action.payload;
          dispatch(pushError(message));
          console.error(message);
          dispatch(setLoadingType(LoadingType.None));
        }
      });
    }
  };

  const onClickSell = (program: ProgramModel) => {
    sendSellCmd(program);
  };

  const onConfirmBidAmount = (amount: number, program: ProgramModel) => {
    setShowBidAmountPopup(false);
    if (!isLoading) {
      dispatch(setLoadingType(LoadingType.Default));
      dispatch(
        sendTransaction({
          cmd: getBidCardTransactionCommandArray(
            nonce,
            program.marketId,
            amount
          ),
          prikey: l2Account!.getPrivateKey(),
        })
      ).then((action) => {
        if (sendTransaction.fulfilled.match(action)) {
          dispatch(queryState(l2Account.getPrivateKey())).then(
            async (action) => {
              if (queryState.fulfilled.match(action)) {
                dispatch(setInventoryChanged());
                dispatch(resetAuctionTab());
                dispatch(resetLotTab());
                dispatch(setMarketForceUpdate(true));
                dispatch(setLoadingType(LoadingType.None));
              }
            }
          );
        } else if (sendTransaction.rejected.match(action)) {
          const message = "bid program Error: " + action.payload;
          dispatch(pushError(message));
          console.error(message);
          dispatch(setInventoryChanged());
          dispatch(resetAuctionTab());
          dispatch(resetLotTab());
          dispatch(setMarketForceUpdate(true));
          dispatch(setLoadingType(LoadingType.None));
        }
      });
    }
  };

  const onCancelBid = () => {
    setShowBidAmountPopup(false);
  };

  const onClickBid = (program: ProgramModel) => {
    setCurrentPopupProgram(program);
    setMaxBidAmount(Math.min(titaniumCount, program.askPrice));
    setMinBidAmount(program.bid?.bidprice ?? 0);
    setShowBidAmountPopup(true);
  };

  const onConfirmListAmount = (amount: number, program: ProgramModel) => {
    setShowListAmountPopup(false);
    if (!isLoading) {
      dispatch(setLoadingType(LoadingType.Default));
      const index = programs.findIndex((p: any) => p.index == program.index);
      dispatch(
        sendTransaction({
          cmd: getListCardTransactionCommandArray(nonce, index, amount),
          prikey: l2Account!.getPrivateKey(),
        })
      ).then((action) => {
        if (sendTransaction.fulfilled.match(action)) {
          dispatch(queryState(l2Account.getPrivateKey())).then(
            async (action) => {
              if (queryState.fulfilled.match(action)) {
                dispatch(resetSellingTab());
                dispatch(setInventoryChanged());
                dispatch(setMarketForceUpdate(true));
                dispatch(setLoadingType(LoadingType.None));
              }
            }
          );
        } else if (sendTransaction.rejected.match(action)) {
          const message = "list program Error: " + action.payload;
          dispatch(pushError(message));
          console.error(message);
          dispatch(resetSellingTab());
          dispatch(setInventoryChanged());
          dispatch(setMarketForceUpdate(true));
          dispatch(setLoadingType(LoadingType.None));
        }
      });
    }
  };

  const onCancelList = () => {
    setShowListAmountPopup(false);
  };

  const onClickList = (program: ProgramModel) => {
    setCurrentPopupProgram(program);
    setShowListAmountPopup(true);
  };

  return (
    <>
      <div className="market-scene-container">
        <div
          className="market-scene-main-container"
          style={{ width: containerWidth, height: containerHeight }}
        >
          <div className="market-scene-main-tab-container">
            <div className="market-scene-tab-button">
              <MarketTabButton
                id={0}
                text={"Inventory"}
                onClick={onClickInventoryTab}
                isDisabled={tabState == MarketTabState.Inventory}
                fontSizeRatio={0.7}
              />
            </div>
            <div className="market-scene-tab-button">
              <MarketTabButton
                id={1}
                text={"Selling"}
                onClick={onClickSellingTab}
                isDisabled={tabState == MarketTabState.Selling}
                fontSizeRatio={0.7}
              />
            </div>
            <div className="market-scene-tab-button">
              <MarketTabButton
                id={2}
                text={"Auction"}
                onClick={onClickAuctionTab}
                isDisabled={tabState == MarketTabState.Auction}
                fontSizeRatio={0.7}
              />
            </div>
            <div className="market-scene-tab-button">
              <MarketTabButton
                id={3}
                text={"Lot"}
                onClick={onClickLotTab}
                isDisabled={tabState == MarketTabState.Lot}
                fontSizeRatio={0.7}
              />
            </div>
          </div>
          <div
            ref={gridContainerRef}
            className="market-scene-main-grid-container"
          >
            <Grid
              elementWidth={elementWidth}
              elementHeight={elementHeight}
              columnCount={columnCount}
              rowCount={rowCount}
              elements={elements}
            />
          </div>
          <div className="market-scene-reload-button">
            <MarketRefreshButton onClick={reloadTabData} isDisabled={false} />
          </div>
          <div className="market-scene-page-selector-container">
            <PageSelector
              currentPage={page}
              pageCount={totalPage}
              isHorizontal={true}
              onClickPrevPageButton={onClickPrevPageButton}
              onClickNextPageButton={onClickNextPageButton}
            />
          </div>
        </div>
      </div>
      {showListAmountPopup && (
        <ListAmountPopup
          program={currentPopupProgram!}
          onConfirmListAmount={onConfirmListAmount}
          onCancelList={onCancelList}
        />
      )}
      {showBidAmountPopup && (
        <BidAmountPopup
          minBidAmount={minBidAmount}
          maxBidAmount={maxBidAmount}
          program={currentPopupProgram!}
          onConfirmBidAmount={onConfirmBidAmount}
          onCancelBid={onCancelBid}
        />
      )}
    </>
  );
};

export default MarketScene;
