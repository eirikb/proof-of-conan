export default [
  {
    os: "ubuntu-latest",
    cmd: "--build=missing",
    enabled: true,
  },
  {
    os: "windows-latest",
    cmd: "--build=missing",
    enabled: true,
  },
  {
    os: "windows-latest",
    toolchain: "mingw-builds/11.2.0",
    cmd: "--build=missing",
    enabled: true,
  },
  {
    os: "ubuntu-latest",
    cmd: "--build=missing -s compiler.libcxx=libstdc++11",
    enabled: true,
  },
  {
    os: "macos-11",
    cmd: "--build=missing",
    enabled: true,
  },
  {
    os: "ubuntu-latest",
    container: "conanio/gcc9-armv7hf",
    cmd: "--build=missing -s:h arch=armv7hf",
  },
  {
    os: "ubuntu-latest",
    container: "conanio/gcc9",
    cmd: "--build=missing",
  },
];
