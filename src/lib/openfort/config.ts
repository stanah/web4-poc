/**
 * Openfort Account Abstraction configuration for ERC-8004 AI Agent Economy.
 *
 * Openfort provides:
 * - Smart accounts (ERC-4337) for gasless transactions
 * - Session keys for delegated signing
 * - Gas sponsorship via policies
 */

export const OPENFORT_CONFIG = {
  /** Chain ID for Sepolia testnet */
  chainId: 11155111,

  /**
   * Openfort policy ID for gas sponsorship.
   * Configured in the Openfort dashboard to sponsor gas for:
   * - Agent registration (IdentityRegistry.register)
   * - Feedback submission (ReputationRegistry.giveFeedback)
   * - Validation recording (ValidationRegistry.validate)
   */
  policyId: process.env.NEXT_PUBLIC_OPENFORT_POLICY_ID ?? "",

  /** Contracts that are whitelisted for gas sponsorship */
  sponsoredContracts: [
    "0x8004A818BFB912233c491871b3d84c89A494BD9e", // IdentityRegistry
    "0x8004B663056A597Dffe9eCcC1965A193B7388713", // ReputationRegistry
    "0x8004Cb1BF31DAf7788923b405b754f57acEB4272", // ValidationRegistry
  ] as const,
} as const;
