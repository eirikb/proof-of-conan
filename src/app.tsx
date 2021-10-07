import { React, init, data, don, on, path } from "./domdom";
import { lookup, start } from "./api";

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

init(
  document.body,
  <div>
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await lookup();
      }}
    >
      URL to your package in a GitHub repository:
      <input bind={path().repoUrl.$path} type="text" size="80" />
      <br />
      <button>Lookup</button>
      <div>
        See{" "}
        <a href="https://github.com/conan-io/conan-center-index/tree/master/recipes">
          conan-center-index
        </a>{" "}
        or <a href="https://conan.io/center/">ConanCenter</a>
        for packages. Yes you can point to your own repo.
      </div>
    </form>
    <span>{don(path().lookupInfo)}</span>
    <form
      hidden={don(path().formHidden)}
      onSubmit={async (e) => {
        e.preventDefault();
        await start();
      }}
    >
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
            Branch
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
        <div>
          For example docker containers please see
          <a href="https://github.com/conan-io/conan-docker-tools">
            conan-docker-tools
          </a>{" "}
          and
          <a href="https://github.com/dockcross/dockcross">dockcross</a>
        </div>
      </fieldset>

      <div>
        <h3>Build jobs</h3>
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
          <b>Start!</b>
        </button>
      </div>
    </form>
    <div>{don(path().status)}</div>
    <h3>
      <a
        href="https://github.com/eirikb/proof-of-conan/actions/workflows/proof-of-conan.yml"
        target="_blank"
        hidden={don(path().done).map((d) => !d)}
      >
        Open builds
      </a>
    </h3>
    <div>
      <a href="https://github.com/eirikb/proof-of-conan/actions/workflows/proof-of-conan.yml">
        View all builds
      </a>
    </div>
    <div>
      <a href="https://github.com/eirikb/proof-of-conan">Repo</a>
    </div>
  </div>
);
