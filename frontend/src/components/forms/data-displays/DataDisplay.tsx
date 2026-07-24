import type { FC } from "react";

import type { SelectionResult } from "../../screens/selection-strategies";

export type DataDisplayProps = {
  item: SelectionResult;
  removeItem: (item: SelectionResult) => void;
};

export const DataDisplay: FC<DataDisplayProps> = (props: DataDisplayProps) => {
  const { item, removeItem } = props;
  const { name, type } = item;

  return (
    <div className={`data-item data-${type}`}>
      <p>{name}</p>
      <button type="button" onClick={() => removeItem(item)}>
        {"[x]"}
      </button>
    </div>
  );
};
