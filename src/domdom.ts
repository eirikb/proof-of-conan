import domdom from "@eirikb/domdom";
import defaultTargets from "./targets";
import { Data, Preset, Target } from "./types";

const presets: Preset[] = [
  { name: "Default", targets: defaultTargets as Target[] },
];
try {
  presets.push(...JSON.parse(localStorage.getItem("presets")));
} catch (_) {}

const dd = domdom<Data>({
  lookupInfo: "",
  repoUrl:
    "https://github.com/conan-io/conan-center-index/tree/master/recipes/zlib",
  formHidden: true,
  versions: [],
  jobs: [],
  status: "",
  done: false,
  presets,
  preset: presets[0].name,
  targets: [],
});

export const init = dd.init;
export const React = dd.React;
export const don = dd.don;
export const on = dd.on;
export const data = dd.data;
export const path = dd.path;
export const set = dd.set;
