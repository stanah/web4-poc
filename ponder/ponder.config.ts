import { createConfig } from "@ponder/core";
import { http } from "viem";

import IdentityRegistryAbi from "./abis/IdentityRegistry.json";
import ReputationRegistryAbi from "./abis/ReputationRegistry.json";
import ValidationRegistryAbi from "./abis/ValidationRegistry.json";

/**
 * Ponder indexer configuration for ERC-8004 AI Agent Economy contracts.
 *
 * Indexes three contracts on Sepolia:
 * - IdentityRegistry: Agent registration (ERC-721 Transfer events)
 * - ReputationRegistry: Feedback scoring (FeedbackGiven events)
 * - ValidationRegistry: Third-party validations (Validated events)
 */
export default createConfig({
  networks: {
    sepolia: {
      chainId: 11155111,
      transport: http(process.env.PONDER_RPC_URL_SEPOLIA ?? "https://rpc.sepolia.org"),
    },
  },
  contracts: {
    IdentityRegistry: {
      network: "sepolia",
      abi: IdentityRegistryAbi,
      address: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
      startBlock: 7_000_000,
    },
    ReputationRegistry: {
      network: "sepolia",
      abi: ReputationRegistryAbi,
      address: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
      startBlock: 7_000_000,
    },
    ValidationRegistry: {
      network: "sepolia",
      abi: ValidationRegistryAbi,
      address: "0x8004Cb1BF31DAf7788923b405b754f57acEB4272",
      startBlock: 7_000_000,
    },
  },
});
