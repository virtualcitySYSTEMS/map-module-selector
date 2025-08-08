<template>
  <v-card>
    <VcsFormSection>
      <v-form ref="form">
        <v-container class="px-2 pt-0 pb-2">
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="layerName">
                {{ $st('layerSlider.configEditor.layerName') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsSelect
                id="layerName"
                v-model="localModuleOptions.moduleName"
                :items="moduleLocal"
                placeholder="layer"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-divider />
      <div class="d-flex pa-2">
        <VcsFormButton @click="$emit('close')">
          {{ $st('components.close') }}
        </VcsFormButton>
        <VcsFormButton
          class="justify-end relativePosition"
          :disabled="!isFormValid"
          variant="filled"
          @click="
            () => {
              $emit('update:modelValue', localModuleOptions);
              $emit('close');
            }
          "
        >
          {{ $st('components.apply') }}
        </VcsFormButton>
      </div>
    </VcsFormSection>
  </v-card>
</template>

<script lang="ts">
  import {
    VcsFormButton,
    VcsFormSection,
    VcsLabel,
    VcsSelect,
  } from '@vcmap/ui';
  import {
    VCard,
    VDivider,
    VContainer,
    VForm,
    VCol,
    VRow,
  } from 'vuetify/components';
  import type { PropType } from 'vue';
  import { defineComponent, ref } from 'vue';

  interface ModuleOptions {
    moduleName: string | undefined;
  }

  export default defineComponent({
    name: 'ModuleSelectorEdit',
    title: 'Module Editor',
    components: {
      VcsSelect,
      VcsLabel,
      VCol,
      VRow,
      VForm,
      VContainer,
      VcsFormButton,
      VDivider,
      VCard,
      VcsFormSection,
    },
    props: {
      modelValue: { type: Object as PropType<ModuleOptions>, required: true },
    },
    emits: ['update:modelValue', 'close'],
    setup(props) {
      const localModuleOptions = ref(structuredClone(props.modelValue));
      const isFormValid = ref(false);

      const moduleLocal = ref();

      return { localModuleOptions, moduleLocal, isFormValid };
    },
  });
</script>

<style>
  .relativePosition {
    margin-left: 7em;
  }
</style>
