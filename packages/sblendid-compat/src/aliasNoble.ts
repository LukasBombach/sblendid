import moduleAlias from "module-alias";

export default () => {
  moduleAlias.addAliases({
    noble: "sblendid-compat",
    "noble/lib/noble": "sblendid-compat"
  });
};
