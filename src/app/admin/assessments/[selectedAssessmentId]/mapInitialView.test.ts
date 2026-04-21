import assert from "node:assert/strict";
import test from "node:test";

import {
  getInitialViewTargetKey,
  InitialViewTarget,
} from "./mapInitialView";

test("returns the same key for the same geolocation target", () => {
  const target: InitialViewTarget = {
    type: "geolocation",
  };

  assert.equal(getInitialViewTargetKey(target), getInitialViewTargetKey(target));
});

test("returns the same key for equal extents", () => {
  const first: InitialViewTarget = {
    type: "location-polygon",
    extent: [1, 2, 3, 4],
  };
  const second: InitialViewTarget = {
    type: "location-polygon",
    extent: [1, 2, 3, 4],
  };

  assert.equal(getInitialViewTargetKey(first), getInitialViewTargetKey(second));
});

test("returns different keys for different targets", () => {
  const geolocation: InitialViewTarget = {
    type: "geolocation",
  };
  const polygon: InitialViewTarget = {
    type: "response-geometries",
    extent: [1, 2, 3, 4],
  };

  assert.notEqual(
    getInitialViewTargetKey(geolocation),
    getInitialViewTargetKey(polygon),
  );
});
