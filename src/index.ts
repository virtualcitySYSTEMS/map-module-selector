import {
  VcsPlugin,
  VcsUiApp,
  WindowSlot,
  ButtonLocation,
  WindowPositionOptions,
  createToggleAction,
} from '@vcmap/ui';
import { Ref, ref } from 'vue';
import { name, version, mapVersion } from '../package.json';
import moduleSelector, { windowIdModuleSelector } from './ModuleSelector.vue';
import getDefaultOptions from './defaultOptions.js';

export type BasisModule = {
  title: string;
  icon: string;
};

export type ModuleType = 'group' | 'url';

export type Module<T extends ModuleType> = T extends 'group'
  ? BasisModule & { type: T; cards: Module<'url'>[] }
  : T extends 'url'
    ? BasisModule & { moduleUrl: string; type: T }
    : never;

type PluginConfig = Record<never, never>;
type PluginState = Record<never, never>;

export type ModuleSelectorConfig = PluginConfig & {
  windowTitle?: string;
  isActiveOnStart?: boolean;
  requireModuleSelection?: boolean;
  position?: WindowPositionOptions;
  basisModule?: BasisModule;
  modules: Array<Module<ModuleType>>;
};

export type ModuleSelectorPlugin = VcsPlugin<PluginConfig, PluginState> & {
  readonly config: ModuleSelectorConfig;
  selectedMainModuleIndex: Ref<number | undefined | null>;
  selectedNestedModuleIndex: Ref<number | undefined | null>;
};

export default function plugin(
  configInput: ModuleSelectorConfig,
): ModuleSelectorPlugin {
  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    get config(): ModuleSelectorConfig {
      return { ...getDefaultOptions(), ...configInput } as ModuleSelectorConfig;
    },
    selectedMainModuleIndex: ref(undefined),
    selectedNestedModuleIndex: ref(undefined),
    initialize(vcsUiApp: VcsUiApp): Promise<void> {
      const moduleSelectorComponent = {
        id: windowIdModuleSelector,
        component: moduleSelector,
        slot: WindowSlot.DETACHED,
        position: this.config.position,
        state: {
          headerTitle: this.config.windowTitle,
        },
        props: {
          modules: this.config.modules,
          basisModule: this.config.basisModule,
          requireModuleSelection: this.config.requireModuleSelection,
        },
      };

      const { action } = createToggleAction(
        {
          name: 'moduleSelector',
          title: 'moduleSelector.title',
          icon: 'mdi-view-grid',
        },
        moduleSelectorComponent,
        vcsUiApp.windowManager,
        name,
      );

      vcsUiApp.navbarManager.add(
        {
          id: action.name,
          action,
        },
        name,
        ButtonLocation.PROJECT,
      );

      if (configInput.isActiveOnStart) {
        vcsUiApp.windowManager.add(moduleSelectorComponent, name);
      }

      return Promise.resolve();
    },
    getDefaultOptions,
    toJSON(): Partial<ModuleSelectorConfig> {
      const serial: Partial<ModuleSelectorConfig> = {};
      if (configInput.windowTitle != null) {
        serial.windowTitle = configInput.windowTitle;
      }

      if (configInput.position != null) {
        serial.position = configInput.position;
      }

      if (configInput.modules != null) {
        serial.modules = configInput.modules;
      }
      return serial;
    },
    i18n: {
      de: {
        moduleSelector: {
          title: 'Themenkartenauswahl',
          startButton: 'Anwendung starten',
          cardBack: 'Zurück',
        },
      },
      en: {
        moduleSelector: {
          title: 'Theme map selection',
          startButton: 'Start application',
          cardBack: 'Back',
        },
      },
    },
    destroy(): void {},
  };
}
