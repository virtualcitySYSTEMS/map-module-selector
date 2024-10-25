<template>
  <v-container class="py-0 px-1">
    <v-row
      no-gutters
      v-for="{ key, checkbox, input, placeholder } in inputs"
      :key="key"
    >
      <v-col>
        <VcsCheckbox
          :label="`appConfigurator.editors.featureInfo.window.position.${key}`"
          v-model="checkbox.value"
        />
      </v-col>
      <v-col>
        <VcsTextField
          clearable
          :disabled="!checkbox.value"
          :placeholder="placeholder"
          v-model.trim="input.value"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
  import {
    computed,
    defineComponent,
    PropType,
    Ref,
    WritableComputedRef,
  } from 'vue';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import {
    useModelHasProperty,
    useProxiedComplexModel,
    VcsCheckbox,
    VcsTextField,
    WindowPositionOptions,
  } from '@vcmap/ui';

  export default defineComponent({
    name: 'WindowPositionSettings',
    components: {
      VContainer,
      VRow,
      VCol,
      VcsCheckbox,
      VcsTextField,
    },
    props: {
      modelValue: {
        type: Object as PropType<WindowPositionOptions>,
        required: true,
      },
      positionKeys: {
        type: Array as PropType<(keyof WindowPositionOptions)[]>,
        default: () => ['height', 'maxHeight', 'width', 'maxWidth'],
      },
    },
    setup(props, { emit }) {
      const localValue: Ref<WindowPositionOptions> = useProxiedComplexModel(
        props,
        'modelValue',
        emit,
      );

      const inputs = computed(() => {
        return props.positionKeys.reduce(
          (acc, key) => {
            acc[key] = {
              key,
              checkbox: useModelHasProperty(localValue, key, null),
              input: computed({
                get() {
                  return localValue.value[key];
                },
                set(value) {
                  localValue.value[key] = value;
                },
              }),
              placeholder: 'auto',
            };
            return acc;
          },
          {} as Record<
            keyof WindowPositionOptions,
            {
              key: keyof WindowPositionOptions;
              checkbox: WritableComputedRef<boolean>;
              input: WritableComputedRef<string | number | undefined>;
              placeholder: string | null | undefined;
            }
          >,
        );
      });

      return {
        inputs,
      };
    },
  });
</script>

<style scoped></style>
