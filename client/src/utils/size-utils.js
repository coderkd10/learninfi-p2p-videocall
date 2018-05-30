// determine height, width given target aspect ratio
// and max width, max height
const computeDimensions = ({
    aspectRatio, // ratio of width : height
    maxWidth,
    maxHeight,
}) => {
    // either we'll occupy full width or full height
    // W, H, r
    // ans -> parameterized by h :  w = rh, h
    // h <= H
    // rh <= H => h <= W/r
    // find larget h that satisfies these conditions
    // h_ans = min (H, W/r)
    const height = Math.min(maxHeight, maxWidth / aspectRatio);
    const width = aspectRatio * height;
    return {
        width, height
    };
}

export default computeDimensions;
