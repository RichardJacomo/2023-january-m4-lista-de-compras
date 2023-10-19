interface Data {
  name: string;
  quantity: string;
}
interface List {
  listName: string;
  data: Data[];
}
interface AddListID extends List {
  id: number;
}

type ListRequiredKeys = "listName" | "data";
type ListRequiredKeysData = "name" | "quantity";

export { List, AddListID, ListRequiredKeys, Data, ListRequiredKeysData };
