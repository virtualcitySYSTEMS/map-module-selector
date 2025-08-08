import { VcsModule } from '@vcmap/core';
import type { VcsUiApp } from '@vcmap/ui';
import type { BasisModule, Module, ModuleType } from './index';

export async function loadModule(
  moduleUrl: string,
  app: VcsUiApp,
): Promise<void> {
  const config = await fetch(moduleUrl, {
    method: 'GET',
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return undefined;
  });

  if (config) {
    config._id = `moduleSelector_module_id`;
    const module = new VcsModule(config);
    await app.addModule(module);
  }
}

export async function unloadModule(app: VcsUiApp): Promise<void> {
  const moduleId = `moduleSelector_module_id`;
  const activeMapName = app.maps.activeMap?.name;
  const module = app.getModuleById(moduleId);
  if (module) {
    await app.removeModule(moduleId);
  }
  if (!app.maps.activeMap) {
    await app.maps.setActiveMap(activeMapName || [...app.maps][0]?.name);
  }
}

export const windowIdModuleSelector = 'moduleSelector_window_id';

export async function startApplication(
  mainModuleIndex: number | undefined | null,
  nestedModuleIndex: number | undefined | null,
  app: VcsUiApp,
  modules: Module<ModuleType>[],
  basisModule?: BasisModule,
): Promise<void> {
  await unloadModule(app);

  if (mainModuleIndex === null && !basisModule) {
    app.windowManager.remove(windowIdModuleSelector);
    return;
  }

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
}
