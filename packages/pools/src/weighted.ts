import { Pool } from "./interface";
import { Dec, Int } from "@keplr-wallet/unit";
import { WeightedPoolMath } from "@osmosis-labs/math";

export interface WeightedPoolRaw {
  id: string;
  poolParams: {
    lock: boolean;
    // Dec
    swapFee: string;
    // Dec
    exitFee: string;
    smoothWeightChangeParams: {
      // Timestamp
      start_time: string;
      // Seconds with s suffix. Ex) 3600s
      duration: string;
      initialPoolWeights: {
        token: {
          denom: string;
          // Int
          amount: string;
        };
        // Int
        weight: string;
      }[];
      targetPoolWeights: {
        token: {
          denom: string;
          // Int
          amount: string;
        };
        // Int
        weight: string;
      }[];
    } | null;
  };
  // Int
  totalWeight: string;
  totalShares: {
    denom: string;
    // Int
    amount: string;
  };
  poolAssets: [
    {
      // Int
      weight: string;
      token: {
        denom: string;
        // Int
        amount: string;
      };
    }
  ];
}

export class WeightedPool implements Pool {
  constructor(public readonly raw: WeightedPoolRaw) {}

  get exitFee(): Dec {
    return new Dec(this.raw.poolParams.exitFee);
  }

  get id(): string {
    return this.raw.id;
  }

  get poolAssets(): { denom: string; amount: Int; weight: Int }[] {
    return this.raw.poolAssets.map((asset) => {
      return {
        denom: asset.token.denom,
        amount: new Int(asset.token.amount),
        weight: new Int(asset.weight),
      };
    });
  }

  get shareDenom(): string {
    return this.raw.totalShares.denom;
  }

  get swapFee(): Dec {
    return new Dec(this.raw.poolParams.swapFee);
  }

  get totalShare(): Int {
    return new Int(this.raw.totalShares.amount);
  }

  getPoolAsset(denom: string): { denom: string; amount: Int; weight: Int } {
    const poolAsset = this.poolAssets.find((asset) => asset.denom === denom);
    if (!poolAsset) {
      throw new Error(
        `Pool ${this.id} doesn't have the pool asset for ${denom}`
      );
    }

    return poolAsset;
  }

  get totalWeight(): Int {
    return new Int(this.raw.totalWeight);
  }

  getSpotPriceInOverOut(tokenInDenom: string, tokenOutDenom: string): Dec {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    return WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      this.swapFee
    );
  }

  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    return WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      new Dec(0)
    );
  }

  getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec {
    return new Dec(1).quoTruncate(
      this.getSpotPriceInOverOut(tokenInDenom, tokenOutDenom)
    );
  }

  getSpotPriceOutOverInWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    return new Dec(1).quoTruncate(
      this.getSpotPriceInOverOutWithoutSwapFee(tokenInDenom, tokenOutDenom)
    );
  }

  getTokenInByTokenOut(
    tokenOut: { denom: string; amount: Int },
    tokenInDenom: string
  ): {
    amount: Int;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    effectivePriceInOverOut: Dec;
    effectivePriceOutOverIn: Dec;
    slippage: Dec;
  } {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOut.denom);

    const beforeSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      this.swapFee
    );

    const tokenInAmount = WeightedPoolMath.calcInGivenOut(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      new Dec(tokenOut.amount),
      this.swapFee
    ).truncate();

    const afterSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount).add(new Dec(tokenInAmount)),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount).sub(new Dec(tokenOut.amount)),
      new Dec(outPoolAsset.weight),
      this.swapFee
    );

    if (afterSpotPriceInOverOut.lt(beforeSpotPriceInOverOut)) {
      throw new Error("Spot price can't be decreased after swap");
    }

    const effectivePrice = new Dec(tokenInAmount).quo(new Dec(tokenOut.amount));
    const slippage = effectivePrice
      .quo(beforeSpotPriceInOverOut)
      .sub(new Dec("1"));

    return {
      amount: tokenInAmount,
      afterSpotPriceInOverOut: afterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: new Dec(1).quoTruncate(afterSpotPriceInOverOut),
      effectivePriceInOverOut: effectivePrice,
      effectivePriceOutOverIn: new Dec(1).quoTruncate(effectivePrice),
      slippage: slippage,
    };
  }

  getTokenOutByTokenIn(
    tokenIn: { denom: string; amount: Int },
    tokenOutDenom: string
  ): {
    amount: Int;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    effectivePriceInOverOut: Dec;
    effectivePriceOutOverIn: Dec;
    slippage: Dec;
  } {
    const inPoolAsset = this.getPoolAsset(tokenIn.denom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    const beforeSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      this.swapFee
    );

    const tokenOutAmount = WeightedPoolMath.calcOutGivenIn(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      new Dec(tokenIn.amount),
      this.swapFee
    ).truncate();

    const afterSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount).add(new Dec(tokenIn.amount)),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount).sub(new Dec(tokenOutAmount)),
      new Dec(outPoolAsset.weight),
      this.swapFee
    );

    if (afterSpotPriceInOverOut.lt(beforeSpotPriceInOverOut)) {
      throw new Error("Spot price can't be decreased after swap");
    }

    const effectivePrice = new Dec(tokenIn.amount).quo(new Dec(tokenOutAmount));
    const slippage = effectivePrice
      .quo(beforeSpotPriceInOverOut)
      .sub(new Dec("1"));

    return {
      amount: tokenOutAmount,
      afterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: new Dec(1).quoTruncate(afterSpotPriceInOverOut),
      effectivePriceInOverOut: effectivePrice,
      effectivePriceOutOverIn: new Dec(1).quoTruncate(effectivePrice),
      slippage: slippage,
    };
  }

  getMaxTokenInByTokenOutWithSlippage(
    tokenOut: { denom: string; amount: Int },
    tokenInDenom: string,
    slippage: Dec
  ): {
    beforeSpotPriceInOverOut: Dec;
    beforeSpotPriceOutOverIn: Dec;
    maxInAmount: Int;
  } {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOut.denom);

    const beforeSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      this.swapFee
    );
    const beforeSpotPriceOutOverIn = new Dec(1).quoTruncate(
      beforeSpotPriceInOverOut
    );

    const expectedEffectivePriceInOverOut =
      beforeSpotPriceInOverOut.mulTruncate(new Dec(1).add(slippage));

    return {
      beforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn,
      maxInAmount: expectedEffectivePriceInOverOut
        .mulTruncate(tokenOut.amount.toDec())
        .truncate(),
    };
  }

  getMinTokenOutByTokenInWithSlippage(
    tokenIn: { denom: string; amount: Int },
    tokenOutDenom: string,
    slippage: Dec
  ): {
    beforeSpotPriceInOverOut: Dec;
    beforeSpotPriceOutOverIn: Dec;
    minOutAmount: Int;
  } {
    const inPoolAsset = this.getPoolAsset(tokenIn.denom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    const beforeSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      this.swapFee
    );
    const beforeSpotPriceOutOverIn = new Dec(1).quoTruncate(
      beforeSpotPriceInOverOut
    );

    const expectedEffectivePriceOutOverIn =
      beforeSpotPriceOutOverIn.mulTruncate(new Dec(1).add(slippage));

    return {
      beforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn,
      minOutAmount: expectedEffectivePriceOutOverIn
        .mulTruncate(tokenIn.amount.toDec())
        .truncate(),
    };
  }
}