export default {
  appConfig: {
    modules: [
      {
        properties: {},
        name: 'Module',
        createdAt: '2024-10-11T07:45:26.387Z',
        updatedAt: '2024-10-11T07:45:26.387Z',
        createdBy: 'v6WEM2A92ozfZaAu5',
        updatedBy: 'v6WEM2A92ozfZaAu5',
        projectId: 'LgNWd3KWcGgcQZTBN',
        maps: [
          {
            type: 'CesiumMap',
            name: 'CesiumMap',
          },
        ],
        layers: [
          {
            type: 'OpenStreetMapLayer',
            name: 'OpenStreetMapLayer(1)',
            properties: {
              attributions: {
                provider: 'OpenStreetMap contributors',
                url: 'http://www.openstreetmap.org/',
                year: '2024',
              },
            },
            activeOnStartup: true,
            zIndex: 0,
          },
        ],
        obliqueCollections: [],
        viewpoints: [],
        styles: [],
        hiddenObjects: [],
        flights: [],
        categories: [],
        uiConfig: [],
        featureInfo: [],
        i18n: [],
        contentTree: [
          {
            type: 'LayerContentTreeItem',
            name: 'OpenStreetMapLayer(1)',
            layerName: 'OpenStreetMapLayer(1)',
          },
        ],
        plugins: [
          {
            name: '@vcmap/create-link',
            entry: 'plugins/@vcmap/create-link/index.js?mapVersion=5.3.7',
          },
        ],
        startingMapName: 'CesiumMap',
      },
    ],
  },
};
