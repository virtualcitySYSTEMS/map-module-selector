import { ModuleSelectorConfig } from './index.js';

export default (): ModuleSelectorConfig => ({
  windowTitle: 'moduleSelector.title',
  isActiveOnStart: true,
  requireModuleSelection: false,
  position: {
    left: '33%',
    right: '33%',
    top: '10%',
  },
  basisModule: undefined,
  modules: [],
});
