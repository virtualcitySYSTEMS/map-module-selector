import {
  ButtonLocation,
  createToggleAction,
  VcsPlugin,
  VcsUiApp,
  WindowPositionOptions,
  WindowSlot,
} from '@vcmap/ui';
import { Ref, ref } from 'vue';
import { parseBoolean, parseInteger } from '@vcsuite/parsers';
import { mapVersion, name, version } from '../package.json';
import moduleSelector from './ModuleSelector.vue';
import getDefaultOptions from './defaultOptions.js';
import { startApplication, windowIdModuleSelector } from './moduleHelper';

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

export type ModuleSelectorConfig = {
  windowTitle?: string;
  isActiveOnStart?: boolean;
  requireModuleSelection?: boolean;
  position?: WindowPositionOptions;
  basisModule?: BasisModule;
  modules: Array<Module<ModuleType>>;
};

export type PluginState = {
  // selectedMainModuleIndex
  smi?: number | undefined | null;
  // selectedNestedModuleIndex
  snmi?: number | undefined | null;
  // module elector window open
  w?: boolean;
};

export type ModuleSelectorPlugin = VcsPlugin<
  Partial<ModuleSelectorConfig>,
  PluginState
> & {
  readonly config: ModuleSelectorConfig;
  selectedMainModuleIndex: Ref<number | undefined | null>;
  selectedNestedModuleIndex: Ref<number | undefined | null>;
};

export default function plugin(
  configInput: ModuleSelectorConfig,
): ModuleSelectorPlugin {
  let app: VcsUiApp;
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
    async initialize(
      vcsUiApp: VcsUiApp,
      state: PluginState | undefined,
    ): Promise<void> {
      app = vcsUiApp;
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
      if (state) {
        const smi = parseInteger(state.smi);
        const snmi = parseInteger(state.snmi);
        const w = parseBoolean(state.w);
        const { modules } = this.config;

        if (smi !== undefined && smi < modules?.length) {
          this.selectedMainModuleIndex.value = smi;
          const selectedModule = modules[smi];

          if (
            snmi !== undefined &&
            selectedModule?.type === 'group' &&
            snmi < selectedModule?.cards?.length
          ) {
            this.selectedNestedModuleIndex.value = snmi;
          }
        }

        if (!w) {
          await startApplication(
            this.selectedMainModuleIndex.value,
            this.selectedNestedModuleIndex.value,
            app,
            configInput.modules,
            configInput.basisModule,
          );
        }
      }

      const { action } = createToggleAction(
        {
          name: 'moduleSelector',
          title: 'moduleSelector.title',
          icon: 'mdi-view-grid',
        },
        moduleSelectorComponent,
        app.windowManager,
        name,
      );

      app.navbarManager.add(
        {
          id: action.name,
          action,
        },
        name,
        ButtonLocation.PROJECT,
      );

      if ((state && state.w) || (!state && configInput.isActiveOnStart)) {
        app.windowManager.add(moduleSelectorComponent, name);
      }

      return Promise.resolve();
    },
    getDefaultOptions,
    getState(): PluginState {
      const smi = this.selectedMainModuleIndex?.value;
      const snmi = this.selectedNestedModuleIndex?.value;
      const windowState = app.windowManager.has(windowIdModuleSelector);
      const isActive = this.config.isActiveOnStart;

      return smi !== undefined || snmi !== undefined || windowState !== isActive
        ? { smi, snmi, w: windowState }
        : {};
    },
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
