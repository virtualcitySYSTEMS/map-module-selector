<template>
  <AbstractConfigEditor
    @submit="apply"
    v-if="localConfig"
    v-bind="{ ...$attrs, ...$props }"
  >
    <v-container v-if="currentGroup === undefined" class="py-0 px-0">
      <VcsFormSection heading="moduleSelector.configEditor.general">
        <v-container class="py-0 px-1">
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="moduleselector-window-title">
                {{ $st('moduleSelector.configEditor.windowTitle') }}
              </VcsLabel>
            </v-col>
            <v-col>
              <VcsTextField
                id="moduleselector-window-title"
                :placeholder="$t('moduleSelector.title')"
                v-model="localConfig.windowTitle"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <VcsCheckbox
                v-model="localConfig.isActiveOnStart"
                label="moduleSelector.configEditor.isActiveOnStart"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <VcsCheckbox
                v-model="localConfig.requireModuleSelection"
                label="moduleSelector.configEditor.requireModuleSelection"
              />
            </v-col>
          </v-row>
        </v-container>
      </VcsFormSection>
      <VcsFormSection
        heading="moduleSelector.configEditor.windowPosition"
        :expandable="true"
      >
        <WindowPositionSettings
          v-model="localConfig.position!"
          :position-keys="[
            'top',
            'right',
            'bottom',
            'left',
            'width',
            'maxWidth',
            'height',
            'maxHeight',
          ]"
        />
      </VcsFormSection>
      <VcsFormSection heading="moduleSelector.configEditor.baseModule">
        <v-container class="py-0 px-1">
          <v-row no-gutters>
            <v-col>
              <VcsCheckbox
                id="BaseModuleCheckbox"
                v-model="basisModuleExists"
                label="moduleSelector.configEditor.baseModuleCheckbox"
              >
              </VcsCheckbox>
            </v-col>
          </v-row>
          <v-row v-if="basisModuleExists" no-gutters>
            <v-col cols="6">
              <VcsLabel required html-for="basisModuleName">
                {{ $st('moduleSelector.configEditor.title') }}
              </VcsLabel>
            </v-col>
            <v-col>
              <VcsTextField
                id="basisModuleName"
                placeholder="Base Module"
                :rules="[
                  basisModuleExists &&
                  (!basisModule.title || basisModule.title === '')
                    ? () => 'moduleSelector.configEditor.error'
                    : () => true,
                ]"
                v-model="basisModule.title"
              />
            </v-col>
          </v-row>
          <v-row v-if="basisModuleExists" no-gutters>
            <v-col cols="6">
              <VcsLabel required html-for="basisModuleIcon">
                {{ $st('components.style.icon') }}
              </VcsLabel>
            </v-col>
            <v-col>
              <VcsTextField
                id="basisModuleIcon"
                placeholder="mdi-home-city"
                :rules="[
                  basisModuleExists &&
                  (!basisModule.icon || basisModule.icon === '')
                    ? () => 'moduleSelector.configEditor.error'
                    : () => true,
                ]"
                v-model="basisModule.icon"
              />
            </v-col>
          </v-row>
        </v-container>
      </VcsFormSection>
    </v-container>
    <v-container v-else class="py-0 px-1">
      <v-breadcrumbs :items="breadcrumbItems" divider="/">
        <template #item="{ item }">
          <v-breadcrumbs-item
            :key="item.title"
            :disabled="item.disabled"
            :href="item.href"
            @click="item.disabled ? null : returnLevel()"
          >
            {{ item.title }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <v-row no-gutters>
        <v-col cols="6">
          <VcsLabel required html-for="groupModuleName">
            {{ $st('moduleSelector.configEditor.groupName') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            id="groupModuleName"
            placeholder="Module Name"
            v-model="currentGroup!.title"
            :rules="[(v: string) => !!v || 'moduleSelector.configEditor.error']"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="6">
          <VcsLabel required html-for="groupModuleIcon">
            {{ $st('moduleSelector.configEditor.moduleIcon') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            id="groupModuleIcon"
            placeholder="Module Icon"
            v-model="currentGroup!.icon"
            :rules="[
              (v: string) => !!v || 'moduleSelector.configEditor.editorError',
            ]"
          />
        </v-col>
      </v-row>
    </v-container>
    <VcsFormSection
      heading="moduleSelector.configEditor.heading"
      :start-open="true"
      :header-actions="headerActions"
      ><!--V-if currentItem group > cards || wenn url oder empty listItems-->
      <VcsList
        v-if="currentGroup === undefined"
        :items="listItemArray"
        :draggable="true"
        @item-moved="move"
      />
      <VcsList
        v-else
        :items="currentGroup.cards"
        :draggable="true"
        @item-moved="move"
      />
      <v-dialog
        v-if="editingItem"
        :model-value="true"
        width="400"
        :persistent="true"
      >
        <ModuleEditor
          :model-value="editingItem"
          @close="editingItem = undefined"
          @submit="updateItem()"
        />
      </v-dialog>
    </VcsFormSection>
  </AbstractConfigEditor>
</template>

<script lang="ts">
  import {
    AbstractConfigEditor,
    VcsAction,
    VcsCheckbox,
    VcsFormSection,
    VcsLabel,
    VcsList,
    VcsListItem,
    VcsTextField,
    VcsUiApp,
  } from '@vcmap/ui';
  import {
    computed,
    defineComponent,
    inject,
    PropType,
    reactive,
    Ref,
    ref,
    watch,
  } from 'vue';
  import {
    VBreadcrumbs,
    VBreadcrumbsItem,
    VCol,
    VContainer,
    VDialog,
    VRow,
  } from 'vuetify/components';
  import ModuleEditor from './ModuleEditor.vue';
  import { Module, ModuleSelectorConfig, ModuleType } from '../index';
  import getDefaultOptions from '../defaultOptions.js';
  import WindowPositionSettings from './WindowPositionSettings.vue';

  interface VcsListItemWithLabel extends VcsListItem {
    id: string;
    title: string;
    icon: string;
    type: string;
    moduleUrl?: string;
    cards?: VcsListItemWithLabel[];
  }

  export default defineComponent({
    name: 'ModuleSelectorConfigEditor',
    components: {
      VcsCheckbox,
      VDialog,
      VcsList,
      VcsFormSection,
      VRow,
      VcsLabel,
      AbstractConfigEditor,
      VcsTextField,
      VCol,
      VContainer,
      ModuleEditor,
      VBreadcrumbs,
      VBreadcrumbsItem,
      WindowPositionSettings,
    },
    props: {
      getConfig: {
        type: Function as PropType<() => ModuleSelectorConfig>,
        required: true,
      },
      setConfig: {
        type: Function as PropType<(c?: ModuleSelectorConfig) => void>,
        required: true,
      },
    },
    setup(props) {
      const app = inject('vcsApp') as VcsUiApp;
      const level = ref<number>(0);
      const localConfig = ref<ModuleSelectorConfig | undefined>(undefined);
      const listItemArray: Ref<VcsListItemWithLabel[]> = ref([]);
      const currentGroup: Ref<VcsListItemWithLabel | undefined> =
        ref(undefined);
      const editingItem: Ref<
        | { id: string; title: string; icon: string; moduleUrl: string }
        | undefined
      > = ref(undefined);
      const listItems: Ref<VcsListItemWithLabel[] | undefined> = ref(undefined);

      localConfig.value = { ...getDefaultOptions(), ...props.getConfig() };

      const basisModule = ref();

      if (localConfig.value?.basisModule) {
        basisModule.value = localConfig.value?.basisModule;
      }

      const basisModuleExists = computed({
        get() {
          return !!basisModule.value;
        },
        set(value: boolean) {
          if (value) {
            basisModule.value = localConfig.value?.basisModule || { title: '' };
          } else {
            basisModule.value = null;
          }
        },
      });
      const headerActions = reactive<VcsAction[]>([]);

      function removeIdAndActions(
        item: VcsListItemWithLabel,
      ): Module<ModuleType> {
        if (item.type === 'url') {
          return {
            title: item.title,
            type: item.type,
            icon: item.icon,
            moduleUrl: item.moduleUrl || '',
          } as Module<'url'>;
        } else {
          const updatedCards =
            item.cards?.map((card) => {
              return {
                title: card.title,
                icon: card.icon,
                moduleUrl: card.moduleUrl,
                type: card.type,
              };
            }) || [];
          return {
            title: item.title,
            type: item.type,
            icon: item.icon,
            ...(updatedCards.length ? { cards: updatedCards } : {}),
          } as Module<'group'>;
        }
      }

      const headerGroupAction = {
        name: 'moduleSelector.configEditor.addGroup',
        callback(): void {
          const newGroup = {
            type: 'group',
            name: '',
            id: '',
            title: 'title',
            icon: 'icon',
            cards: [],
          };

          listItemArray.value?.push(newGroup);
          currentGroup.value = newGroup;

          const newIndex = listItemArray.value.indexOf(newGroup);

          newGroup.id = `${newGroup.title}-${newIndex}`;

          headerActions.splice(1, 1);
          if (headerActions.length > 0) {
            headerActions[0].icon = '$vcsPlus';
            headerActions[0].title =
              'moduleSelector.configEditor.TooltipAddModule';
          }
        },
      };

      function removeIdAndActionsFromArray(
        items: VcsListItemWithLabel[],
      ): Module<ModuleType>[] {
        return items.map(removeIdAndActions);
      }

      function createListItem(
        moduleInfo: Module<ModuleType>,
        index: number,
      ): VcsListItemWithLabel {
        const listItemObject: VcsListItemWithLabel = {
          id: `${moduleInfo.title}-${index}`,
          name: moduleInfo.title,
          title: moduleInfo.title,
          icon: moduleInfo.icon,
          type: moduleInfo.type,
          actions: [],
        };
        if (moduleInfo.type === 'url') {
          listItemObject.moduleUrl = moduleInfo.moduleUrl;
          listItemObject.actions?.push({
            name: 'edit',
            title: 'moduleSelector.configEditor.TooltipEditModule',
            icon: '$vcsEdit',
            callback(): void {
              if (
                currentGroup.value === undefined &&
                listItemArray.value.length > 0
              ) {
                const item = listItemArray.value.find(
                  (i) => i.id === listItemObject.id,
                );

                if (item) {
                  editingItem.value = {
                    id: item.id,
                    title: item.title,
                    icon: item.icon,
                    moduleUrl: item.moduleUrl!,
                  };
                }
              } else {
                const item = currentGroup.value!.cards!.find(
                  (i) => i.id === listItemObject.id,
                );

                if (item) {
                  editingItem.value = {
                    id: item.id,
                    title: item.title,
                    icon: item.icon,
                    moduleUrl: item.moduleUrl!,
                  };
                }
              }
            },
          });
        }
        if (moduleInfo.type === 'group') {
          listItemObject.actions?.push({
            name: 'editGroup',
            title: 'moduleSelector.configEditor.TooltipEditGroup',
            icon: 'mdi-playlist-edit',
            callback(): void {
              if (listItemArray.value.length > 0) {
                const item = listItemArray.value.find(
                  (i) => i.id === listItemObject.id,
                );
                if (item) {
                  currentGroup.value = item;
                  headerActions.splice(1, 1);
                  if (headerActions.length > 0) {
                    headerActions[0].icon = '$vcsPlus';
                    headerActions[0].title =
                      'moduleSelector.configEditor.TooltipAddModule';
                  }
                }
              }
            },
          });
          if (moduleInfo.cards) {
            listItemObject.cards = moduleInfo.cards.map(createListItem);
          }
        }
        listItemObject.actions?.push({
          name: 'linkButton.editor.remove',
          title: 'moduleSelector.configEditor.TooltipDeleteMG',
          icon: '$vcsTrashCan',
          callback(): void {
            if (currentGroup.value) {
              currentGroup.value.cards = currentGroup.value?.cards?.filter(
                (item) => item.id !== listItemObject.id,
              );
            } else {
              listItemArray.value = listItemArray.value?.filter(
                (item) => item.id !== listItemObject.id,
              );
            }
          },
        });
        return listItemObject;
      }

      if (localConfig.value?.modules) {
        listItemArray.value = localConfig.value.modules.map(createListItem);
      }

      headerActions.push(
        {
          name: 'moduleSelector.configEditor.add',
          callback(): void {
            editingItem.value = {
              id: '',
              title: 'title',
              icon: 'icon',
              moduleUrl: 'url',
            };
          },
        },
        headerGroupAction,
      );
      watch(localConfig, (config) => {
        if (config?.modules) {
          listItems.value = config.modules.map((moduleInfo, index) =>
            createListItem(moduleInfo, index),
          );
        } else {
          listItems.value = [];
        }
      });

      const apply = (): void => {
        props.setConfig({
          ...localConfig.value,
          modules: removeIdAndActionsFromArray(listItemArray.value),
          basisModule: basisModule.value,
        });
      };

      const updateItem = (): void => {
        if (currentGroup.value === undefined) {
          if (editingItem.value) {
            if (editingItem.value?.id !== '') {
              const item = listItemArray.value.find(
                (i) => i.id === editingItem.value?.id,
              );
              if (item) {
                item.title = editingItem.value.title;
                item.icon = editingItem.value.icon;
                item.moduleUrl = editingItem.value.moduleUrl;
              }
            } else {
              listItemArray.value.push({
                id: `${editingItem.value.title}-${listItemArray.value.length}`,
                title: editingItem.value.title,
                name: editingItem.value.title,
                icon: editingItem.value.icon,
                moduleUrl: editingItem.value.moduleUrl,
                type: 'url',
              });

              const filteredItems = removeIdAndActionsFromArray(
                listItemArray.value,
              );

              listItemArray.value = filteredItems.map(createListItem);
            }
          }
        } else if (editingItem.value && editingItem.value?.id !== '') {
          const item = currentGroup.value.cards!.find(
            (i) => i.id === editingItem.value!.id,
          );
          if (item) {
            item.title = editingItem.value.title;
            item.icon = editingItem.value.icon;
            item.moduleUrl = editingItem.value.moduleUrl;
          }

          let groupId;
          if (currentGroup.value?.id || currentGroup.value?.id !== '') {
            groupId = currentGroup.value.id;
          } else {
            groupId = `${currentGroup.value.title}-${listItemArray.value.length - 1}`;
          }
          currentGroup.value = listItemArray.value.find(
            (i) => i.id === groupId,
          );
        } else {
          currentGroup.value.cards!.push({
            id: `${editingItem.value!.title}-${currentGroup.value?.cards?.length}`,
            title: editingItem.value!.title,
            name: editingItem.value!.title,
            icon: editingItem.value!.icon,
            moduleUrl: editingItem.value!.moduleUrl,
            type: 'url',
          });
          const filteredItems = removeIdAndActionsFromArray(
            listItemArray.value,
          );

          listItemArray.value = filteredItems.map(createListItem);

          let groupId;
          if (currentGroup.value?.id || currentGroup.value?.id !== '') {
            groupId = currentGroup.value.id;
          } else {
            groupId = `${currentGroup.value?.title}-${listItemArray.value.length - 1}`;
          }
          currentGroup.value = listItemArray.value?.find(
            (item) => item.id === groupId,
          );
        }

        editingItem.value = undefined;
      };

      const returnLevel = (): void => {
        currentGroup.value = undefined;
        if (headerActions.length > 0) {
          delete headerActions[0].icon;
          delete headerActions[0].title;
        }
        headerActions.push(headerGroupAction);
      };

      const breadcrumbItems = ref([
        {
          title: app.vueI18n.t(
            'moduleSelector.configEditor.breadcrumbs.overview',
          ),
          disabled: false,
          href: '#',
        },
        {
          title: app.vueI18n.t('moduleSelector.configEditor.breadcrumbs.group'),
          disabled: true,
          href: '#',
        },
      ]);
      watch(currentGroup, (currentG) => {
        if (currentG && currentG.title) {
          breadcrumbItems.value[1].title = `${app.vueI18n.t('moduleSelector.configEditor.breadcrumbs.group')}: ${currentG.title}`;
          currentG.name = currentG.title;
        }
      });
      return {
        editingItem,
        localConfig,
        listItemArray,
        breadcrumbItems,
        currentGroup,
        apply,
        returnLevel,
        updateItem,
        level,
        listItems: listItems as unknown as unknown[],
        basisModule,
        basisModuleExists,
        headerActions,
        move({
          item,
          targetIndex,
        }: {
          item: VcsListItemWithLabel;
          targetIndex: number;
        }): void {
          if (listItemArray.value && currentGroup.value === undefined) {
            let target = targetIndex;
            target = target >= 0 ? target : 0;
            target =
              target < listItemArray.value?.length
                ? target
                : listItemArray.value.length - 1;
            const from = listItemArray.value?.indexOf(item);
            if (from !== target) {
              listItemArray.value?.splice(from, 1);
              listItemArray.value?.splice(target, 0, item);
            }
          } else if ((currentGroup.value?.cards?.length ?? 0) > 1) {
            let target = targetIndex;
            target = target >= 0 ? target : 0;
            target =
              target < currentGroup.value!.cards!.length
                ? target
                : currentGroup.value!.cards!.length - 1;
            const from = currentGroup.value!.cards!.indexOf(item);
            if (from && from !== target) {
              currentGroup.value!.cards!.splice(from, 1);
              currentGroup.value!.cards!.splice(target, 0, item);
            }
          }
        },
      };
    },
  });
</script>

<style scoped>
  .v-breadcrumbs {
    padding: 16px 0 4px 0;
  }
</style>
