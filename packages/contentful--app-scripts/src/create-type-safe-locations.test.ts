import assert from 'assert';
import { createTypeSafeLocations } from "./create-type-safe-locations"; // Update with actual file path
import { LocationsSettings } from "./types";

describe("createTypeSafeLocations", () => {
  it("should return mapped locations with fieldTypes for entry-field", () => {
    const settings: LocationsSettings = {
      locations: ["entry-field"],
      fields: [{ type: "Text" }, { type: "Number" }],
    };

    const result = createTypeSafeLocations(settings);

    assert.deepEqual(result, [
      {
        location: "entry-field",
        fieldTypes: [{ type: "Text" }, { type: "Number" }],
      },
    ]);
  });

  it("should return mapped locations with navigationItem for page", () => {
    const settings: LocationsSettings = {
      locations: ["page"],
      pageNav: true,
      pageNavLinkName: "Home",
      pageNavLinkPath: "/home",
    };

    const result = createTypeSafeLocations(settings);

    assert.deepEqual(result, [
      {
        location: "page",
        navigationItem: {
          name: "Home",
          path: "/home",
        },
      },
    ]);
  });

  it("should return mapped locations without navigationItem if pageNav is false", () => {
    const settings: LocationsSettings = {
      locations: ["page"],
      pageNav: false,
    };

    const result = createTypeSafeLocations(settings);

    assert.deepEqual(result, [
      {
        location: "page",
      },
    ]);
  });

  it("should return an array of objects with just location for unknown locations", () => {
    const settings: LocationsSettings = {
      locations: ["app-config"],
    };

    const result = createTypeSafeLocations(settings);

    assert.deepEqual(result, [
      {
        location: "app-config",
      },
    ]);
  });

  it("should return an empty array if locations array is empty", () => {
    const settings: LocationsSettings = {
      locations: [],
    };

    const result = createTypeSafeLocations(settings);

    assert.deepEqual(result, []);
  });
});
