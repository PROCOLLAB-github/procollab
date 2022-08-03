import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'controlError'
})
export class ControlErrorPipe implements PipeTransform {

  transform(value: AbstractControl): boolean {
    return value.touched && value.invalid;
  }

}
