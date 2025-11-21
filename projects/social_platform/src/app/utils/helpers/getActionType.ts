/** @format */

import { actionTypeList } from "projects/core/src/consts/lists/actiion-type-list.const";

export const getActionType = (actionId: number) => {
  const findedAction = actionTypeList.find(action => action.id === actionId);

  if (!findedAction) return "phone" as const;

  return findedAction.additionalInfo;
};
