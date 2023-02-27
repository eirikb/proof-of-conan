export default [
  {
    os: "ubuntu-latest",
    cmd: "--build=outdated",
    enabled: true,
  },
  {
    os: "windows-latest",
    cmd: "--build=outdated",
    enabled: true,
  },
  {
    os: "windows-latest",
    toolchain: "mingw-builds/11.2.0",
    cmd: "--build=outdated",
    enabled: true,
  },
  {
    os: "ubuntu-latest",
    cmd: "--build=outdated -s compiler.libcxx=libstdc++11",
    enabled: true,
  },
  {
    os: "macos-latest",
    cmd: "--build=outdated",
    enabled: true,
  },
  {
    os: "ubuntu-latest",
    container: "conanio/gcc9-armv7hf",
    cmd: "--build=outdated -s:h arch=armv7hf",
  },
  {
    os: "ubuntu-latest",
    container: "conanio/gcc9",
    cmd: "--build=outdated",
  },
];
