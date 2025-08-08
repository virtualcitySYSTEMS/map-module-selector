<template>
  <v-sheet class="module-selector" elevation="1">
    <v-container>
      <v-row class="justify-center align-center" no-gutters>
        <v-col
          v-if="basisModule && !nestedCards.length"
          cols="auto"
          class="pa-2"
        >
          <v-card class="pa-3 fixed-card selected-card" variant="outlined">
            <v-tooltip :max-width="300">
              <template #activator="{ props }">
                <v-icon
                  v-if="basisModule.description"
                  class="top-left-icon"
                  v-bind="props"
                  >{{ '$vcsInfo' }}
                </v-icon>
              </template>
              <span>{{ $st(basisModule.description) }}</span>
            </v-tooltip>
            <v-icon v-if="basisModule.icon" size="50">
              {{ basisModule.icon }}
            </v-icon>

            <v-card-title class="text-center">
              {{ $st(basisModule.title) }}
            </v-card-title>
          </v-card>
        </v-col>
        <template v-if="!nestedCards.length">
          <v-col
            v-for="(module, index) in modules"
            :key="index"
            cols="auto"
            class="pa-2"
          >
            <v-card
              class="fixed-card hover-card"
              variant="outlined"
              :class="{
                'selected-card': plugin.selectedMainModuleIndex.value === index,
                'pr-3': module.type === 'group',
              }"
              @click="selectModule(index)"
            >
              <v-tooltip :max-width="300">
                <template #activator="{ props }">
                  <v-icon
                    v-if="module.description"
                    class="top-left-icon"
                    :class="{
                      selected: plugin.selectedMainModuleIndex.value === index,
                    }"
                    v-bind="props"
                    >{{ '$vcsInfo' }}
                  </v-icon>
                </template>
                <span>{{ $st(module.description) }}</span>
              </v-tooltip>
              <v-card
                v-if="module.type === 'group' && module.cards"
                class="intermediate-card"
                variant="outlined"
                :class="{
                  'selected-card':
                    plugin.selectedMainModuleIndex.value === index,
                  'pr-3': module.type === 'group',
                }"
              >
                <v-card
                  :variant="
                    module.type === 'group' && module.cards
                      ? 'outlined'
                      : undefined
                  "
                  :class="{
                    'selected-card':
                      plugin.selectedMainModuleIndex.value === index,
                    groupCard: module.type === 'group',
                    innerCard: module.type === 'group',
                  }"
                >
                  <v-icon v-if="module.icon" size="50" class="groupIcon">
                    {{ module.icon }}
                  </v-icon>
                  <v-card-title class="text-center groupTitle">
                    {{ $st(module.title) }}
                  </v-card-title>
                </v-card></v-card
              >
              <template v-else>
                <v-icon v-if="module.icon" size="50">
                  {{ module.icon }}
                </v-icon>
                <v-card-title class="text-center">
                  {{ $st(module.title) }}
                </v-card-title>
              </template>
            </v-card>
          </v-col>
        </template>

        <template v-else>
          <v-col cols="auto" class="pa-2">
            <v-card
              class="fixed-card hover-card"
              variant="outlined"
              @click="showMainCards()"
            >
              <v-icon size="50">mdi-arrow-left</v-icon>
              {{ $st('moduleSelector.cardBack') }}
            </v-card>
          </v-col>
          <v-col
            v-for="(card, index) in nestedCards"
            :key="index"
            cols="auto"
            class="pa-2"
          >
            <v-card
              class="fixed-card hover-card"
              variant="outlined"
              :class="{
                'selected-card':
                  plugin.selectedNestedModuleIndex.value === index,
              }"
              @click="selectNestedModule(index)"
            >
              <v-tooltip :max-width="300">
                <template #activator="{ props }">
                  <v-icon
                    v-if="card.description"
                    class="top-left-icon"
                    v-bind="props"
                    >{{ '$vcsInfo' }}
                  </v-icon>
                </template>
                <span>{{ $st(card.description) }}</span>
              </v-tooltip>

              <v-icon v-if="card.icon" size="50">{{ card.icon }}</v-icon>
              <v-card-title class="text-center">{{
                $st(card.title)
              }}</v-card-title>
            </v-card>
          </v-col>
        </template>
      </v-row>
      <v-row class="fixed-bottom" justify="end">
        <VcsFormButton
          variant="filled"
          class="ma-5"
          :disabled="isButtonDisabled"
          @click="
            startApplication(
              plugin.selectedMainModuleIndex.value,
              plugin.selectedNestedModuleIndex.value,
              app,
              modules,
              basisModule,
            )
          "
        >
          {{ $st('moduleSelector.startButton') }}
        </VcsFormButton>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script lang="ts">
  import {
    VSheet,
    VContainer,
    VRow,
    VCol,
    VCard,
    VIcon,
    VCardTitle,
    VTooltip,
  } from 'vuetify/components';
  import type { VcsUiApp } from '@vcmap/ui';
  import { VcsFormButton } from '@vcmap/ui';
  import type { PropType } from 'vue';
  import { computed, defineComponent, inject } from 'vue';
  import { name } from '../package.json';
  import type {
    BasisModule,
    ModuleSelectorPlugin,
    ModuleType,
    Module,
  } from './index.js';
  import { startApplication } from './moduleHelper';

  export default defineComponent({
    name: 'ModuleSelector',
    components: {
      VSheet,
      VContainer,
      VRow,
      VCol,
      VCard,
      VIcon,
      VCardTitle,
      VcsFormButton,
      VTooltip,
    },
    props: {
      modules: {
        type: Array as PropType<Module<ModuleType>[]>,
        required: true,
      },
      basisModule: {
        type: Object as PropType<BasisModule>,
        required: false,
        default: undefined,
      },
      requireModuleSelection: {
        type: Boolean as PropType<boolean>,
        required: false,
        default: false,
      },
    },
    setup(props) {
      const app = inject('vcsApp') as VcsUiApp;
      const plugin = app.plugins.getByKey(name) as ModuleSelectorPlugin;
      const { modules } = props;

      const nestedCards = computed(() => {
        const module = props.modules[plugin.selectedMainModuleIndex.value!];
        if (module?.type === 'group') {
          return module.cards;
        }
        return [];
      });

      const selectModule = (index: number): void => {
        if (plugin.selectedMainModuleIndex.value === index) {
          plugin.selectedMainModuleIndex.value = null;
        } else {
          plugin.selectedMainModuleIndex.value = index;
        }
      };

      const selectNestedModule = (index: number): void => {
        if (plugin.selectedNestedModuleIndex.value === index) {
          plugin.selectedNestedModuleIndex.value = null;
        } else {
          plugin.selectedNestedModuleIndex.value = index;
        }
      };

      const showMainCards = (): void => {
        // Reset selected module when showing main cards
        plugin.selectedNestedModuleIndex.value = null;
        plugin.selectedMainModuleIndex.value = null;
      };

      const isButtonDisabled = computed(() => {
        if (!props.requireModuleSelection) return false;

        const mainModuleIndex = plugin.selectedMainModuleIndex.value;
        const nestedModuleIndex = plugin.selectedNestedModuleIndex.value;
        const mainModule = modules[mainModuleIndex!];

        return (
          mainModuleIndex == null ||
          (mainModule?.type === 'group' &&
            mainModule.cards &&
            nestedModuleIndex == null)
        );
      });

      return {
        nestedCards,
        plugin,
        selectModule,
        selectNestedModule,
        showMainCards,
        isButtonDisabled,
        app,
      };
    },
    methods: { startApplication },
  });
</script>

<style lang="scss" scoped>
  .v-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 150px;
    width: 150px; /* Ensure width and height are equal */
    aspect-ratio: 1; /* Maintain the square ratio */
    transition: background-color 0.3s;
  }
  .fixed-card {
    height: 150px;
    width: 150px;
    aspect-ratio: 1; /* Ensures the card remains square */
  }

  .selected-card {
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
  }

  .top-left-icon {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 10;
    cursor: pointer;
    color: rgb(var(--v-theme-on-surface));
  }
  .top-left-icon.selected {
    color: rgb(var(--v-theme-on-primary));
  }

  .groupCard {
    width: 146px;
    background-color: rgb(var(--v-theme-surface));
    border: none !important; /* Removes all borders */
    border-right: 1px solid !important; /* Adds a border to the right */
  }
  .intermediate-card {
    width: 148px;
    background-color: rgb(var(--v-theme-surface));
    border: none !important; /* Removes all borders */
    border-right: 1px solid !important; /* Adds a border to the right */
  }
  .groupTitle {
    margin-left: 20px !important;
  }
  .groupIcon {
    margin-left: 20px !important;
  }
  .fixed-bottom {
    position: sticky;
    bottom: 0;
    background-color: rgb(var(--v-theme-surface));
    z-index: 10;
  }
</style>
