import { ModuleWithProviders } from '@angular/core';

declare module 'ngx-tabset/src/modules/ngx-tabset.module' {
  export class TabsModule {
    static forRoot(): ModuleWithProviders<any>;
    static forChild(): ModuleWithProviders<any>;
  }
}