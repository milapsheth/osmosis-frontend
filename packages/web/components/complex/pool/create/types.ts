import { ObservableCreatePoolConfig } from "@osmosis-labs/stores";
import { CustomClasses } from "../../../types";

export interface StepProps extends CustomClasses {
  createPoolConfig: ObservableCreatePoolConfig;
  backStep: () => void;
  advanceStep: () => void;
}