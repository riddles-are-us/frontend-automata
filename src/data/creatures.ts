import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { queryState, SERVER_TICK_TO_SECOND } from "../game/request";
import {
  CreatureModel,
  getAttributes,
  emptyAttributes,
  emptyCreature,
  getCreatingCreature,
  ProgramInfo,
  AttributeType,
  resourceTypes,
  ResourceAmountPair,
  ProgramType,
} from "./models";
import { selectProgramByIndex, selectProgramsByIndexes } from "./programs";

interface CreatureRaw {
  attributes: Array<number>;
  cards: Array<number>;
  modifier_info: string;
}

export function formatTime(seconds: number) {
  if (seconds <= 0) {
    return "";
  }

  // 确保秒数是整数 (Ensure seconds is an integer)
  seconds = Math.ceil(seconds);

  const pad = (num: number) => String(Math.floor(num)).padStart(2, "0");
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

/**
 * 将原始生物数据转换为生物模型对象
 * Converts raw creature data from the server into a CreatureModel object
 *
 * @param raw - 原始生物数据 (Raw creature data)
 * @param index - 生物索引 (Creature index)
 * @param globalTimer - 全局计时器 (Global timer)
 * @param rawcards - 原始卡片数据数组 (Raw cards data array)
 * @returns 转换后的生物模型 (Converted creature model)
 */
function rawToModel(
  raw: CreatureRaw,
  index: number,
  globalTimer: number,
  rawcards: any[]
): CreatureModel {
  const binary = BigInt(raw.modifier_info).toString(2).padStart(64, "0");
  const currentProgramIndex = parseInt(binary.slice(8, 16), 2);
  const isProgramStop = parseInt(binary.slice(0, 8), 2) == 1;
  const startTick = parseInt(binary.slice(16), 2);
  const startTime = startTick * SERVER_TICK_TO_SECOND;

  // 计算循环时间 (Calculate cycle time)
  let cycleTime = 0;
  if (rawcards && raw.cards) {
    for (let i = 0; i < raw.cards.length; i++) {
      const cardIndex = raw.cards[i];
      if (cardIndex !== null && cardIndex !== undefined) {
        const card = rawcards[cardIndex];
        if (card && card.duration) {
          cycleTime += card.duration * SERVER_TICK_TO_SECOND;
        }
      }
    }
  }

  return {
    attributes: getAttributes(raw.attributes),
    name: `Bot ${index + 1}`,
    creatureType: index,
    isLocked: false,
    programIndexes: raw.cards,
    currentProgramIndex: currentProgramIndex,
    isProgramStop: isProgramStop,
    startTime: startTime,
    isStarting: globalTimer == startTime,
    cycleTime: cycleTime,
  };
}

/**
 * 创建一个可解锁的生物模型
 * Creates an unlockable creature model
 *
 * @param creatureType - 生物类型 (Creature type)
 * @returns 可解锁的生物模型 (Unlockable creature model)
 */
function getUnlockableCreature(creatureType: number): CreatureModel {
  return {
    attributes: emptyAttributes,
    name: "New",
    isLocked: true,
    creatureType: creatureType,
    programIndexes: [null, null, null, null, null, null, null, null],
    currentProgramIndex: 0,
    isProgramStop: false,
    startTime: 0,
    isStarting: false,
    cycleTime: 0,
  };
}

/**
 * 创建一个锁定状态的生物模型
 * Creates a locked creature model
 *
 * @param creatureType - 生物类型 (Creature type)
 * @returns 锁定状态的生物模型 (Locked creature model)
 */
function createLockedCreature(creatureType: number): CreatureModel {
  return {
    attributes: emptyAttributes,
    name: "Locked",
    isLocked: true,
    creatureType: creatureType,
    programIndexes: [null, null, null, null, null, null, null, null],
    currentProgramIndex: 0,
    isProgramStop: false,
    startTime: 0,
    isStarting: false,
    cycleTime: 0,
  };
}

const NOT_SELECTING_CREATURE = "NotSelecting";
interface CreaturesState {
  selectedCreatureIndex: number | typeof NOT_SELECTING_CREATURE;
  creatures: CreatureModel[];
  creatingCreature: CreatureModel;
  rebootCreature: CreatureModel | null;
  selectingProgramIndex: number;
  currentPage: number;
}

const initialState: CreaturesState = {
  selectedCreatureIndex: NOT_SELECTING_CREATURE,
  creatures: [],
  creatingCreature: emptyCreature,
  rebootCreature: null,
  selectingProgramIndex: 0,
  currentPage: 0,
};

export const creaturesSlice = createSlice({
  name: "creatures",
  initialState,
  reducers: {
    changeSelectedCreature: (state, action) => {
      if (state.selectedCreatureIndex == NOT_SELECTING_CREATURE) {
        return;
      }

      if (state.creatures.length > 0) {
        state.selectedCreatureIndex =
          (state.selectedCreatureIndex +
            action.payload.diff +
            state.creatures.length) %
          state.creatures.length;
      }
    },
    setSelectedCreature: (state, action) => {
      state.selectedCreatureIndex =
        action.payload.index == -1
          ? NOT_SELECTING_CREATURE
          : action.payload.index;
    },
    startCreatingCreature: (state, action) => {
      state.selectedCreatureIndex = state.creatures.length;
      state.creatingCreature = getCreatingCreature(state.creatures.length);
      state.selectingProgramIndex = 0;
    },
    startRebootCreature: (state, action) => {
      if (state.selectedCreatureIndex != NOT_SELECTING_CREATURE) {
        state.rebootCreature = state.creatures[state.selectedCreatureIndex];
        state.selectingProgramIndex = 0;
      }
    },
    clearRebootCreature: (state, action) => {
      state.rebootCreature = null;
    },
    setProgramIndex: (state, action) => {
      if (state.selectedCreatureIndex != NOT_SELECTING_CREATURE) {
        const selectedCreature =
          state.selectedCreatureIndex === state.creatures.length
            ? state.creatingCreature
            : state.rebootCreature;

        selectedCreature!.programIndexes[state.selectingProgramIndex] =
          action.payload.programIndex;
        state.selectingProgramIndex = (state.selectingProgramIndex + 1) % 8;
      }
    },
    setSelectingProgramIndex: (state, action) => {
      state.selectingProgramIndex = action.payload.selectingIndex;
    },
    nextPage: (state, action) => {
      state.currentPage += 1;
    },
    prevPage: (state, action) => {
      state.currentPage = Math.max(0, state.currentPage - 1);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(queryState.fulfilled, (state, action) => {
      if (action.payload.player) {
        const creatures = action.payload.player.data.objects as CreatureRaw[];
        const globalTimer =
          action.payload.state.counter * SERVER_TICK_TO_SECOND;
        const rawcards = action.payload.player.data.cards as any[];
        state.creatures = creatures.map((creature, index) =>
          rawToModel(creature, index, globalTimer, rawcards)
        );
      }
    });
  },
});

export const selectCreaturesOnCurrentPage =
  (creatures: CreatureModel[]) =>
  (amountPerPage: number) =>
  (state: RootState) => {
    const startIndex = state.creatures.currentPage * amountPerPage;
    const endIndex = startIndex + amountPerPage;
    return creatures.slice(startIndex, endIndex);
  };

export const selectIsNotSelectingCreature = (state: RootState) =>
  state.creatures.selectedCreatureIndex == NOT_SELECTING_CREATURE;
export const selectIsSelectingCreatingCreature = (state: RootState) =>
  state.creatures.selectedCreatureIndex == state.creatures.creatures.length;
export const selectSelectedCreatureIndex = (state: RootState) =>
  state.creatures.selectedCreatureIndex;
export const selectSelectedCreatureListIndex = (state: RootState) =>
  state.creatures.selectedCreatureIndex === NOT_SELECTING_CREATURE
    ? -1
    : state.creatures.selectedCreatureIndex;
export const selectCreaturesCount = (state: RootState) =>
  state.creatures.creatures.length;
export const selectSelectedCreature = (state: RootState) =>
  state.creatures.selectedCreatureIndex === NOT_SELECTING_CREATURE
    ? emptyCreature
    : state.creatures.selectedCreatureIndex === state.creatures.creatures.length
    ? state.creatures.creatingCreature
    : state.creatures.rebootCreature != null
    ? state.creatures.rebootCreature
    : state.creatures.creatures[state.creatures.selectedCreatureIndex];

export const selectSelectedAttributes =
  (type: AttributeType) => (state: RootState) =>
    selectSelectedCreature(state).attributes.find(
      (attribute: any) => attribute.type == type
    )?.amount ?? 0;

export const selectSelectedCreaturePrograms = (state: RootState) =>
  selectProgramsByIndexes(selectSelectedCreature(state).programIndexes)(state);

export const selectCurrentCreatureTypes = (state: RootState) =>
  state.creatures.creatures.map(
    (creature: CreatureModel) => creature.creatureType
  );

/**
 * 根据生物的Productivity和Efficiency属性调整资源数量
 * Adjusts resource amount based on creature's Productivity and Efficiency attributes
 *
 * @param resource - 原始资源对象 (Original resource object)
 * @param productivityValue - 生物的Productivity属性值 (Creature's Productivity attribute value)
 * @param efficiencyValue - 生物的Efficiency属性值 (Creature's Efficiency attribute value)
 * @returns 调整后的资源对象 (Adjusted resource object)
 */
export function adjustResourceByProductivity(
  resource: ResourceAmountPair,
  productivityValue: number,
  efficiencyValue = 0
): ResourceAmountPair {
  // 如果资源数量为0，不进行调整 (If resource amount is 0, don't adjust)
  if (resource.amount === 0) {
    return resource;
  }

  // 如果资源数量为正数，并且Productivity大于0，增加资源数量
  // If resource amount is positive and Productivity > 0, increase resource amount
  if (resource.amount > 0 && productivityValue > 0) {
    return {
      type: resource.type,
      amount: Math.floor(resource.amount + Math.log2(productivityValue + 1)),
    };
  }

  // 如果资源数量为负数，并且Efficiency大于0，减少资源消耗（但不能变为正数）
  // If resource amount is negative and Efficiency > 0, reduce resource consumption (but can't become positive)
  if (resource.amount < 0 && efficiencyValue > 0) {
    // 计算减少后的消耗量，但确保结果仍为负数或0
    // Calculate reduced consumption, but ensure result is still negative or 0
    const reducedAmount = Math.min(0, resource.amount + efficiencyValue);

    return {
      type: resource.type,
      amount: reducedAmount,
    };
  }

  // 其他情况保持原始资源数量不变
  // In other cases, keep original resource amount
  return resource;
}

/**
 * 根据生物的Speed属性调整程序的运行时间
 * Adjusts program processing time based on creature's Speed attribute
 *
 * @param originalTime - 原始程序运行时间 (Original program processing time)
 * @param speedValue - 生物的Speed属性值 (Creature's Speed attribute value)
 * @returns 调整后的程序运行时间 (Adjusted program processing time)
 */
export function adjustProcessingTimeBySpeed(
  originalTime: number,
  speedValue: number
): number {
  // 如果Speed为0或负数，保持原始运行时间不变
  // If Speed is 0 or negative, keep original processing time
  if (speedValue <= 0) {
    return originalTime;
  }

  // 计算(speedValue + 1)的以2为底的对数并取整
  // Calculate log base 2 of (speedValue + 1) and floor it
  const logValue = Math.floor(Math.log2(speedValue + 1));

  // 计算调整因子 S
  // Calculate adjustment factor S
  const S = 0.1 * logValue;

  // 应用公式调整时间
  // Apply formula to adjust time
  const adjustedTime = originalTime * (1 - S);

  // 确保调整后的时间不小于原始时间的10%
  // Ensure adjusted time is not less than 10% of original time
  return Math.max(originalTime * 0.1, adjustedTime);
}

export const selectSelectedCreatureDiffResources = (state: RootState) => {
  const selectedCreature = selectSelectedCreature(state);
  const programs = selectProgramsByIndexes(selectedCreature.programIndexes)(
    state
  ).filter((program) => program != null);
  const diffResources = Object.fromEntries(
    resourceTypes.map((type) => [type, 0])
  );

  // 获取生物的Productivity属性值 (Get creature's Productivity attribute value)
  const productivityValue =
    selectedCreature.attributes.find(
      (attr: { type: AttributeType; amount: number }) =>
        attr.type === AttributeType.Productivity
    )?.amount ?? 0;
  const EfficiencyValue =
    selectedCreature.attributes.find(
      (attr: { type: AttributeType; amount: number }) =>
        attr.type === AttributeType.Efficiency
    )?.amount ?? 0;

  programs.forEach((program) =>
    program?.resources?.forEach((resource: ResourceAmountPair) => {
      // 调整资源数量，同时考虑Productivity和Efficiency属性
      // Adjust resource amount considering both Productivity and Efficiency attributes
      const adjustedResource = adjustResourceByProductivity(
        resource,
        productivityValue,
        EfficiencyValue
      );
      diffResources[adjustedResource.type] += adjustedResource.amount;
    })
  );

  return diffResources;
};

function getProgressBarValue(progress: number, process: number) {
  return Math.max(0, Math.min((progress / process) * 100, 100));
}

export const selectSelectedCreatureCurrentProgramIndex = (state: RootState) =>
  selectSelectedCreature(state).currentProgramIndex;

export const selectSelectedCreatureCurrentProgram =
  (localTimer: number) =>
  (state: RootState): ProgramInfo => {
    const selectedCreature = selectSelectedCreature(state);
    return getCurrentProgram(selectedCreature)(localTimer)(state);
  };
const getCurrentProgram =
  (selectedCreature: CreatureModel) =>
  (localTimer: number) =>
  (state: RootState): ProgramInfo => {
    const currentProgramIndex = selectedCreature.currentProgramIndex;
    const programIndex = selectedCreature.programIndexes[currentProgramIndex]!;
    const program = selectProgramByIndex(programIndex)(state);

    if (program == null) {
      return {
        program: null,
        index: null,
        remainTime: 0,
        progress: 0,
      };
    }

    if (selectedCreature.isProgramStop == true) {
      return {
        program,
        index: currentProgramIndex,
        remainTime: 0,
        progress: 100,
      };
    }

    // 获取生物的Speed属性值 (Get creature's Speed attribute value)
    const speedValue =
      selectedCreature.attributes.find(
        (attr: { type: AttributeType; amount: number }) =>
          attr.type === AttributeType.Speed
      )?.amount ?? 0;

    // 调整程序运行时间 (Adjust program processing time)
    const adjustedProcessingTime = adjustProcessingTimeBySpeed(
      program.processingTime,
      speedValue
    );

    const time = localTimer - selectedCreature.startTime;
    return {
      program,
      index: currentProgramIndex,
      remainTime: Math.min(
        Math.ceil(adjustedProcessingTime - time),
        adjustedProcessingTime
      ),
      progress: getProgressBarValue(time, adjustedProcessingTime),
    };
  };

export const selectSelectedCreatureSelectingProgram = (
  state: RootState
): ProgramInfo => {
  const selectedCreature = selectSelectedCreature(state);
  const programIndex =
    selectedCreature.programIndexes[state.creatures.selectingProgramIndex];
  return {
    program: selectProgramByIndex(programIndex)(state),
    index: state.creatures.selectingProgramIndex,
    remainTime: 0,
    progress: 0,
  };
};

export const selectCreaturesCurrentProgressOnCurrentPage =
  (creatures: CreatureModel[]) =>
  (amountPerPage: number) =>
  (localTimer: number) =>
  (state: RootState) => {
    const slicedCreatures =
      selectCreaturesOnCurrentPage(creatures)(amountPerPage)(state);
    return slicedCreatures.map(
      (creature) => getCurrentProgram(creature)(localTimer)(state).progress
    );
  };

export const selectCurrentPage = (state: RootState) =>
  state.creatures.currentPage;
export const selectInstalledProgramIds = (state: RootState): number[] => {
  const allProgramIndexes = state.creatures.creatures
    .flatMap((creature: any) => creature.programIndexes)
    .filter(
      (programIndex: any): programIndex is number => programIndex !== null
    );
  return Array.from(new Set(allProgramIndexes));
};

export const {
  changeSelectedCreature,
  setSelectedCreature,
  startCreatingCreature,
  startRebootCreature,
  clearRebootCreature,
  setProgramIndex,
  setSelectingProgramIndex,
  nextPage,
  prevPage,
} = creaturesSlice.actions;
export default creaturesSlice.reducer;
