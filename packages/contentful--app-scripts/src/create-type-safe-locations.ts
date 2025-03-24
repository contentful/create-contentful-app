import { LocationsSettings } from './types';

export function createTypeSafeLocations(settings: LocationsSettings) {
  const { locations, fields, pageNav, pageNavLinkName, pageNavLinkPath } = settings;
  return locations.map((location) => {
    if (location === 'entry-field') {
      return {
        location,
        fieldTypes: fields || [],
      };
    }

    if (location === 'page') {
      return {
        location,
        ...(pageNav
          ? {
              navigationItem: {
                name: pageNavLinkName,
                path: pageNavLinkPath,
              },
            }
          : {}),
      };
    }

    return {
      location,
    };
  });
}
