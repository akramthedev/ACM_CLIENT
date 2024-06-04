import { Component, OnInit } from '@angular/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent implements OnInit {

  public category = [{ id: 1, name: "Life Style" }, { id: 2, name: "Travel" }];
  public selectedCategory: string[] = [];
  public files: File[] = [];
  public editor: Editor;
  public html = '';

  public config: DropzoneConfigInterface = {
    clickable: true,
    maxFiles: 1,
    addRemoveLinks: true,
    autoReset: null,
    errorReset: null,
    cancelReset: null
  };




  constructor() { }

  replaceFile() {
    this.files.splice(0, 1);
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
    if (this.files.length > 1) {
      this.replaceFile();
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

}
