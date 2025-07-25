import { merge, Observable, Observer, Subject } from 'rxjs';
type PipeLike<T> = Observable<T>['pipe'];
export class Subjectifier<T> extends Observable<T>{
  private _subj = new Subject<T>();
  private merged = merge(this._source, this._subj);
  constructor(private _source: Observable<T>){
    super((obs: Observer<T>) => {
      const s = merge( _source, this._subj ).subscribe(obs);
      return s;
    });
  }
  next: Subject<T>['next'] = this._subj.next.bind(this._subj);
  newSubj = (...operations: Parameters<PipeLike<T>>) =>
    new Subjectifier(this.merged.pipe(...operations));
}