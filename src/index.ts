import {
  ButtonLocation,
  createToggleAction,
  PluginConfigEditor,
  VcsPlugin,
  VcsUiApp,
  WindowPositionOptions,
  WindowSlot,
} from '@vcmap/ui';
import { Ref, ref } from 'vue';
import { parseBoolean, parseInteger } from '@vcsuite/parsers';
import equal from 'fast-deep-equal';
import { mapVersion, name, version } from '../package.json';
import moduleSelector from './ModuleSelector.vue';
import getDefaultOptions from './defaultOptions.js';
import ModuleSelectorConfigEditor from './config/ModuleSelectorConfigEditor.vue';
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
  serverUrl?: string;
  projectId?: string;
  appId?: string;
  token?: string;
  position?: WindowPositionOptions;
  basisModule?: BasisModule;
  modules?: Array<Module<ModuleType>>;
};

export type PluginState = {
  // selectedMainModuleIndex
  smi?: number | undefined | null;
  // selectedNestedModuleIndex
  snmi?: number | undefined | null;
  // module elector window open
  w?: boolean;
  modules?: Array<Module<ModuleType>>;
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
          infoUrlCallback: app.getHelpUrlCallback('/tools/moduleSelector.html'),
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
            configInput.modules!,
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
    getConfigEditors(): PluginConfigEditor<object>[] {
      return [
        {
          component: ModuleSelectorConfigEditor,
          title: 'moduleSelector.name',
          infoUrlCallback: app.getHelpUrlCallback(
            '/components/plugins/moduleSelectorConfig.html',
            'app-configurator',
          ),
        },
      ];
    },
    toJSON(): Partial<ModuleSelectorConfig> {
      const serial: Partial<ModuleSelectorConfig> = {};
      const defaultOptions = getDefaultOptions();
      if (this.config.windowTitle !== defaultOptions.windowTitle) {
        serial.windowTitle = this.config.windowTitle;
      }

      if (this.config.isActiveOnStart !== defaultOptions.isActiveOnStart) {
        serial.isActiveOnStart = this.config.isActiveOnStart;
      }

      if (
        this.config.requireModuleSelection !==
        defaultOptions.requireModuleSelection
      ) {
        serial.requireModuleSelection = this.config.requireModuleSelection;
      }

      if (!equal(this.config.position, defaultOptions.position)) {
        serial.position = this.config.position;
      }

      if (!equal(this.config.modules, defaultOptions.modules)) {
        serial.modules = this.config.modules;
      }

      if (!equal(this.config.basisModule, defaultOptions.basisModule)) {
        serial.basisModule = this.config.basisModule;
      }

      if (configInput.serverUrl != null) {
        serial.serverUrl = configInput.serverUrl;
      }

      if (configInput.projectId != null) {
        serial.projectId = configInput.projectId;
      }

      if (configInput.appId != null) {
        serial.appId = configInput.appId;
      }

      if (configInput.token != null) {
        serial.token = configInput.token;
      }

      return serial;
    },
    i18n: {
      de: {
        moduleSelector: {
          name: 'Modul Auswahl Editor',
          title: 'Themenkartenauswahl',
          startButton: 'Anwendung starten',
          cardBack: 'Zurück',
          configEditor: {
            moduleCloudPicker: {
              searchName: 'Suche nach Name...',
              continue: 'Weiter',
              back: 'Zurück',
              headers: {
                name: 'Modul Name',
                type: 'Typ',
                description: 'Beschreibung',
                createdAt: 'Erzeugt am',
                updatedAt: 'Aktualisiert am',
                createdBy: 'Erzeugt von',
                updatedBy: 'Aktualisiert von',
              },
            },
            TooltipAddModule: 'Modul hinzufügen',
            TooltipEditModule: 'Modul bearbeiten',
            TooltipEditGroup: 'Modul-Gruppe bearbeiten',
            TooltipDeleteMG: 'Modul/Gruppe löschen',
            error: 'Bitte tragen Sie einen Namen ein',
            editorError: 'Bitte füllen Sie das Feld aus',
            breadcrumbs: { overview: 'Übersicht', group: 'Gruppe' },
            heading: 'Themen- & Modulzuordnung',
            baseModule: 'Basismodul',
            baseModuleCheckbox: 'Basismodul anzeigen',
            title: 'Titel',
            add: 'Module hinzufügen',
            addGroup: 'Module Gruppe hinzufügen',
            moduleName: 'Module Name',
            moduleIcon: 'Icon Name',
            moduleUrl: 'Module URL',
            groupName: 'Gruppen Name',
            back: 'Zurück',
            general: 'Allgemeine Einstellungen',
            isActiveOnStart: 'Themenkartenauswahl beim Start der Karte zeigen',
            requireModuleSelection: 'Modulauswahl erforderlich machen',
            windowTitle: 'Fenster Titel',
            windowPosition: 'Fenster Position',
          },
        },
      },
      en: {
        moduleSelector: {
          name: 'Module Selector Editor',
          title: 'Theme map selection',
          startButton: 'Start application',
          cardBack: 'Back',
          configEditor: {
            moduleCloudPicker: {
              searchName: 'Search for name...',
              continue: 'Continue',
              back: 'Back',
              headers: {
                name: 'Module name',
                type: 'Type',
                description: 'Description',
                createdAt: 'Created at',
                updatedAt: 'Updated at',
                createdBy: 'Created by',
                updatedBy: 'Updated by',
              },
            },
            TooltipAddModule: 'Add module',
            TooltipEditModule: 'Edit module',
            TooltipEditGroup: 'Edit module group',
            TooltipDeleteMG: 'Delete module/group',
            error: 'Please add a name',
            editorError: 'Please fill in the field',
            breadcrumbs: { overview: 'Overview', group: 'Group' },
            heading: 'Topic & module assignment',
            baseModule: 'Base module',
            baseModuleCheckbox: 'Show base module',
            title: 'Title',
            add: 'Add module',
            addGroup: 'Add module Group',
            moduleName: 'Module name',
            moduleIcon: 'Icon name',
            moduleUrl: 'Module URL',
            groupName: 'Group name',
            back: 'Back',
            general: 'General settings',
            isActiveOnStart: 'Show theme map selection on map start',
            requireModuleSelection: 'Require module selection',
            windowTitle: 'Window title',
            windowPosition: 'Window position',
          },
        },
      },
    },
    destroy(): void {},
  };
}
