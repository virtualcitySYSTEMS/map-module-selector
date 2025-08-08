<template>
  <v-container class="py-0 px-1">
    <v-row
      v-for="{ key, checkbox, input, placeholder } in inputs"
      :key="key"
      no-gutters
    >
      <v-col>
        <VcsCheckbox
          v-model="checkbox.value"
          :label="`appConfigurator.editors.featureInfo.window.position.${key}`"
        />
      </v-col>
      <v-col>
        <VcsTextField
          v-model.trim="input.value"
          clearable
          :disabled="!checkbox.value"
          :placeholder="placeholder"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
  import type { PropType, Ref, WritableComputedRef } from 'vue';
  import { computed, defineComponent } from 'vue';
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import type { WindowPositionOptions } from '@vcmap/ui';
  import {
    useModelHasProperty,
    useProxiedComplexModel,
    VcsCheckbox,
    VcsTextField,
  } from '@vcmap/ui';

  export default defineComponent({
    name: 'WindowPositionSettings',
    components: { VContainer, VRow, VCol, VcsCheckbox, VcsTextField },
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
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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

      return { inputs };
    },
  });
</script>

<style scoped></style>
