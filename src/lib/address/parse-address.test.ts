import { describe, expect, it } from "vitest";

import { parseAddress } from "./parse-address";

describe("parseAddress (Taiwan)", () => {
  it("parses 嘉義市東區", () => {
    expect(parseAddress("嘉義市東區民族路100號")).toEqual({
      city: "嘉義市",
      district: "東區",
    });
  });

  it("parses 台南市中西區", () => {
    expect(parseAddress("台南市中西區府前路一段100號")).toEqual({
      city: "台南市",
      district: "中西區",
    });
  });

  it("parses 高雄市左營區", () => {
    expect(parseAddress("高雄市左營區博愛二路100號")).toEqual({
      city: "高雄市",
      district: "左營區",
    });
  });

  it("parses 新北市板橋區", () => {
    expect(parseAddress("新北市板橋區文化路一段100號")).toEqual({
      city: "新北市",
      district: "板橋區",
    });
  });

  it("parses 台北市信義區", () => {
    expect(parseAddress("台北市信義區松高路11號")).toEqual({
      city: "台北市",
      district: "信義區",
    });
  });

  it("parses 桃園市中壢區", () => {
    expect(parseAddress("桃園市中壢區中山路100號")).toEqual({
      city: "桃園市",
      district: "中壢區",
    });
  });

  it("normalizes 臺北市 → 台北市", () => {
    expect(parseAddress("臺北市信義區松高路11號")).toEqual({
      city: "台北市",
      district: "信義區",
    });
  });

  it("accepts postal code prefix", () => {
    expect(parseAddress("600嘉義市東區民族路100號")).toEqual({
      city: "嘉義市",
      district: "東區",
    });
  });

  it("returns city only when district is missing", () => {
    expect(parseAddress("嘉義市")).toEqual({
      city: "嘉義市",
      district: null,
    });
  });
});

describe("parseAddress (failure cases)", () => {
  it("returns nulls for empty string", () => {
    expect(parseAddress("")).toEqual({ city: null, district: null });
    expect(parseAddress("   ")).toEqual({ city: null, district: null });
  });

  it("returns nulls for invalid address", () => {
    expect(parseAddress("民族路100號")).toEqual({
      city: null,
      district: null,
    });
    expect(parseAddress("不知道哪裡")).toEqual({
      city: null,
      district: null,
    });
  });

  it("returns nulls for foreign addresses", () => {
    expect(parseAddress("Tokyo, Japan")).toEqual({
      city: null,
      district: null,
    });
    expect(parseAddress("東京都渋谷区道玄坂")).toEqual({
      city: null,
      district: null,
    });
    expect(parseAddress("Seoul Jongno-gu")).toEqual({
      city: null,
      district: null,
    });
    expect(parseAddress("123 Orchard Road, Singapore")).toEqual({
      city: null,
      district: null,
    });
  });
});
