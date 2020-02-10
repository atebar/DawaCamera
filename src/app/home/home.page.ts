import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFirestore} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  optionsCamera: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  optionsGallery = {
    maximumImagesCount: 10,
    width:800,
    height:800,
    quality:100,
    outputType:0
  }

  constructor(private camera: Camera,
              private imagePicker: ImagePicker,
              private geolocation: Geolocation,
              private toastService:ToastService,
              private db:AngularFirestore,
              private storage:AngularFireStorage) {}

  openCamera(){
    this.camera.getPicture(this.optionsCamera).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      console.log(base64Image);

      let imageObject={
        id_wc:this.db.createId(),
        id:this.db.createId(),
        url:""
      }

     let photoName = `wc/${imageObject.id_wc}/${imageObject.id}`;

     console.log(photoName);
     this.toastService.presentToast(photoName);

     const fileRef = this.storage.ref(photoName);

     const task = fileRef.putString(base64Image,'data_url');

     task.snapshotChanges().pipe(
       finalize(() => {
         fileRef.getDownloadURL().subscribe(url => {
          imageObject.url=url;
          console.log(imageObject.url);
          this.toastService.presentToast(imageObject.url);
         })
       })).subscribe();

     }, (err) => {
      // Handle error
      console.log(err);
     });
  }

  openGallery(){
    this.imagePicker.getPictures(this.optionsGallery).then((results) => {
      for (var i = 0; i < results.length; i++) {
          console.log('Image URI: ' + results[i]);
      }
    }, (err) => { alert(err) });
  }

  geolocationFunction(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.toastService.presentToast("latitude: " + resp.coords.latitude + " Longitude: " + resp.coords.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
}
