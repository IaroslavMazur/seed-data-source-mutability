# Seed Data Source Mutability Issue

This repository provides a minimal reproducible example illustrating a PDA seed-related issue when using the Bankrun provider for Anchor in TypeScript tests.

## Overview

The Anchor program includes three instructions:
- **initialize:**  
  Creates a `data_pda` (seed: `[b"data_pda"]`) and sets its `a_number` to 0.
  
- **prepare_for_action:**  
  Creates a `random_pda` using a seed composed of a constant and the little-endian byte representation of `data_pda.a_number` (i.e., `[b"random_pda", data_pda.a_number.to_le_bytes()]`).
  
- **perform_action:**  
  Increments the `a_number` field of `data_pda`.

**Issue:**  
When `data_pda` is declared as mutable in the `PerformAction` context, tests fail with a `ConstraintSeeds` error for `random_pda`. Declaring `data_pda` as read-only in this context avoids the error, suggesting that the mutation of the data field used as a seed is causing the discrepancy.

## Getting Started

1. Clone the repository.
2. Follow your standard Anchor and Bankrun setup procedures.
3. Run the tests using your preferred command (e.g., `anchor test`).

## Files

- **lib.rs:** Contains the Anchor program source code.
- **tests/:** Contains TypeScript tests demonstrating the issue.
