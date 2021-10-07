import domdom from "@eirikb/domdom";
import defaultTargets from "./targets";

interface Target {
  os: string;
  container: string;
  toolchain: string;
  cmd: string;
  enabled: boolean;
}

interface Job {
  os: string;
  container: string;
  toolchain: string;
  conancmd: string;
  path: string;
}

interface Version {
  tag: string;
  path: string;
  selected: boolean;
}

interface Preset {
  name: string;
  targets: Target[];
}

interface Data {
  lookupInfo: string;
  repoUrl: string;
  formHidden: boolean;
  repository?: string;
  path?: string;
  branch?: string;
  package?: string;
  versions: Version[];
  jobs: Job[];
  status: string;
  done: boolean;
  presets: Preset[];
  preset: string;
  targets: Target[];
}

const presets: Preset[] = [
  { name: "Default", targets: defaultTargets as Target[] },
];
try {
  presets.push(...JSON.parse(localStorage.getItem("presets")));
} catch (_) {}

const { React, init, data, on, don, path } = domdom<Data>({
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

function updateCmds() {
  data.jobs = (data.versions || [])
    .filter((v) => v.selected)
    .flatMap((version) =>
      (data.targets || [])
        .filter((target) => target.enabled)
        .map((target) => ({
          os: target.os,
          container: target.container,
          toolchain: target.toolchain,
          path: version.path,
          conancmd: `create . ${data.package}/${version.tag}@ ${target.cmd}`,
        }))
    );
}

on("+!*-", path().versions.$xx, updateCmds);
on("+!*-", path().targets.$xx, updateCmds);

on("+!*-", path().targets.$xx, () => {
  if (data.preset === "Default") return;
  const i = data.presets.findIndex((p) => p.name === data.preset);
  data.presets[i].targets = data.targets;
  localStorage.setItem("presets", JSON.stringify(data.presets.slice(1)));
});

on("+!*-", path().preset, (preset) => {
  data.targets = data.presets.find((p) => p.name === preset).targets;
});

async function lookup(e: Event) {
  e.preventDefault();
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

// TODO: Remove
// @ts-ignore
lookup({
  preventDefault() {},
});

async function start(e: Event) {
  e.preventDefault();
  data.status = "Starting...";
  data.done = false;
  const res = await fetch("https://proof-of-conan-ultimate.azureedge.net", {
    method: "POST",
    body: JSON.stringify({
      // TODO: REF
      ref: "feature/ultimate",
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

init(
  document.body,
  <div>
    <form onSubmit={lookup}>
      URL to your package in a GitHub repository:
      <input bind={path().repoUrl.$path} type="text" size="80" />
      <br />
      <button>Lookup</button>
    </form>
    <span>{don(path().lookupInfo)}</span>
    <form hidden={don(path().formHidden)} onSubmit={start}>
      <fieldset>
        <legend>Package</legend>
        <div>
          <label>
            Repository <br />
            <input
              required
              type="text"
              bind={path().repository.$path}
              placeholder="Repository"
            />
          </label>
        </div>
        <div>
          <label>
            Repository branch
            <br />
            <input
              required
              bind={path().branch.$path}
              type="text"
              placeholder="Repository branch"
            />
          </label>
        </div>
        <div>
          <label>
            Package
            <br />
            <input
              required
              type="text"
              bind={path().package.$path}
              placeholder="Package"
            />
          </label>
        </div>

        <div>
          <label>
            Path to package
            <br />
            <input
              required
              type="text"
              bind={path().path.$path}
              placeholder="Path to package"
            />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Version</legend>
        {don(path().versions.$).map((version) => (
          <div>
            <label>
              <input type="checkbox" bind={path(version).selected.$path} />
              {version.tag}
            </label>
          </div>
        ))}
      </fieldset>
      <fieldset>
        <legend>Targets</legend>
        <div>
          Preset:
          <select bind={path().preset.$path}>
            {don(path().presets.$).map((preset) => (
              <option>{preset.name}</option>
            ))}
          </select>
          <button
            type="button"
            onclick={() => {
              const name = prompt("Preset name");
              if (name) {
                data.presets.push({
                  name,
                  targets: data.targets,
                });
                data.preset = name;
              }
            }}
          >
            +
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Remove</th>
              <th>OS</th>
              <th>Container</th>
              <th>Toolchain</th>
              <th>Conan command</th>
              <th>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {don(path().targets.$).map((target, { $ }) => (
              <tr>
                <td>
                  <button
                    type="button"
                    onclick={() =>
                      (data.targets = data.targets.filter(
                        (t, i) => Number(i) !== Number($)
                      ))
                    }
                  >
                    -
                  </button>
                </td>
                <td>
                  <input type="text" bind={path(target).os.$path} />
                </td>
                <td>
                  <input type="text" bind={path(target).container.$path} />
                </td>
                <td>
                  <input type="text" bind={path(target).toolchain.$path} />
                </td>
                <td>
                  <input type="text" bind={path(target).cmd.$path} />
                </td>
                <td>
                  <input type="checkbox" bind={path(target).enabled.$path} />
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <button
                  type="button"
                  onclick={() =>
                    data.targets.push({
                      os: "ubuntu-latest",
                      container: "",
                      toolchain: "",
                      cmd: "--build=missing",
                      enabled: true,
                    })
                  }
                >
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </fieldset>

      <div>
        <h3>Jobs</h3>
        <table>
          <thead>
            <tr>
              <th>OS</th>
              <th>Container</th>
              <th>Toolchain</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            {don(path().jobs.$).map((cmd) => (
              <tr>
                <td>{cmd.os}</td>
                <td>{cmd.container}</td>
                <td>{cmd.toolchain}</td>
                <td>conan {cmd.conancmd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <button>
          <b>GO!</b>
        </button>
      </div>
    </form>
    <div>{don(path().status)}</div>
    <div>
      <a
        href="https://github.com/eirikb/proof-of-conan/actions/workflows/ultimate-builder.yml"
        hidden={don(path().done).map((d) => !d)}
      >
        View all builds
      </a>
    </div>
  </div>
);
