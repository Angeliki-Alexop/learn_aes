// Central feature flags for the app.
// Keep keys snake_cased to match existing naming decisions.
const featureFlags = {
  // When true, the step-by-step decryption submit flow is enabled.
  // Toggle to false to disable the Submit button for Decryption mode.
  enable_stepbystep_decryption: false,
  // When true, inverse practice exercises (InvShiftRows, InvSubBytes,
  // InvMixColumns) are shown on the Train page. If set to false,
  // those inverse exercises will be hidden.
  enable_train_inverse_steps: false,
};

export default featureFlags;
