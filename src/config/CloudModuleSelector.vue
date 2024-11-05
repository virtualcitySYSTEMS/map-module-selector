<template>
  <v-card>
    <div>
      <VcsDataTable
        v-if="isItemIdEmpty"
        base-component="VDataTableServer"
        :loading="loading"
        :items="items"
        :server-items-length="totalItems"
        :server-pages-length="totalPages"
        :searchbar-placeholder="
          $t('moduleSelector.configEditor.moduleCloudPicker.searchName')
        "
        :headers="headers"
        select-strategy="single"
        return-object
        show-select
        item-value="_id"
        v-model="selected"
        @update:items="getItems"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:item.type="{ item }">
          <v-icon v-bind="{ ...$attrs }">
            {{ typeIcon(item.type) }}
          </v-icon>
          <v-tooltip activator="parent" location="right">
            {{ $t(`appConfigurator.dialogs.vcsModuleTable.${item.type}`) }}
          </v-tooltip>
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt, $i18n.locale) }}
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.updatedAt="{ item }">
          {{ formatDate(item.updatedAt, $i18n.locale) }}
        </template>
      </VcsDataTable>
      <VcsFormSection v-else>
        <v-form v-model="isFValid" ref="form">
          <v-container class="px-2 pt-0 pb-2">
            <v-row no-gutters class="px-2">
              <v-col cols="2">
                <VcsLabel required html-for="moduleName">
                  {{ $st('moduleSelector.configEditor.moduleName') }}
                </VcsLabel>
              </v-col>
              <v-col cols="4">
                <VcsTextField
                  id="moduleName"
                  placeholder="Module Name"
                  v-model="selectedItem.title"
                  :rules="[requiredRule]"
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="px-2">
              <v-col cols="2">
                <VcsLabel required html-for="moduleIcon">
                  {{ $st('moduleSelector.configEditor.moduleIcon') }}
                </VcsLabel>
              </v-col>
              <v-col cols="4">
                <VcsTextField
                  id="moduleIcon"
                  placeholder="Icon Name"
                  v-model="selectedItem.icon"
                  :rules="[requiredRule]"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </VcsFormSection>
      <div class="d-flex px-2">
        <VcsFormButton
          v-if="isItemIdEmpty"
          variant="filled"
          :disabled="selected[0] === undefined"
          class="ma-2"
          @click="addSelected"
          tooltip="appConfigurator.dialogs.addTooltip"
          tooltip-position="bottom"
        >
          {{ $t('moduleSelector.configEditor.moduleCloudPicker.continue') }}
        </VcsFormButton>
        <VcsFormButton
          v-if="!isItemIdEmpty"
          :disabled="!isFValid"
          variant="filled"
          class="ma-2"
          @click="
            () => {
              $emit('submit', selectedItem);
            }
          "
        >
          {{ $t('components.apply') }}
        </VcsFormButton>
        <VcsFormButton
          v-if="!isItemIdEmpty"
          @click="removeSelected"
          class="ma-2"
        >
          {{ $t('moduleSelector.configEditor.moduleCloudPicker.back') }}
        </VcsFormButton>
        <VcsFormButton class="ma-2" @click="close">
          {{ $t('components.cancel') }}
        </VcsFormButton>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
  import {
    UpdateItemsEvent,
    VcsDataTable,
    VcsFormButton,
    VcsUiApp,
    VcsLabel,
    VcsTextField,
    VcsFormSection,
    VcsPlugin,
  } from '@vcmap/ui';
  import { computed, defineComponent, inject, PropType, ref } from 'vue';
  import {
    VIcon,
    VTooltip,
    VCard,
    VRow,
    VCol,
    VContainer,
    VForm,
  } from 'vuetify/components';
  import {
    getProjectModules,
    type GetProjectModulesResponse,
  } from '@vcsuite/publisher-sdk';
  import { VcsModule, VcsModuleConfig } from '@vcmap/core';
  import { getLogger } from '@vcsuite/logger';
  import { name as pluginName } from '../../package.json';
  import { type ModuleSelectorPlugin } from '../index.js';
  import { setupPublisherSDK } from './setupPublisherSDK';

  type ModuleTableItem = GetProjectModulesResponse['items'][number] & {
    type: string;
    disabled: boolean;
  };

  /**
   * Adds a config as module to the app
   * @param app
   * @param config
   */
  export async function loadConfig(
    app: VcsUiApp,
    config: VcsModuleConfig,
  ): Promise<void> {
    if (config?._id && !app.getModuleById(config._id)) {
      const module = new VcsModule(config);
      config._id = config._id ?? module._id;
      await app.addModule(module);
    }
  }

  function formatDate(date: string, locale: string): string {
    return new Date(date).toLocaleString(locale);
  }

  function getDefaultTableHeaders(): {
    title: string;
    value: string;
    sortable?: boolean;
    sort?: (a: string, b: string) => number | null;
  }[] {
    return [
      {
        title: 'moduleSelector.configEditor.moduleCloudPicker.headers.name',
        value: 'name',
      },
      {
        title: 'moduleSelector.configEditor.moduleCloudPicker.headers.type',
        value: 'type',
        sortable: false,
      },
      {
        title:
          'moduleSelector.configEditor.moduleCloudPicker.headers.description',
        value: 'description',
      },
      {
        title:
          'moduleSelector.configEditor.moduleCloudPicker.headers.createdAt',
        value: 'createdAt',
        sort: (a: string, b: string): number =>
          new Date(b).getTime() - new Date(a).getTime(),
      },
      {
        title:
          'moduleSelector.configEditor.moduleCloudPicker.headers.updatedAt',
        value: 'updatedAt',
        sort: (a: string, b: string): number =>
          new Date(b).getTime() - new Date(a).getTime(),
      },
      {
        title:
          'moduleSelector.configEditor.moduleCloudPicker.headers.createdBy',
        value: 'createdBy',
      },
      {
        title:
          'moduleSelector.configEditor.moduleCloudPicker.headers.updatedBy',
        value: 'updatedBy',
      },
    ];
  }

  export const windowIdVcsModuleTable = 'vcsModuleTable_window_id';
  export default defineComponent({
    name: 'CloudModuleSelector',
    components: {
      VcsDataTable,
      VcsFormButton,
      VTooltip,
      VIcon,
      VCard,
      VcsLabel,
      VcsTextField,
      VcsFormSection,
      VRow,
      VCol,
      VForm,
      VContainer,
    },
    props: {
      modelValue: {
        type: Object as PropType<{
          id: string;
          title: string;
          icon: string;
          moduleUrl: string;
        }>,
        required: true,
      },
    },
    setup(props, { emit }) {
      const app = inject<VcsUiApp>('vcsApp')!;
      const plugin = app.plugins.getByKey(pluginName)! as ModuleSelectorPlugin;
      const appConfigurator = app.plugins.getByKey(
        '@vcmap/app-configurator',
      ) as VcsPlugin<object, object> & {
        getUserName(userId: string): string;
        config: object & { projectId: string };
      };

      setupPublisherSDK(appConfigurator.config || plugin.config);

      const loading = ref(true);
      const items = ref<ModuleTableItem[]>([]);
      const totalItems = ref(0);
      const totalPages = ref(0);
      const selected = ref<
        [
          | { _id: string; name: string; icon: string; moduleUrl: string }
          | undefined,
        ]
      >([undefined]);
      const headers = getDefaultTableHeaders();
      const configMap = new Map<string, VcsModuleConfig>();
      const selectedItem = ref<{
        id: string;
        title: string;
        icon: string;
        moduleUrl: string;
      }>(props.modelValue);
      const isItemIdEmpty = computed(() => selectedItem.value.id === '');

      const isFValid = ref(false);

      const validateForm = (): void => {
        isFValid.value =
          !!selectedItem.value?.title && !!selectedItem.value?.icon;
      };

      const TypeIcons = {
        standalone: '$vcsGlobeNature',
        extension: '$vcsShapes',
      };

      function getItems(options: UpdateItemsEvent): void {
        const { itemsPerPage, page, search, sortBy, sortDesc } = options;
        loading.value = true;
        if (appConfigurator?.config?.projectId) {
          getProjectModules({
            projectId: appConfigurator.config.projectId,
            limit: itemsPerPage,
            page: page - 1,
            name: search,
            orderBy: sortBy,
            sort: sortDesc?.[0] ? 'desc' : 'asc',
          })
            .then((data) => {
              items.value = data.items.map((i) => {
                const dataTableEntry = {
                  name: i.name,
                  description: i.description,
                  createdAt: i.createdAt,
                  updatedAt: i.updatedAt,
                  createdBy:
                    appConfigurator?.getUserName(i.createdBy) || i.createdBy,
                  updatedBy:
                    appConfigurator?.getUserName(i.updatedBy) || i.updatedBy,

                  _id: i._id,
                } as ModuleTableItem;

                if ((i.maps?.length ?? 0) > 0 && (i.layers?.length ?? 0) > 0) {
                  dataTableEntry.type = 'standalone';
                } else {
                  dataTableEntry.type = 'extension';
                }
                dataTableEntry.disabled = !!app.getModuleById(i._id);
                configMap.set(i._id, i as VcsModuleConfig);
                return dataTableEntry;
              });
              totalItems.value = data.totalCount;
              totalPages.value = data.totalPages;
            })
            .catch((err) => {
              getLogger('CloudModuleSelector.vue').error(
                'Failed to load project modules.',
                err,
              );
            })
            .finally(() => {
              loading.value = false;
            });
        }
      }

      const close = (): void => {
        emit('close');
      };

      const addSelected = (): void => {
        if (selected.value.length > 0 && selected.value[0]?._id !== '') {
          selectedItem.value.id = selected.value[0]!._id;
          selectedItem.value.title = selected.value[0]!.name;
          selectedItem.value.icon = '';
          selectedItem.value.moduleUrl = `configs/${selected.value[0]!._id}.json`;
        }
      };
      const removeSelected = (): void => {
        selectedItem.value.id = '';
        selectedItem.value.title = '';
        selectedItem.value.icon = '';
        selectedItem.value.moduleUrl = '';
      };

      const requiredRule = (value: string): string | boolean =>
        !!value || 'moduleSelector.configEditor.editorError';

      return {
        selectedItem,
        isItemIdEmpty,
        loading,
        items,
        totalItems,
        totalPages,
        headers,
        selected,
        typeIcon(type: keyof typeof TypeIcons): string {
          return TypeIcons[type];
        },
        formatDate,
        getItems,
        close,
        addSelected,
        isFValid,
        validateForm,
        removeSelected,
        requiredRule,
      };
    },
  });
</script>

<style scoped></style>
