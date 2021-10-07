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
    toolchain: "mingw-w64/8.1@",
    cmd: "--build=missing",
    enabled: true,
  },
  {
    os: "ubuntu-latest",
    cmd: "--build=missing -s compiler.libcxx=libstdc++11",
    enabled: true,
  },
  {
    os: "macos-latest",
    cmd: "--build=missing",
    enabled: true,
  },
  {
    os: "ubuntu-latest",
    container: "conanio/gcc9-armv7hf",
    cmd: "--build=missing",
  },
  {
    os: "ubuntu-latest",
    container: "conanio/gcc9",
    cmd: "--build=missing",
  },
];
