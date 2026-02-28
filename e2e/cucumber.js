module.exports = {
  default: {
    require: ["./steps/**/*.ts", "./support/**/*.ts"],
    format: ["progress", "summary"],
    paths: ["./features/**/*.feature"],
    requireModule: ["ts-node/register"],
    publishQuiet: true,
    worldParameters: {
      baseUrl: "http://localhost:3001",
      headless: true,
    },
  },
};
