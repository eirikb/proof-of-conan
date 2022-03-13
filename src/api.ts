import { data } from "./domdom";
import yaml from "js-yaml";

export async function lookup() {
  data.lookupInfo = "Looking up...";
  if (data.repoUrl.startsWith("https://github.com")) {
    let parts = data.repoUrl.split("/");
    if (parts[parts.length - 1].includes(".")) parts = parts.slice(0, -1);

    const pathStart = parts.length - 2;
    data.repository = parts.slice(3, 5).join("/");
    data.path = parts.slice(pathStart, parts.length).join("/");
    data.package = parts[parts.length - 1];
    data.branch = parts.slice(6, pathStart).join("/");
    data.lookupInfo = "Looking up versions...";
    data.formHidden = true;
    const res = await fetch(
      `https://raw.githubusercontent.com/${parts
        .slice(3)
        .filter((p) => p !== "blob" && p !== "tree")
        .join("/")}/config.yml`
    );
    data.lookupInfo = `Got ${res.status} ${res.statusText} from GitHub`;
    if (res.status >= 200 && res.status < 400) {
      data.versions = Object.entries(yaml.load(await res.text()).versions).map(
        ([tag, v]) => ({
          tag,
          path: (v as any).folder as string,
          selected: true,
        })
      );
      data.formHidden = false;
    }
  } else {
    data.lookupInfo = "Must be a GitHub repo";
  }
}

export async function start() {
  data.status = "Starting...";
  data.done = false;
  const res = await fetch("https://proof-of-conan.azureedge.net", {
    method: "POST",
    body: JSON.stringify({
      ref: "main",
      inputs: {
        repository: data.repository,
        path: data.path,
        ref: data.branch,
        targets: JSON.stringify({
          include: data.jobs,
        }),
      },
    }),
  });
  data.status = `Done: ${res.status} ${res.statusText}`;
  data.done = true;
}
