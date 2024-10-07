<template>
  <v-sheet class="module-selector" elevation="1">
    <v-container>
      <v-row class="justify-center align-center" no-gutters>
        <v-col
          cols="auto"
          class="pa-2"
          v-if="basisModule && !nestedCards.length"
        >
          <v-card class="pa-3 fixed-card selected-card" outlined>
            <v-icon v-if="basisModule.icon" size="50">{{
              basisModule.icon
            }}</v-icon>
            <v-card-title class="text-center">{{
              $st(basisModule.title)
            }}</v-card-title>
          </v-card>
        </v-col>
        <template v-if="!nestedCards.length">
          <v-col
            cols="auto"
            class="pa-2"
            :key="index"
            v-for="(module, index) in modules"
          >
            <v-card
              class="fixed-card hover-card"
              outlined
              :class="{
                'selected-card': plugin.selectedMainModuleIndex.value === index,
              }"
              @click="selectModule(index)"
            >
              <v-icon v-if="module.icon" size="50">{{ module.icon }}</v-icon>
              <v-card-title class="text-center">{{
                $st(module.title)
              }}</v-card-title>
            </v-card>
          </v-col>
        </template>

        <template v-else>
          <v-col cols="auto" class="pa-2">
            <v-card
              class="fixed-card hover-card"
              outlined
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
              outlined
              :class="{
                'selected-card':
                  plugin.selectedNestedModuleIndex.value === index,
              }"
              @click="selectNestedModule(index)"
            >
              <v-icon v-if="card.icon" size="50">{{ card.icon }}</v-icon>
              <v-card-title class="text-center">{{
                $st(card.title)
              }}</v-card-title>
            </v-card>
          </v-col>
        </template>
      </v-row>
      <v-row justify="end">
        <VcsFormButton
          variant="filled"
          class="ma-5"
          @click="startApplication"
          :disabled="isButtonDisabled"
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
  } from 'vuetify/components';
  import { VcsFormButton, VcsUiApp } from '@vcmap/ui';
  import { computed, defineComponent, inject, PropType } from 'vue';
  import { loadModule, unloadModule } from './moduleHelper.js';
  import { name } from '../package.json';
  import { BasisModule, ModuleSelectorPlugin, ModuleType } from './index.js';
  import type { Module } from './index.ts';

  export const windowIdModuleSelector = 'moduleSelector_window_id';
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

      const startApplication = async (): Promise<void> => {
        await unloadModule(app);

        const mainModuleIndex = plugin.selectedMainModuleIndex.value;
        const nestedModuleIndex = plugin.selectedNestedModuleIndex.value;

        if (mainModuleIndex === null && !props.basisModule) return;

        const mainModule = modules[mainModuleIndex!];
        const nestedModule =
          mainModule?.type === 'group'
            ? mainModule.cards?.[nestedModuleIndex!]
            : null;

        if (nestedModule?.moduleUrl) {
          await loadModule(nestedModule.moduleUrl, app);
        } else if (mainModule?.type === 'url') {
          await loadModule(mainModule.moduleUrl, app);
        }

        app.windowManager.remove(windowIdModuleSelector);
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
        startApplication,
        isButtonDisabled,
      };
    },
  });
</script>

<style scoped>
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
</style>
