<template>
  <v-card>
    <VcsFormSection heading="moduleSelector.configEditor.moduleSettings">
      <v-form v-model="isFormValid" ref="form">
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
                placeholder="Module Name"
                v-model="localModuleOptions.title"
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
                placeholder="Icon Name"
                v-model="localModuleOptions.icon"
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
                placeholder="URL"
                v-model="localModuleOptions.moduleUrl"
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
          @click="
            () => {
              $emit('submit', localModuleOptions);
            }
          "
          variant="filled"
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
  import { defineComponent, PropType, ref } from 'vue';

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
    setup(props) {
      const localModuleOptions = ref(props.modelValue); // structuredClone
      const isFormValid = ref(false);

      const validateForm = (): void => {
        isFormValid.value = !!localModuleOptions.value.title;
      };

      const requiredRule = (value: string): string | boolean =>
        !!value || 'moduleSelector.configEditor.editorError';

      return {
        localModuleOptions,
        isFormValid,
        validateForm,
        requiredRule,
      };
    },
  });
</script>

<style></style>
