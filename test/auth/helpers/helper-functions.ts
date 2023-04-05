export const helperFunctionsForTesting = {
  generateString(len: number) {
    let str = '';
    let i = 0;
    while (i < len) {
      str += '1';
      i++;
    }
    return str;
  },
};
