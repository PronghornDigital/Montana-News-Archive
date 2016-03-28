import { Record } from '../../../shared/record/record';
import { dToS, sToD } from '../../util/date';

export class LocationService {
  private _queryString: string = '';
  private _startDate: string = '';
  private _endDate: string = '';
  private _recordId: string = '';

  /**
   * The URLs for archives look like:
   *
   * /this+is+a+query+with+plus+for+space/01-02-1988+01-04-1988/tape_id
   */
  constructor(private _location: ng.ILocationService) {
    const path = this._location.path() || '//+/';
    const pathParts = path.substring(1).split('/');
    this._queryString = pathParts[0] || '';
    this._recordId = pathParts[2] || '';
    const dateParts = (pathParts[1] || '+').split('+');
    this._startDate = dateParts[0];
    this._endDate = dateParts[1];
  }

  get hasRecordId(): boolean {
    return this._recordId !== '';
  }

  get hasSearch(): boolean {
    return this._queryString !== '' ||
      this._startDate !== '' ||
      this._endDate !== '';
  }

  get queryString(): string {
    return this._queryString;
  }

  set queryString(query: string) {
    this._queryString = query;
    this._location.path(this.buildPath());
  }

  set current(record: Record) {
    this._recordId = record ? record.id : '';
    this._location.path(this.buildPath());
  }

  get currentId(): string {
    return this._recordId;
  }

  set startDate(d: Date) {
    this._startDate = d ? dToS(d) : '';
  }
  get startDate(): Date {
    return sToD(this._startDate);
  }

  set endDate(d: Date) {
    this._endDate = d ? dToS(d) : '';
  }

  get endDate(): Date {
    return sToD(this._endDate);
  }

  buildPath(): string {
    const datePart = `${this._startDate}+${this._endDate}`;
    const recordId = this.hasRecordId ? `${this._recordId}` : '';
    return `/${this.encodeQueryString()}/${datePart}/${recordId}`;
  }

  encodeQueryString(): string {
    return this._queryString.replace(' ', '+');
  }

  static $inject: string[] = ['$location'];
  static serviceName: string = 'ArchiveLocationService';
  static module: ng.IModule = angular.module('LocationServiceModule', [])
    .service(LocationService.serviceName, LocationService);
}
