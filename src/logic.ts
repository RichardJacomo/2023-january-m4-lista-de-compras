import { NextFunction, Request, Response } from "express";
import { list } from "./database";
import {
  AddListID,
  List,
  ListRequiredKeys,
  Data,
  ListRequiredKeysData,
} from "./@types/interfaces";

const validateListOrderData = (payload: any): void => {
  const keys: Array<string> = Object.keys(payload);
  const requiredKeys: Array<ListRequiredKeysData> = ["name", "quantity"];

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key);
  });

  if (!containsAllRequired) {
    throw new Error(`Required keys are: ${requiredKeys}`);
  }

  if (keys.length > requiredKeys.length) {
    throw new Error(
      `The request has additional keys, only ${requiredKeys} are allowed`
    );
  }
};

const validateListOrder = (payload: any): AddListID => {
  const payloadKeys: Array<string> = Object.keys(payload);
  const requiredKeys: Array<ListRequiredKeys> = ["listName", "data"];

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return payloadKeys.includes(key);
  });

  if (!containsAllRequired) {
    throw new Error(`Required keys are: ${requiredKeys}`);
  }
  if (typeof payload.listName !== "string") {
    throw new Error("Invalid entry type");
  }

  if (payloadKeys.length > requiredKeys.length) {
    throw new Error(
      `The request has additional keys, only ${requiredKeys} are allowed`
    );
  }

  payload.data.forEach((element: any) => {
    validateListOrderData(element);
  });

  return payload;
};

const createList = (request: Request, response: Response): Response => {
  try {
    const newList: List = validateListOrder(request.body);
    let id: number;

    const isEveryNameString = request.body.data.map((e: any) => {
      return e.name;
    });
    const isEveryQuantityString = request.body.data.map((e: any) => {
      return e.quantity;
    });

    const nameValues = isEveryNameString.every(
      (e: any) => typeof e === "string"
    );
    const quantityValues = isEveryQuantityString.every(
      (e: any) => typeof e === "string"
    );

    if (list.length === 0) {
      id = 1;
    } else {
      id = list[list.length - 1].id + 1;
    }

    const listWithID: AddListID = {
      ...newList,
      id,
    };
    if (
      typeof request.body.listName === "string" &&
      nameValues &&
      quantityValues
    ) {
      list.push(listWithID);
    }
    return response.status(201).json(listWithID);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({
        message: error.message,
      });
    }
    return response.status(400).json({ message: "Internal server error" });
  }
};
const readList = (request: Request, response: Response): Response => {
  return response.status(200).json(list);
};

function findListById(id: string) {
  return list.find((e) => e.id === Number(id));
}

const readListID = (request: Request, response: Response): Response => {
  const listID = findListById(request.params.id);

  if (listID) {
    return response.status(200).json(listID);
  } else {
    return response.status(404).json({ message: "List not found." });
  }
};

const deleteListID = (request: Request, response: Response) => {
  const listID = findListById(request.params.id);
  const afterDeleteList = list.find((e) => e === listID);
  const deleteList = list.findIndex((e) => e === afterDeleteList);

  if (listID) {
    list.splice(deleteList, 1);
  }

  if (afterDeleteList) {
    return response.status(204).json();
  } else {
    return response.status(404).json({ message: "List not found." });
  }
};

function findItemByName(name: string, id: string) {
  let found = false;

  list.map((item) => {
    if (item.id === Number(id)) {
      let index = item.data.findIndex((data) => data.name === name);
      let validateName = item.data.find((data) => data.name === name);
      if (validateName) {
        item.data.splice(index, 1);
        found = true;
      }
    }
  });

  return found;
}
const deleteItem = (request: Request, response: Response) => {
  const itemName = findItemByName(request.params.name, request.params.id);

  if (itemName) {
    return response.status(204).json();
  } else {
    return response.status(404).json({ message: "Item not found." });
  }
};

function updateItemByName(name: string, newData: any) {
  let found = false;

  list.map((item) => {
    let i = item.data.findIndex((data) => data.name === name);

    if (i !== -1) {
      item.data[i] = newData;
      found = true;
    }
  });

  return found;
}

const updateItem = (request: Request, response: Response) => {
  const itemName = request.params.name;
  const newData = request.body;

  const itemUpdated = updateItemByName(itemName, newData);

  if (itemUpdated) {
    return response.status(200).json(newData);
  } else {
    return response.status(404).json({ message: "Item not found" });
  }
};

const verifyUpdate = (
  request: Request,
  response: Response,
  next: NextFunction
): Response | void => {
  const keys = Object.keys(request.body);

  let validateName;

  validateName = list.find((e) => {
    return e.id === Number(request.params.id);
  });

  if (keys.includes("name") && keys.includes("quantity")) {
    return next();
  } else if (
    !keys.includes("name") &&
    keys.includes("quantity") &&
    validateName
  ) {
    return response.status(400).json({ message: "You can't update the keys" });
  } else {
    return response.status(404).json({ message: "List not Found" });
  }
};

export {
  createList,
  readList,
  readListID,
  deleteListID,
  deleteItem,
  updateItem,
  verifyUpdate,
};
