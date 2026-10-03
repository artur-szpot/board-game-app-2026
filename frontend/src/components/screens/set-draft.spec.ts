import { describe, expect, it } from "vitest";
import { isSetData } from "../../utils/set-data";
import {
  createSetDraft,
  removeProperty,
  serializeSetDraft,
  updateProperty,
  validateSetDraft,
} from "./set-draft";

describe("set drafts", () => {
  it("rejects legacy payloads and malformed property maps at load boundaries", () => {
    expect(isSetData({ items: [{ value: 1, label: ["old.key"] }] })).toBe(
      false,
    );
    expect(
      isSetData({
        properties: ["city"],
        items: [{ name: "alice", properties: { city: "", extra: "" } }],
      }),
    ).toBe(false);
    expect(
      isSetData({
        properties: ["city"],
        items: [{ name: "alice", properties: { city: 2 } }],
      }),
    ).toBe(false);
  });
  it("starts with one property and item and appends exactly one placeholder when edited", () => {
    let draft = createSetDraft();
    expect(draft.properties).toHaveLength(1);
    expect(draft.items).toHaveLength(1);
    draft = updateProperty(draft, draft.properties[0].id, "home");
    draft = updateProperty(draft, draft.properties[0].id, "homeTown");
    expect(draft.properties.map(row => row.name)).toEqual(["homeTown", ""]);
  });

  it("retains cleared intermediate rows and rejects them", () => {
    let draft = createSetDraft();
    const id = draft.properties[0].id;
    draft = updateProperty(draft, id, "homeTown");
    draft = updateProperty(draft, id, "");
    expect(draft.properties).toHaveLength(2);
    expect(validateSetDraft("people", draft)).toContain(
      "Property names must be unique and camelCase",
    );
  });

  it("clears the lone property and keeps an empty trailing row after removal", () => {
    let draft = createSetDraft();
    draft = removeProperty(draft, draft.properties[0].id);
    expect(draft.properties.map(row => row.name)).toEqual([""]);
    draft = updateProperty(draft, draft.properties[0].id, "homeTown");
    draft = removeProperty(draft, draft.properties[1].id);
    expect(draft.properties.map(row => row.name)).toEqual(["homeTown", ""]);
  });

  it("preserves values across renames, forgets removed values, and adds empty values", () => {
    let draft = createSetDraft({
      properties: ["homeTown"],
      items: [{ name: "alice", properties: { homeTown: "Paris" } }],
    });
    const id = draft.properties[0].id;
    draft = updateProperty(draft, id, "city");
    expect(serializeSetDraft(draft).items[0].properties).toEqual({
      city: "Paris",
    });
    draft = removeProperty(draft, id);
    expect(draft.items[0].values).toEqual({});
    draft = updateProperty(draft, draft.properties[0].id, "city");
    expect(serializeSetDraft(draft).items[0].properties).toEqual({ city: "" });
    draft = updateProperty(draft, draft.properties[1].id, "occupation");
    expect(serializeSetDraft(draft).items[0].properties).toEqual({
      city: "",
      occupation: "",
    });
    expect(isSetData(serializeSetDraft(draft))).toBe(true);
  });

  it("blocks duplicate and invalid identifiers without changing any values", () => {
    let draft = createSetDraft({
      properties: ["city"],
      items: [{ name: "alice", properties: { city: "Paris" } }],
    });
    draft = updateProperty(draft, draft.properties[1].id, "city");
    draft.items.push({ ...draft.items[0], id: "another" });
    expect(validateSetDraft("People", draft)).toEqual([
      "Data set name must be camelCase",
      "Property names must be unique and camelCase",
      "Item names must be unique and camelCase",
    ]);
    expect(draft.items[0].values[draft.properties[0].id]).toBe("Paris");
  });
});
