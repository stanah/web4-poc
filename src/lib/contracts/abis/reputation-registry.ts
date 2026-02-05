export const reputationRegistryAbi = [
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int256" },
      { name: "decimals", type: "uint8" },
      { name: "tag1", type: "bytes32" },
      { name: "tag2", type: "bytes32" },
    ],
    name: "giveFeedback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "tags", type: "bytes32[]" },
      { name: "startDate", type: "string" },
      { name: "endDate", type: "string" },
    ],
    name: "getSummary",
    outputs: [
      {
        components: [
          { name: "totalFeedback", type: "uint256" },
          { name: "averageValue", type: "int256" },
          { name: "averageDecimals", type: "uint8" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    name: "readAllFeedback",
    outputs: [
      {
        components: [
          { name: "from", type: "address" },
          { name: "value", type: "int256" },
          { name: "decimals", type: "uint8" },
          { name: "tag1", type: "bytes32" },
          { name: "tag2", type: "bytes32" },
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
      { indexed: true, name: "from", type: "address" },
      { indexed: false, name: "value", type: "int256" },
      { indexed: false, name: "decimals", type: "uint8" },
      { indexed: false, name: "tag1", type: "bytes32" },
      { indexed: false, name: "tag2", type: "bytes32" },
    ],
    name: "FeedbackGiven",
    type: "event",
  },
] as const;
