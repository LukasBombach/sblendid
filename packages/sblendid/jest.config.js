module.exports = {
  roots: ["<rootDir>/src"],
  verbose: true,
  notify: true,
  notifyMode: "always",
  collectCoverage: true,
  transform: {
    "^.+\\.ts$": "ts-jest"
  }
};
