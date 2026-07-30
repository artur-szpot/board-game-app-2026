import type { FC } from "react";

import type { SelectionResult } from "../../screens/selection-strategies";
import { FormCheckboxField } from "../FormCheckboxField";
import { FormTextField } from "../FormTextField";
import type { AdditionalFieldChangeReceiver } from "../selection-field-props";

export type DataDisplayProps = {
  item: SelectionResult;
  removeItem: (item: SelectionResult) => void;
  onAdditionalStringFieldChange: AdditionalFieldChangeReceiver;
  onAdditionalBooleanFieldChange: AdditionalFieldChangeReceiver;
};

export const DataDisplay: FC<DataDisplayProps> = (props: DataDisplayProps) => {
  const {
    item,
    removeItem,
    onAdditionalStringFieldChange,
    onAdditionalBooleanFieldChange,
  } = props;
  const { name, type } = item;

  const textFieldConfigs = item.additionalStringFieldConfigs ?? {};
  const textFieldValues: Partial<Record<string, string>> =
    item.additionalStringFields ?? {};

  const booleanFieldConfigs = item.additionalBooleanFieldConfigs ?? {};
  const booleanFieldValues: Partial<Record<string, boolean>> =
    item.additionalBooleanFields ?? {};

  return (
    <div className={`data-item data-${type}`}>
      <div className="data-item-base">
        <p>{name}</p>
        <button type="button" onClick={() => removeItem(item)}>
          {"[x]"}
        </button>
      </div>
      {Object.entries(textFieldConfigs).map(([fieldName, field]) => {
        return (
          <FormTextField
            {...field}
            key={fieldName}
            value={textFieldValues[fieldName] ?? field.initialValue ?? ""}
            onChange={event =>
              onAdditionalStringFieldChange(item, fieldName, event)
            }
          />
        );
      })}
      {Object.entries(booleanFieldConfigs).map(([fieldName, field]) => {
        return (
          <FormCheckboxField
            {...field}
            key={fieldName}
            checked={booleanFieldValues[fieldName] ?? field.checked}
            onChange={event =>
              onAdditionalBooleanFieldChange(item, fieldName, event)
            }
          />
        );
      })}
    </div>
  );
};
