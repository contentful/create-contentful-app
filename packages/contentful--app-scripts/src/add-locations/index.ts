import { AddLocationsOptions } from "../types";
import { add } from "./add-locations";
import { buildAddLocationsSettings } from "./build-add-locations-settings";


const interactive = async (options: AddLocationsOptions) => {
  const settings = await buildAddLocationsSettings(options);
  await add(settings);
};

const nonInteractive = async () => {
  throw new Error(`"add-locations" is not available in non-interactive mode`);
};

export const addLocations = {
  interactive,
  nonInteractive,
};