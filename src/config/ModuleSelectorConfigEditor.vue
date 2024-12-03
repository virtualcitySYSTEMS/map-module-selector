<template>
  <AbstractConfigEditor
    @submit="apply"
    v-if="localConfig"
    v-bind="{ ...$attrs, ...$props }"
  >
    <v-container class="py-0 px-0">
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
                :placeholder="$st('moduleSelector.title')"
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
          <v-row v-if="basisModuleExists" no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="basisModuleDescription">
                {{ $st('moduleSelector.configEditor.moduleDescription') }}
              </VcsLabel>
            </v-col>
            <v-col>
              <VcsTextArea
                id="basisModuleDescription"
                v-model="basisModule.description"
              />
            </v-col>
          </v-row>
        </v-container>
      </VcsFormSection>
    </v-container>
    <v-dialog v-model="groupItemDialogVisible" width="800" :persistent="true">
      <v-sheet v-if="currentGroup">
        <VcsFormSection
          heading="moduleSelector.configEditor.groupHeading"
          :start-open="true"
        >
          <v-form v-model="isFormValid">
            <v-container class="py-0 px-1">
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
                    v-model="currentGroup.title"
                    :rules="[isRequired]"
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
                    v-model="currentGroup.icon"
                    :rules="[isRequired]"
                  />
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="6">
                  <VcsLabel html-for="groupModuleDescription">
                    {{ $st('moduleSelector.configEditor.groupDescription') }}
                  </VcsLabel>
                </v-col>
                <v-col>
                  <VcsTextArea
                    id="groupModuleDescription"
                    placeholder=""
                    v-model="currentGroup.description"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </VcsFormSection>
        <VcsFormSection
          heading="moduleSelector.configEditor.heading"
          :start-open="true"
          :header-actions="headerActions"
        >
          <VcsList
            class="draggable-list"
            :items="currentGroup.cards"
            :draggable="true"
            @item-moved="moveCard"
          />
        </VcsFormSection>
        <div class="d-flex px-2 justify-end w-100">
          <VcsFormButton
            variant="filled"
            class="ma-2"
            :disabled="!isFormValid"
            @click="returnLevel()"
          >
            {{ $t('components.apply') }}
          </VcsFormButton>
          <VcsFormButton class="ma-2" @click="cancelCurrentGroup()">
            {{ $t('components.cancel') }}
          </VcsFormButton>
        </div>
      </v-sheet>
    </v-dialog>

    <VcsFormSection
      heading="moduleSelector.configEditor.heading"
      :start-open="true"
      :header-actions="headerActions"
    >
      <VcsList
        :items="listItemArray"
        :draggable="true"
        @item-moved="moveItem"
      />

      <v-dialog
        v-model="editingItemDialogVisible"
        width="400"
        :persistent="true"
      >
        <ModuleEditor
          :model-value="editingItem"
          @close="editingItemDialogVisible = false"
          @submit="updateItem()"
        />
      </v-dialog>
      <v-dialog
        v-model="selectCloudItemDialogVisible"
        width="1000"
        :persistent="true"
      >
        <VcsModuleTable
          :model-value="selectCloudItem"
          @close="selectCloudItemDialogVisible = false"
          @submit="updateCloudItem()"
        />
      </v-dialog>
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
    VcsTextArea,
    VcsFormButton,
  } from '@vcmap/ui';
  import {
    computed,
    defineComponent,
    PropType,
    reactive,
    Ref,
    ref,
    toRaw,
    watch,
  } from 'vue';
  import {
    VCol,
    VContainer,
    VDialog,
    VRow,
    VSheet,
    VForm,
  } from 'vuetify/components';
  import ModuleEditor from './ModuleEditor.vue';
  import { Module, ModuleSelectorConfig, ModuleType } from '../index';
  import getDefaultOptions from '../defaultOptions.js';
  import WindowPositionSettings from './WindowPositionSettings.vue';
  import CloudModuleSelector from './CloudModuleSelector.vue';

  interface VcsListItemWithLabel extends VcsListItem {
    id: string;
    title: string;
    icon: string;
    type: string;
    moduleUrl?: string;
    description?: string;
    cards?: VcsListItemWithLabel[];
  }
  interface ModuleItem {
    id: string;
    title: string;
    icon: string;
    moduleUrl: string;
    description?: string;
  }

  export const windowIdConfigEditor = 'configEditor_window_id';
  export default defineComponent({
    name: 'ModuleSelectorConfigEditor',
    components: {
      VForm,
      VcsFormButton,
      VcsCheckbox,
      VDialog,
      VcsList,
      VcsFormSection,
      VRow,
      VSheet,
      VcsLabel,
      AbstractConfigEditor,
      VcsTextField,
      VCol,
      VContainer,
      ModuleEditor,
      WindowPositionSettings,
      VcsModuleTable: CloudModuleSelector,
      VcsTextArea,
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
      const level = ref<number>(0);
      const localConfig = ref<ModuleSelectorConfig | undefined>(undefined);
      const listItemArray: Ref<VcsListItemWithLabel[]> = ref([]);
      const currentGroup: Ref<VcsListItemWithLabel | undefined> =
        ref(undefined);
      const editingItem: Ref<ModuleItem> = ref({
        id: '',
        title: '',
        icon: '',
        moduleUrl: '',
        description: '',
      });
      const selectCloudItem: Ref<ModuleItem> = ref({
        id: '',
        title: '',
        icon: '',
        moduleUrl: '',
        description: '',
      });

      let selectedGroupItem: Module<ModuleType> = {
        title: '',
        icon: '',
        type: 'group',
        description: '',
        cards: [],
      };

      const selectCloudItemDialogVisible: Ref<boolean> = ref(false);
      const editingItemDialogVisible: Ref<boolean> = ref(false);
      const groupItemDialogVisible: Ref<boolean> = ref(false);
      const listItems: Ref<VcsListItemWithLabel[] | undefined> = ref(undefined);

      localConfig.value = {
        ...getDefaultOptions(),
        ...props.getConfig(),
      } as ModuleSelectorConfig;

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
          const { actions, id, name, ...configItem } = item;
          return {
            ...configItem,
            moduleUrl: item.moduleUrl || '',
          } as Module<'url'>;
        } else {
          const updatedCards =
            item.cards?.map((card) => {
              const { actions, id, name, ...configItem } = card;
              return {
                ...configItem,
              } as Module<'url'>;
            }) || [];
          const { actions, id, name, ...configItem } = item;
          return {
            ...configItem,
            ...(updatedCards.length ? { cards: updatedCards } : {}),
          } as Module<'group'>;
        }
      }

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
          id: `${moduleInfo.title || 'undefined'}-${index}`,
          name: moduleInfo.title,
          title: moduleInfo.title,
          icon: moduleInfo.icon,
          type: moduleInfo.type,
          description: moduleInfo.description,
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
                    description: item.description,
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
                    description: item.description,
                  };
                }
              }
              editingItemDialogVisible.value = true;
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
                  groupItemDialogVisible.value = true;
                  const [firstItem] = removeIdAndActionsFromArray([
                    currentGroup.value,
                  ]) as Module<'group'>[];
                  if (firstItem.cards.length === 0) {
                    firstItem.cards = [];
                  }
                  selectedGroupItem = structuredClone(firstItem);

                  headerActions.splice(2, 1);
                  if (headerActions.length > 1) {
                    headerActions[1].icon = '$vcsPlus';
                    headerActions[1].title =
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

      headerActions.push({
        name: 'moduleSelector.configEditor.addFromCloud',
        title: 'moduleSelector.configEditor.TooltipAddCloudModule',
        icon: '$vcsImport',
        callback(): void {
          selectCloudItem.value = {
            id: '',
            title: '',
            icon: '',
            moduleUrl: '',
            description: '',
          };
          selectCloudItemDialogVisible.value = true;
        },
      });

      const headerGroupAction = {
        name: 'moduleSelector.configEditor.addGroup',
        callback(): void {
          const newGroup = {
            type: 'group',
            title: '',
            icon: '',
            description: '',
            cards: [],
          };

          groupItemDialogVisible.value = true;
          const indexItem = listItemArray.value?.push(
            createListItem(
              newGroup as Module<'group'>,
              listItemArray.value.length,
            ),
          );

          currentGroup.value = listItemArray.value[indexItem - 1];
          groupItemDialogVisible.value = true;

          headerActions.splice(2, 1);
          if (headerActions.length > 1) {
            headerActions[1].icon = '$vcsPlus';
            headerActions[1].title =
              'moduleSelector.configEditor.TooltipAddModule';
          }
        },
      };
      if (localConfig.value?.modules) {
        listItemArray.value = localConfig.value.modules.map(createListItem);
      }

      headerActions.push(
        {
          name: 'moduleSelector.configEditor.add',
          callback(): void {
            editingItem.value = {
              id: '',
              title: '',
              icon: '',
              moduleUrl: '',
              description: '',
            };
            editingItemDialogVisible.value = true;
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
        const position = toRaw(localConfig.value?.position) as Record<
          string,
          unknown
        >;
        const isPositionDefined = Object.values(position).some(
          (value) => value !== undefined,
        );

        const config = {
          ...toRaw(localConfig.value),
          modules: removeIdAndActionsFromArray(listItemArray.value),
          basisModule: toRaw(basisModule.value),
        };

        if (isPositionDefined) {
          config.position = position;
        } else {
          delete config.position;
        }

        props.setConfig(config);
      };

      const updateItem = (): void => {
        if (currentGroup.value === undefined) {
          if (editingItem.value) {
            if (editingItem.value?.id !== '') {
              const item = listItemArray.value.find(
                (i) => i.id === editingItem.value?.id,
              );
              if (item) {
                Object.assign(item, {
                  ...editingItem.value,
                });
              }
            } else {
              listItemArray.value.push(
                createListItem(
                  {
                    ...editingItem.value,
                    type: 'url',
                  },
                  listItemArray.value.length,
                ),
              );
            }
          }
        } else if (editingItem.value && editingItem.value?.id !== '') {
          const item = currentGroup.value.cards!.find(
            (i) => i.id === editingItem.value.id,
          );
          if (item) {
            Object.assign(item, {
              ...editingItem.value,
            });
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
          currentGroup.value.cards!.push(
            createListItem(
              {
                ...editingItem.value,
                type: 'url',
              },
              currentGroup.value.cards!.length,
            ),
          );

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

        editingItem.value = {
          id: '',
          title: '',
          icon: '',
          moduleUrl: '',
          description: '',
        };
        editingItemDialogVisible.value = false;
      };

      const updateCloudItem = (): void => {
        if (currentGroup.value === undefined) {
          if (selectCloudItem.value) {
            listItemArray.value.push(
              createListItem(
                {
                  title: selectCloudItem.value.title,
                  icon: selectCloudItem.value.icon,
                  moduleUrl: selectCloudItem.value.moduleUrl,
                  type: 'url',
                  description: selectCloudItem.value.description,
                },
                listItemArray.value.length,
              ),
            );
          }
        } else {
          currentGroup.value.cards!.push(
            createListItem(
              {
                ...selectCloudItem.value,
                type: 'url',
              },
              currentGroup.value.cards!.length,
            ),
          );

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

        selectCloudItem.value = {
          id: '',
          title: '',
          icon: '',
          moduleUrl: '',
          description: '',
        };
        selectCloudItemDialogVisible.value = false;
      };

      const returnLevel = (): void => {
        groupItemDialogVisible.value = false;

        currentGroup.value = undefined;
        if (headerActions.length > 1) {
          delete headerActions[1].icon;
          delete headerActions[1].title;
        }
        headerActions.push(headerGroupAction);
      };

      const isRequired = (v: string): boolean | string => {
        return v && v.trim() !== ''
          ? true
          : 'moduleSelector.configEditor.error';
      };

      const isFormValid = ref();

      const cancelCurrentGroup = (): void => {
        const groupIndex = listItemArray.value.findIndex(
          (item) => item.id === currentGroup.value!.id,
        );
        if (selectedGroupItem.title !== '') {
          const newGroupItem = createListItem(selectedGroupItem, groupIndex);
          listItemArray.value.splice(groupIndex, 1, newGroupItem);
        } else {
          listItemArray.value.splice(groupIndex, 1);
        }

        groupItemDialogVisible.value = false;
        currentGroup.value = undefined;
        if (headerActions.length > 1) {
          delete headerActions[1].icon;
          delete headerActions[1].title;
        }
        headerActions.push(headerGroupAction);
      };

      return {
        isFormValid,
        editingItem,
        selectedGroupItem,
        groupItemDialogVisible,
        cancelCurrentGroup,
        selectCloudItem,
        editingItemDialogVisible,
        selectCloudItemDialogVisible,
        localConfig,
        listItemArray,
        currentGroup,
        apply,
        returnLevel,
        updateItem,
        updateCloudItem,
        level,
        listItems: listItems as unknown as unknown[],
        basisModule,
        basisModuleExists,
        headerActions,
        isRequired,
        moveItem({
          item,
          targetIndex,
        }: {
          item: VcsListItemWithLabel;
          targetIndex: number;
        }): void {
          const from = listItemArray.value?.indexOf(item);
          if (from !== targetIndex) {
            listItemArray.value?.splice(from, 1);
            listItemArray.value?.splice(targetIndex, 0, item);
          }
        },
        moveCard({
          item,
          targetIndex,
        }: {
          item: VcsListItemWithLabel;
          targetIndex: number;
        }): void {
          const from = currentGroup.value!.cards!.indexOf(item);
          if (from !== targetIndex) {
            currentGroup.value?.cards?.splice(from, 1);
            currentGroup.value?.cards?.splice(targetIndex, 0, item);
          }
        },
      };
    },
  });
</script>

<style scoped></style>
