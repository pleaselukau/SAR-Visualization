import * as d3 from "d3";

/**
 * Cartesian fisheye distortion for D3 scales.
 * Preserves axes as straight lines (unlike circular fisheye).
 * Adapted from Mike Bostock's original code: https://bost.ocks.org/mike/fisheye/
 */
export function d3_fisheye_scale(scale, distortion = 3, focus = 0) {
  function fisheye(x) {
    const s = scale(x);
    const left = s < focus;
    const range = scale.range();
    let min = range[0],
      max = range[1];
    let m = left ? focus - min : max - focus;
    if (m === 0) m = max - min;
    return (
      ((left ? -1 : 1) * m * (distortion + 1)) /
        (distortion + m / Math.abs(s - focus)) +
      focus
    );
  }

  // Chainable setters/getters
  fisheye.distortion = function (_) {
    if (!arguments.length) return distortion;
    distortion = +_;
    return fisheye;
  };

  fisheye.focus = function (_) {
    if (!arguments.length) return focus;
    focus = +_;
    return fisheye;
  };

  fisheye.copy = function () {
    return d3_fisheye_scale(scale.copy(), distortion, focus);
  };

  // Expose underlying scale methods
  fisheye.nice = function () {
    scale.nice();
    return fisheye;
  };
  fisheye.ticks = (...args) => scale.ticks(...args);
  fisheye.tickFormat = (...args) => scale.tickFormat(...args);

  // Rebind domain and range manually
  fisheye.domain = function (_) {
    if (!arguments.length) return scale.domain();
    scale.domain(_);
    return fisheye;
  };

  fisheye.range = function (_) {
    if (!arguments.length) return scale.range();
    scale.range(_);
    return fisheye;
  };

  return fisheye;
}

// Convenience factory
export const fisheye = {
  scale: function (scaleType, distortion = 3, focus = 0) {
    return d3_fisheye_scale(scaleType(), distortion, focus);
  },
};
