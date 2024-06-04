import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OwlCarouselComponent } from './owl-carousel/owl-carousel.component';
import { ScrollableComponent } from './scrollable/scrollable.component';
import { DropzoneComponent } from './dropzone/dropzone.component';
import { SweetAlert2Component } from './sweet-alert2/sweet-alert2.component';
import { StickyComponent } from './sticky/sticky.component';
import { ImageCropperComponent } from './image-cropper/image-cropper.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'scrollable',
        component: ScrollableComponent
      },
      {
        path: 'dropzone',
        component: DropzoneComponent
      },
      {
        path: 'sweetAlert2',
        component: SweetAlert2Component
      },
      {
        path: 'owl-carousel',
        component: OwlCarouselComponent
      },
      {
        path: 'image-cropper',
        component: ImageCropperComponent
      },

      {
        path: 'sticky',
        component: StickyComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvanceRoutingModule { }
