/** @format */
import { Observable } from "rxjs";
import { InstanceConfig } from "../instance.model";

export abstract class InstanceRepositoryPort {
  abstract config(): Observable<InstanceConfig>;
}
