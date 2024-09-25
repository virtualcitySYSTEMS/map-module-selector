// eslint-disable-next-line import/prefer-default-export
import { VcsModule } from '@vcmap/core';
import { VcsUiApp } from '@vcmap/ui';

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
  const module = app.getModuleById(moduleId);
  if (module) {
    await app.removeModule(moduleId);
  }
}
