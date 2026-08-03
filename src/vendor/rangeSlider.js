// Runtime re-export of the native range slider. Kept as a .js file with a
// sibling rangeSlider.d.ts so TypeScript resolves the (clean) types from the
// .d.ts and never compiles rn-range-slider's raw .tsx source, which fails strict
// type-checking. Metro bundles this .js, which pulls in the real native module.
export { default } from 'rn-range-slider';
