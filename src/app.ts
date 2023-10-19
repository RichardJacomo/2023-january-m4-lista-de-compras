import express, { json, Application } from "express";
import {
  createList,
  deleteListID,
  readList,
  readListID,
  deleteItem,
  updateItem,
  verifyUpdate,
} from "./logic";

const app: Application = express();
app.use(json());

app.post("/purchaseList", createList);
app.get("/purchaseList", readList);
app.get("/purchaseList/:id", readListID);
app.delete("/purchaseList/:id", deleteListID);
app.delete("/purchaseList/:id/:name", deleteItem);
app.patch("/purchaseList/:id/:name", verifyUpdate, updateItem);

const PORT: number = 3000;
const runningMsg: string = `Server running on http://localhost:${PORT}`;
app.listen(PORT, () => console.log(runningMsg));
