# pricegun

## Method

The algorithm is constantly being improved and updated, but is currently based on calculating a modified Time Weighted Average Price as follows

```math
P_{\mathrm{TWAP}} = \frac{\sum_{j}{P_j \cdot T_j \cdot V_j^E}}{\sum_j{T_j} \cdot V_j^E}
```

where

- $P_{\mathrm{TWAP}}$ is the Time Weighted Average Price
- $P_j$ is the price of the item at a given transaction
- $T_j$ is the time since the transaction epoch
- $V_j$ is the volume of a given transaction
- $E$ is a factor for dampening the impact of sudden high volume transactions
- $j$ is the individual transaction

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```
