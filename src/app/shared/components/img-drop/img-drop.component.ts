import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ImgDropService } from '../../../core/services/img-drop.service';

@Component({
  selector: 'app-img-drop',
  standalone: true,
  imports: [NgxDropzoneModule, CommonModule],
  templateUrl: './img-drop.component.html',
  styleUrl: './img-drop.component.css'
})
export class ImgDropComponent {

  constructor(private imgdropService: ImgDropService) { }

  files: File[] = [];

  onSelect(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  upload() {
    if (this.files.length === 0) return false

    const file_data = this.files[0];
    const data = new FormData();

    data.append('file', file_data);
    data.append('upload_preset', 'nova_library');
    data.append('cloud_name', 'day1tsmdn');

    this.imgdropService.uploadImg(data).subscribe({
      next: (response: any) => {
        console.log(response)
        alert('Imagen cargada exitosamente!')
      }, error: (e: any) => {
        console.log(e)
      }
    })
    return true;
  }
}
