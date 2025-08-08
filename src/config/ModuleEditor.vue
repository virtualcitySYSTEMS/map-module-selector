<template>
  <v-card>
    <VcsFormSection heading="moduleSelector.configEditor.moduleSettings">
      <v-form ref="form" v-model="isFormValid">
        <v-container class="px-2 pt-0 pb-2">
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel required html-for="moduleName">
                {{ $st('moduleSelector.configEditor.moduleName') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextField
                id="moduleName"
                v-model="localModuleOptions.title"
                placeholder="Module Name"
                :rules="[requiredRule]"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel required html-for="moduleIcon">
                {{ $st('moduleSelector.configEditor.moduleIcon') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextField
                id="moduleIcon"
                v-model="localModuleOptions.icon"
                placeholder="Icon Name"
                :rules="[requiredRule]"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel required html-for="moduleUrl">
                {{ $st('moduleSelector.configEditor.moduleUrl') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextField
                id="moduleUrl"
                v-model="localModuleOptions.moduleUrl"
                placeholder="URL"
                :rules="[requiredRule]"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="moduleDescription">
                {{ $st('moduleSelector.configEditor.moduleDescription') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextArea
                id="moduleDescription"
                v-model="localModuleOptions.description"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-divider />
      <div class="d-flex gc-2 w-100 justify-end pa-2">
        <VcsFormButton
          :disabled="!isFormValid"
          variant="filled"
          @click="
            () => {
              $emit('submit', localModuleOptions);
            }
          "
        >
          {{ $st('components.apply') }}
        </VcsFormButton>
        <VcsFormButton @click="$emit('close')">
          {{ $st('components.cancel') }}
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
    VcsTextField,
    VcsTextArea,
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

  export default defineComponent({
    name: 'ModuleEditor',
    components: {
      VcsTextField,
      VcsLabel,
      VCol,
      VRow,
      VForm,
      VContainer,
      VcsFormButton,
      VDivider,
      VCard,
      VcsFormSection,
      VcsTextArea,
    },
    props: {
      modelValue: {
        type: Object as PropType<{
          id: string;
          title: string;
          icon: string;
          moduleUrl: string;
          description?: string;
        }>,
        required: true,
      },
    },
    emits: ['submit', 'close'],
    setup(props) {
      const localModuleOptions = ref(props.modelValue); // structuredClone
      const isFormValid = ref(false);

      const validateForm = (): void => {
        isFormValid.value = !!localModuleOptions.value.title;
      };

      const requiredRule = (value: string): string | boolean =>
        !!value || 'moduleSelector.configEditor.editorError';

      return { localModuleOptions, isFormValid, validateForm, requiredRule };
    },
  });
</script>

<style></style>
