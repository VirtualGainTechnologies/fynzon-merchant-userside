import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ipv4AddressValidator(purpose: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    //allow empty input
    if (!control.value) return null;

    const value = control.value.trim();

    const ipList = value.split(',').map((ip) => ip.trim());

    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/;

    if (purpose === 'ADD') {
      // Ensure spaces are not used instead of commas
      if (/\d+\.\d+\.\d+\.\d+\s+\d+\.\d+\.\d+\.\d+/.test(value)) {
        return {
          missingComma: 'Each IP must be separated by a comma!',
        };
      }

      // Ensure no consecutive, leading, or trailing commas
      if (/^,|,,|,$/.test(control.value)) {
        return {
          invalidCommaFormat: 'Invalid comma placement in input!',
        };
      }

      //chekc max 3 ip
      if (ipList.length > 3) {
        return {
          maxIpCountIncreased: 'You can enter up to 3 IP addresses only!',
        };
      }

      // Validate each IP address
      const uniqueIP = new Set<string>();
      for (const [index, ip] of ipList.entries()) {
        if (!ipRegex.test(ip)) {
          return {
            invalidIp: `Invalid IP address format at position ${index + 1}!`,
          };
        }

        if (uniqueIP.has(ip)) {
          return { duplicateIp: `${ip} appears more than once!` };
        }

        uniqueIP.add(ip);
      }
    } else {
      if (ipList.length > 1) {
        return {
          ipCountExceeded: 'Only one IP is allowed to update at a time',
        };
      }

      if (!ipRegex.test(ipList[0])) {
        return {
          invalidIp: 'Invalid IP address format',
        };
      }
    }

    // Valid input
    return null;
  };
}