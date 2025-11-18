# pricegun

## Method

The algorithm is constantly being improved and updated, but is currently based on calculating a modified Time Weighted Average Price as follows

```math
P_{\mathrm{TWAP}} = \frac{\sum_{j}{P_j \cdot w_j \cdot V_j^E}}{\sum_{j}{w_j \cdot V_j^E}}
```

```math
w_j = e^{-\lambda T_j}
```

```math
\lambda = \frac{ln(2)}{H}
```

where

- $P_{\mathrm{TWAP}}$ is the Time Weighted Average Price
- $P_j$ is the price of the item at a given transaction
- $w_j$ is the time weighting coefficient
- $T_j$ is the time since the transaction epoch (now) in seconds
- $H$ is the halflife for transaction weighting (one day) in seconds
- $V_j$ is the volume of a given transaction
- $E$ is a factor for dampening the impact of sudden high volume transactions
- $j$ is the individual transaction

## Development

To install dependencies:

```bash
yarn
```

To run:

```bash
yarn start
```
