export const validationRegistryAbi = [
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "validationType", type: "string" },
      { name: "validationData", type: "bytes" },
    ],
    name: "validate",
    outputs: [{ name: "validationId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getValidations",
    outputs: [
      {
        components: [
          { name: "validator", type: "address" },
          { name: "validationType", type: "string" },
          { name: "validationData", type: "bytes" },
          { name: "timestamp", type: "uint256" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "agentId", type: "uint256" },
      { indexed: true, name: "validator", type: "address" },
      { indexed: false, name: "validationType", type: "string" },
    ],
    name: "Validated",
    type: "event",
  },
] as const;
