import { data } from "./domdom";
import { Version } from "./types";

export async function lookup() {
  data.lookupInfo = "Looking up...";
  if (data.repoUrl.startsWith("https://github.com")) {
    let parts = data.repoUrl.split("/");
    if (parts[parts.length - 1].includes(".")) parts = parts.slice(0, -1);

    data.repository = parts.slice(3, 5).join("/");
    data.path = parts.slice(7, parts.length).join("/");
    data.package = parts[parts.length - 1];
    data.branch = parts[6];
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
      data.versions = (await res.text())
        .split(/\n/g)
        .reduce((res: Version[], line) => {
          const v = line.match(/^ +"(\d+.*)"+/);
          const f = line.match(/^ +folder: *"(.*)"/);
          if (v !== null) {
            res.push({ tag: v[1], path: "", selected: true });
          } else if (f != null) {
            res[res.length - 1].path = f[1];
          }
          return res;
        }, []);
      data.formHidden = false;
    }
  } else {
    data.lookupInfo = "Must be a GitHub repo";
  }
}

export async function start() {
  data.status = "Starting...";
  data.done = false;
  const res = await fetch("https://proof-of-conan-ultimate.azureedge.net", {
    method: "POST",
    body: JSON.stringify({
      ref: "main",
      inputs: {
        repository: data.repository,
        path: data.path,
        targets: JSON.stringify({
          include: data.jobs,
        }),
      },
    }),
  });
  data.status = `Done: ${res.status} ${res.statusText}`;
  data.done = true;
}
