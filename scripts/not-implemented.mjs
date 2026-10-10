// Stand-in for checks that belong to a later milestone. It always fails, so
// CI can never report a vacuous pass (docs/audit/DEVELOPMENT_PLAN.md, Milestone 1).
const pending = {
  "validate:content":
    "Milestone 3 adds content schemas, publication guards, and this check.",
  "validate:release":
    "Milestone 6 adds release validation for the intended APP_MODE.",
};

const name = process.argv[2] ?? "This check";
console.error(`${name} is not implemented yet. ${pending[name] ?? ""}`.trim());
process.exit(1);
