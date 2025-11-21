import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fixedMaskData',
  standalone: true,
})
export class FixedMaskDataPipe implements PipeTransform {
  transform(val: string | number, dataType?: string): string | number {
    if (val) {
      let valueArray: string[] = [];
      let firstVisibleVals: string | number = '';
      let lastVisibleVals: string | number = '';
      let suffix: string | number = '';
      let shouldMask: boolean = true;

      if (dataType === 'email') {
        const valArray = `${val}`.split('@');
        valueArray = valArray;

        if (valArray?.length > 2) {
          valueArray = valueArray.slice(0, -1);
          if (valueArray[0]?.length > 3) {
            firstVisibleVals = valueArray[0].slice(0, 2);
          } else {
            firstVisibleVals = valueArray[0];
          }

          if (valueArray[valueArray?.length - 1]?.length > 3) {
            lastVisibleVals = valueArray[valueArray?.length - 1].slice(-2);
          } else {
            lastVisibleVals = '';
            shouldMask = false;
          }
          suffix = valArray.pop() || '';
        } else {
          if (valueArray[0]?.length > 3) {
            firstVisibleVals = valueArray[0].slice(0, 2);
            lastVisibleVals = valueArray[0].slice(-2);
          } else {
            firstVisibleVals = valueArray[0];
            lastVisibleVals = '';
            shouldMask = false;
          }
          suffix = valueArray[1];
        }
      } else {
        if (`${val}`?.length > 3) {
          firstVisibleVals = `${val}`.slice(0, 2);
          lastVisibleVals = `${val}`.slice(-3);
        } else {
          firstVisibleVals = `${val}`;
          lastVisibleVals = '';
          shouldMask = false;
        }
      }

      return dataType === 'email'
        ? `${firstVisibleVals}${shouldMask ? '*****' : ''}${lastVisibleVals}@${suffix}`
        : `${firstVisibleVals}${shouldMask ? '*****' : ''}${lastVisibleVals}`;
    } else {
      return val;
    }
  }
}
