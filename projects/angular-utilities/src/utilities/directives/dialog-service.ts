import { Injectable} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})

export class DialogService {
  allOpenOpDialogs: MatDialogRef<any>[] = [];

  addDialogRef(ref: MatDialogRef<any>) {
    this.allOpenOpDialogs.push(ref);
  }

  removeDialogRef(ref: MatDialogRef<any>) {
    this.allOpenOpDialogs = this.allOpenOpDialogs.filter(rf => ref.id !== rf.id);
  }

  closeAllOpDialogs() {
    this.allOpenOpDialogs.forEach(ref => ref.close());
  }
}
